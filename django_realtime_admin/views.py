import json

from django.core import serializers
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt


def handle_model_updates(model):
    def handle_updates(request):
        return 1
    return handle_updates
