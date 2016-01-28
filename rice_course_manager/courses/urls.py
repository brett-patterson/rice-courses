from django.conf.urls import url

from .views import CoursesView, SectionsView, SubjectsView

urlpatterns = [
    url(r'^$', CoursesView.as_view()),
    url(r'^sections/$', SectionsView.as_view()),
    url(r'^subjects/$', SubjectsView.as_view()),
]
