from django.conf.urls import url

from .views import (UserCoursesView, AlternateCourseView,
                    SchedulerCollectionView, ActiveSchedulerView,
                    SchedulerView, SchedulerCourseView,
                    SchedulerExportView)

urlpatterns = [
    url(r'^courses/$', UserCoursesView.as_view()),
    url(r'^alternates/$', AlternateCourseView.as_view()),
    url(r'^schedulers/$', SchedulerCollectionView.as_view()),
    url(r'^schedulers/active/$', ActiveSchedulerView.as_view()),
    url(r'^schedulers/(\d+)/$', SchedulerView.as_view()),
    url(r'^schedulers/(\d+)/course/$', SchedulerCourseView.as_view()),
    url(r'^schedulers/(\d+)/export/$', SchedulerExportView.as_view())
]
