from django.conf.urls import patterns, url

from accounts import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='accounts'),
    url(r'^export/', views.export, name='accounts_export'),
    url(r'^api/courses/(?P<username>\w+)/$', views.courses),
    url(r'^api/courses/(?P<username>\w+)/add/(?P<crn>\d+)/$', views.add_course),
    url(r'^api/courses/(?P<username>\w+)/remove/(?P<crn>\d+)/$', views.remove_course)
)
