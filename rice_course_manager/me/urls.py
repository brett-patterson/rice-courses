from django.conf.urls import url

from .views import (AlternateCourseView, ScheduleCollectionView, ScheduleView,
                    ScheduleCourseView)

urlpatterns = [
    url(r'^alternates/$', AlternateCourseView.as_view()),
    url(r'^schedules/$', ScheduleCollectionView.as_view()),
    url(r'^schedules/(\d+)/$', ScheduleView.as_view()),
    url(r'^schedules/(\d+)/course/$', ScheduleCourseView.as_view())
]
