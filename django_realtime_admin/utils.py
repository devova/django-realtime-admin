from django.core import serializers
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_eventstream import send_event

OBJECT_CHANNEL_FORMAT = 'updates:{}:{}'


def get_channel_name_for_model(model):
    return OBJECT_CHANNEL_FORMAT.format(model._meta.app_label, model._meta.model_name) + ':{obj_id}'


def get_channel_name_for_instance(obj):
    return get_channel_name_for_model(obj.__class__).format(obj_id=obj.id)


def register_post_save_hook(model):
    @receiver(post_save, sender=model, weak=False)
    def send_updates(sender, instance, **kwargs):
        channel = get_channel_name_for_instance(instance)
        send_event(channel, 'json', serializers.serialize('python', [instance]))
    return send_updates
