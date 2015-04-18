from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
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

    return render(request, 'help/index.jade', context)


@csrf_exempt
def tutorial(request):
    """ Fetch a tutorial from the database.

    """
    tutorial_name = request.POST.get('tutorial')

    if tutorial_name is not None:
        try:
            tutorial = Tutorial.objects.get(name=tutorial_name)
            return JsonResponse(tutorial.json())
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'No such tutorial'}, status=400)

    return JsonResponse({'error': 'Must specify a tutorial name'}, status=400)
