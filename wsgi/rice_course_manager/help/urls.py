from django.conf.urls import patterns, url

from help import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='help'),
    url(r'^api/tutorial/$', views.tutorial, name='tutorial')
)
