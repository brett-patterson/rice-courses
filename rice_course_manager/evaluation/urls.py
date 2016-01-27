from django.conf.urls import url

from evaluation import views

urlpatterns = [
    url(r'^course/$', views.course_evaluation),
    url(r'^instructor/$', views.instructor_evaluation),
]
