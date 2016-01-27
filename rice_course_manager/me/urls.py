from django.conf.urls import url

from me import views

urlpatterns = [
    url(r'^courses/$', views.courses),
    url(r'^courses/add/$', views.add_course),
    url(r'^courses/remove/$', views.remove_course),
    url(r'^alternate/$', views.suggest_alternate),
    url(r'^scheduler/all/$', views.schedulers),
    url(r'^scheduler/export/$', views.export_scheduler),
    url(r'^scheduler/add/$', views.add_scheduler),
    url(r'^scheduler/remove/$', views.remove_scheduler),
    url(r'^scheduler/set/$', views.set_scheduler_shown),
    url(r'^scheduler/course/$', views.set_course_shown),
    url(r'^scheduler/remove-course/$', views.remove_scheduler_course),
    url(r'^scheduler/rename/$', views.rename_scheduler),
]
