from django.template import Library

register = Library()


@register.filter
def join_ids(values):
    return '/'.join(str(val.pk) for val in values)
