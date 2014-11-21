from django.conf.urls import patterns, url

from me import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='me'),
    url(r'^export/', views.export, name='me_export'),
    url(r'^api/courses/$', views.courses),
    url(r'^api/courses/add/$', views.add_course),
    url(r'^api/courses/remove/$', views.remove_course),
    url(r'^api/alternate/$', views.suggest_alternate)
)
