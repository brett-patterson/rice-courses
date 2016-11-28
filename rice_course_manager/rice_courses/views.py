import json

from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.generic import View

from help.models import HelpArticle


@login_required
def home(request):
    return render(request, 'index.html', {
        'help_articles': json.dumps(
            [a.json() for a in HelpArticle.objects.all()]
        )
    })


def demo(request):
    username = password = 'demo'
    demo_user, created = User.objects.get_or_create(username=username)
    if created:
        demo_user.set_password(password)
        demo_user.save()

    login(request, authenticate(username=username, password=password))
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
