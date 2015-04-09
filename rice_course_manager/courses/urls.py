from django.conf.urls import patterns, url

from courses import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='courses'),
    url(r'^api/all/$', views.all),
    url(r'^api/sections/$', views.get_sections)
)
