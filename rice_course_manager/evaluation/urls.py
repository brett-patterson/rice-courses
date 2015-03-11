from django.conf.urls import patterns, url

from evaluation import views

urlpatterns = patterns('',
    url(r'^api/course/$', views.course_evaluation),
    url(r'^api/instructor/$', views.instructor_evaluation),
)
