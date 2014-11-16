from django.conf.urls import patterns, url

from accounts import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='accounts'),
    url(r'^export/', views.export, name='accounts_export'),
    url(r'^api/courses/$', views.courses),
    url(r'^api/courses/add/$', views.add_course),
    url(r'^api/courses/remove/$', views.remove_course)
)
