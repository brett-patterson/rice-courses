from django.conf.urls import include, url
from django.contrib import admin

from .views import home, demo, login_view, logout_view


urlpatterns = [
    url(r'^demo/?$', demo),
    url(r'^login/?$', login_view),
    url(r'^logout/?$', logout_view),

    url(r'^api/courses/', include('courses.urls')),
    url(r'^api/evaluation/', include('evaluation.urls')),
    url(r'^api/me/', include('me.urls')),
    url(r'^api/terms/', include('terms.urls')),
    url(r'^api/help/', include('help.urls')),

    url(r'^admin/', include(admin.site.urls)),

    url(r'^(?:(?!api).)*$', home),
]
