from django.conf.urls import url

from .views import tutorial

urlpatterns = [
    url(r'^tutorial/$', tutorial, name='tutorial')
]
