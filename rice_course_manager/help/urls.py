from django.conf.urls import url

from .views import TutorialView

urlpatterns = [
    url(r'^tutorial/$', TutorialView.as_view())
]
