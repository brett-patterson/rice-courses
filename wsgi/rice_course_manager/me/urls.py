from django.conf.urls import patterns, url

from me import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='me'),
    url(r'^api/export/(?P<scheduler_name>\w+[\w\s]*)$', views.export),
    url(r'^api/courses/$', views.courses),
    url(r'^api/courses/add/$', views.add_course),
    url(r'^api/courses/remove/$', views.remove_course),
    url(r'^api/alternate/$', views.suggest_alternate),
    url(r'^api/scheduler/all/$', views.schedulers),
    url(r'^api/scheduler/add/$', views.add_scheduler),
    url(r'^api/scheduler/remove/$', views.remove_scheduler),
    url(r'^api/scheduler/set/$', views.set_shown),
    url(r'^api/scheduler/map/$', views.show_map),
    url(r'^api/scheduler/rename/$', views.rename),
)
