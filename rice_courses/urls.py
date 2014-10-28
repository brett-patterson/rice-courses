from django.conf.urls import patterns, include, url
from django.contrib import admin

from rice_courses import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^courses/', include('courses.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
