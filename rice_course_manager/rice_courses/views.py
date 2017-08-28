import json

from django.conf import settings
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.generic import View
from cas.views import login as cas_login, logout as cas_logout

from help.models import HelpArticle


def login_dummy_user(request, name, admin=False):
    """ Create, if necessary, and login a dummy user.
    """
    username = password = name

    user, created = User.objects.get_or_create(username=username)
    if created:
        user.set_password(user)
        if admin:
            user.is_staff = True
            user.is_superuser = True
        user.save()

    user = authenticate(username=username, password=password)
    login(request, user)
    return user


def login_view(request):
    """ A view to login a user.
    """
    if settings.DEBUG:
        login_dummy_user(request, 'dev', admin=True)
        return HttpResponseRedirect(request.GET.get('next', '/'))

    return cas_login(request)


def logout_view(request):
    """ A view to logout a user.
    """
    if settings.DEBUG:
        logout(request)
        return HttpResponseRedirect(request.GET.get('next', '/'))

    return cas_logout(request)


@login_required
def home(request):
    """ The main application view.
    """
    return render(request, 'index.html', {
        'help_articles': json.dumps(
            [a.json() for a in HelpArticle.objects.all()]
        )
    })


def demo(request):
    """ A view that logs the user in as a demo user.
    """
    login_dummy_user(request, 'demo')
    return HttpResponseRedirect('/')


@method_decorator(login_required, name='dispatch')
class APIView(View):
    """ A class-based view for API endpoints. Requires the user to be
    authenticated.
    """
    def json_response(self, payload, status, **kwargs):
        return JsonResponse({
            'payload': payload,
            'error': status >= 400
        }, status=status, **kwargs)

    def success(self, payload=None, **kwargs):
        return self.json_response(payload, 200, **kwargs)

    def failure(self, error, **kwargs):
        return self.json_response(error, 400, **kwargs)
