import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
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


@method_decorator(login_required, name='dispatch')
class APIView(View):
    """ A class-based view for API endpoints. Requires the user to be
    authenticated.
    """
    def json_response(self, payload, status, **kwargs):
        return JsonResponse(payload, status=status, **kwargs)

    def success(self, payload={}, **kwargs):
        return self.json_response(payload, 200, **kwargs)

    def failure(self, error):
        return self.json_response({
            'error': error
        }, 400)
