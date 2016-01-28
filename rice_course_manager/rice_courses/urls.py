from django.conf.urls import include, url
from django.contrib import admin
from django_cas.views import login, logout

from views import home


urlpatterns = [
    url(r'^$', home),
    url(r'^login/$', login),
    url(r'^logout/$', logout),

    url(r'^api/courses/', include('courses.urls')),
    url(r'^api/evaluation/', include('evaluation.urls')),
    url(r'^api/me/', include('me.urls')),
    url(r'^api/help/', include('help.urls')),

    url(r'^admin/', include(admin.site.urls)),
]
