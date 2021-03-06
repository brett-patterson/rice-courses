from django.conf.urls import url

from .views import (ScheduleCollectionView, ScheduleView, ScheduleICalView,
                    ScheduleCourseView)

urlpatterns = [
    url(r'^schedules/$', ScheduleCollectionView.as_view()),
    url(r'^schedules/(\d+)/$', ScheduleView.as_view()),
    url(r'^schedules/(\d+)/ical/$', ScheduleICalView.as_view()),
    url(r'^schedules/(\d+)/course/$', ScheduleCourseView.as_view())
]
