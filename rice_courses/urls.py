from django.conf.urls import patterns, include, url
from django.contrib import admin

from rice_courses import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^login/$', 'django_cas.views.login'),
    url(r'^logout/$', 'django_cas.views.logout'),
    url(r'^accounts/', include('accounts.urls')),
    url(r'^courses/', include('courses.urls')),
    url(r'^help/', include('help.urls')),
    url(r'^planner/', include('planner.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
