from django.conf.urls import patterns, url

from requirements import views

urlpatterns = patterns('',
    url(r'^api/degrees/$', views.degrees),
    url(r'^api/courses/$', views.courses),
)
