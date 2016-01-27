from django.conf.urls import url

from courses import views

urlpatterns = [
    url(r'^$', views.courses),
    url(r'^sections/$', views.get_sections),
    url(r'^subjects/$', views.get_subjects),
]
