from django.conf.urls import url

from .views import TermsView

urlpatterns = [
    url(r'^$', TermsView.as_view()),
]
