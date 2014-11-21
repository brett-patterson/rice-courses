from django.conf.urls import patterns, include, url
from django.contrib import admin

from rice_courses import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^login/$', 'django_cas.views.login'),
    url(r'^logout/$', 'django_cas.views.logout'),
    url(r'^courses/', include('courses.urls')),
    url(r'^evaluations/', include('evaluation.urls')),
    url(r'^help/', include('help.urls')),
    url(r'^me/', include('me.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
