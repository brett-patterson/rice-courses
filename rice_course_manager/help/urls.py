from django.conf.urls import url

from .views import ArticlesView

urlpatterns = [
    url(r'^articles/$', ArticlesView.as_view())
]
