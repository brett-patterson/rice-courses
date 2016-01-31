from django.conf.urls import url

from .views import CourseCollectionView, CourseView, SectionsView, SubjectsView

urlpatterns = [
    url(r'^$', CourseCollectionView.as_view()),
    url(r'^(\d+)/$', CourseView.as_view()),
    url(r'^sections/$', SectionsView.as_view()),
    url(r'^subjects/$', SubjectsView.as_view()),
]
