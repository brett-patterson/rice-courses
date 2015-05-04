from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic import RedirectView


urlpatterns = patterns('',
    url(r'^$', RedirectView.as_view(pattern_name='courses'), name='home'),
    url(r'^login/$', 'django_cas.views.login'),
    url(r'^logout/$', 'django_cas.views.logout'),
    url(r'^courses/', include('courses.urls'), name='courses'),
    url(r'^evaluation/', include('evaluation.urls')),
    url(r'^help/', include('help.urls')),
    url(r'^me/', include('me.urls')),
    url(r'^requirements/', include('requirements.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
