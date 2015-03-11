import json

from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from help.models import HelpArticle, Tutorial


def index(request):
    """ The index page for the 'Help' tab.

    """
    context = {
        'nav_active': 'help',
        'articles': HelpArticle.objects.all()
    }

    return render(request, 'help/index.html', context)


@csrf_exempt
def tutorial(request):
    """ Fetch a tutorial from the database.

    """
    tutorial_name = request.POST.get('tutorial')

    if tutorial_name:
        try:
            tutorial = Tutorial.objects.get(name=tutorial_name)
            return HttpResponse(json.dumps(tutorial.json()),
                                content_type='application/json')
        except ObjectDoesNotExist:
            return HttpResponse(json.dumps({'error': 'No such tutorial'}),
                                content_type='application/json')

    return HttpResponse(json.dumps({'error': 'Must specify a tutorial name'}),
                        content_type='application/json')
