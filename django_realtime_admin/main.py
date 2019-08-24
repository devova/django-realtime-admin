import json

import django_eventstream.views
from django.conf.urls import url
from django.contrib.admin import ModelAdmin
from django.contrib.admin.templatetags.admin_list import results
from django.contrib.admin.views.main import ChangeList
from django.core import serializers
from django.shortcuts import render
from django.utils.http import urlencode

from django_realtime_admin.utils import get_channel_name_for_model, register_post_save_hook


class RealTimeModelAdmin(ModelAdmin):
    realtime = True
    change_list_template = 'admin/django_realtime_admin/change_list.html'

    def __init__(self, model, *args, **kwargs):
        super().__init__(model, *args, **kwargs)
        register_post_save_hook(model)

    def updates_pk(self, obj):
        return obj.pk

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        return [
            url(r'^(?P<obj_id>\d+)/updates/', django_eventstream.views.events,
                {'format-channels': [get_channel_name_for_model(self.model)]},
                name='%s_%s_updates' % info),
            url(r'^(?P<obj_id>\d+)/row/', self.obj_row, name='%s_%s_row' % info)
        ] + super().get_urls()

    def obj_row(self, request, obj_id):
        body = json.loads(request.body)
        item = next(serializers.deserialize('python', body['data']))

        list_display = self.get_list_display(request)
        list_display_links = self.get_list_display_links(request, list_display)
        list_filter = self.get_list_filter(request)
        search_fields = self.get_search_fields(request)
        list_select_related = self.get_list_select_related(request)

        # Check actions to see if any are available on this changelist
        actions = self.get_actions(request)
        if actions:
            # Add the action checkboxes if there are any actions available.
            list_display = ['action_checkbox'] + list(list_display)

        cl = SimpleRowChangeList(
            request, self.model, list_display,
            list_display_links, list_filter, self.date_hierarchy,
            search_fields, list_select_related, 1,
            self.list_max_show_all, self.list_editable, self, item=item.object
        )
        cl.formset = None
        if cl.list_editable:
            FormSet = self.get_changelist_formset(request)
            cl.formset = FormSet(queryset=cl.result_list)

        result = next(results(cl))
        return render(request, 'admin/django_realtime_admin/row.html',
                      {'result': result, 'class_name': body['className']})

    def get_preserved_filters(self, request):
        """
        Returns the preserved filters querystring.
        """
        match = request.resolver_match
        if self.preserve_filters and match:
            opts = self.model._meta
            current_url = '%s:%s' % (match.app_name, match.url_name)
            changelist_url = 'admin:%s_%s_changelist' % (opts.app_label, opts.model_name)
            row_url = 'admin:%s_%s_row' % (opts.app_label, opts.model_name)
            if current_url == changelist_url or current_url == row_url:
                preserved_filters = request.GET.urlencode()
            else:
                preserved_filters = request.GET.get('_changelist_filters')

            if preserved_filters:
                return urlencode({'_changelist_filters': preserved_filters})
        return ''


class SimpleRowChangeList(ChangeList):
    """
    Instance of the class should be able to passed into
    django.contrib.admin.templatetags.admin_list.items_for_result
    """
    def __init__(self, *args, **kwargs):
        self.result_list = [kwargs.pop('item')]
        self.result_count = 1
        super().__init__(*args, **kwargs)

    def get_results(self, request):
        pass
