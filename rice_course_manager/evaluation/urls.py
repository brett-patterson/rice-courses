from django.conf.urls import url

from .views import CourseEvaluationView, InstructorEvaluationView

urlpatterns = [
    url(r'^course/$', CourseEvaluationView.as_view()),
    url(r'^instructor/$', InstructorEvaluationView.as_view())
]
