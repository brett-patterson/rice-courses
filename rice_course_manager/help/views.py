from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse

from help.models import Tutorial


def tutorial(request):
    """ Fetch a tutorial from the database.

    """
    tutorial_name = request.POST.get('tutorial')

    if tutorial_name is not None:
        try:
            tutorial = Tutorial.objects.get(name=tutorial_name)
            return JsonResponse(tutorial.json())
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'No such tutorial'})

    return JsonResponse({'error': 'Must specify a tutorial name'}, status=400)
