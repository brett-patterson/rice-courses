from django.conf.urls import patterns, url

from courses import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='courses'),
    url(r'^(?P<crn>\d+)/$', views.detail, name='course_detail'),
    url(r'^api/all/$', views.all),
    url(r'^api/page/(?P<page_num>\d+)/$', views.page)
)
