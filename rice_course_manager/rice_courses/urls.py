from django.conf.urls import include, url
from django.contrib import admin
from views import home


urlpatterns = [
    url(r'^$', home, name='home'),
    url(r'^login/$', 'django_cas.views.login', name='login'),
    url(r'^logout/$', 'django_cas.views.logout', name='logout'),

    url(r'^api/courses/', include('courses.urls')),
    url(r'^api/evaluation/', include('evaluation.urls')),
    url(r'^api/me/', include('me.urls')),
    url(r'^api/help/', include('help.urls')),

    url(r'^admin/', include(admin.site.urls)),
]
