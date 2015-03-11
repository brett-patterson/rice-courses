import json

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from models import Major


@csrf_exempt
def majors(request):
    """ Get a list of all majors.

    """
    return HttpResponse(json.dumps([m.name for m in Major.objects.all()]))


@csrf_exempt
def degrees(request):
    """ Get a list of all degrees within a major.

    """
    major_name = request.POST.get('major')

    if major_name:
        major = Major.objects.get(name=major_name)
        return HttpResponse(json.dumps(major.degrees))

    else:
        return HttpResponse(json.dumps({'error': 'Must specify a major'}))


@csrf_exempt
def courses(request):
    """ Get a list of courses within a major (optionally also within a degree).

    """
    major_name = request.POST.get('major')
    degree = request.POST.get('degree')

    if major_name:
        major = Major.objects.get(name=major_name)
        if degree:
            courses = major.courses_for_degree(degree)
        else:
            courses = major.all_courses()
        return HttpResponse(json.dumps([c.json() for c in courses]))

    else:
        return HttpResponse(json.dumps({'error': 'Must specify a major'}))
