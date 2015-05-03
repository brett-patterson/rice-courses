from django.conf.urls import patterns, url

from courses import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='courses'),
    url(r'^api/courses/$', views.courses),
    url(r'^api/sections/$', views.get_sections),
    url(r'^api/subjects/$', views.get_subjects),
)
