import json

from django.http import HttpResponse
from django.shortcuts import render

from django_cas.decorators import login_required

from courses.models import Course


@login_required(login_url='/login/')
def index(request):
    """ The index page for the 'Courses' tab.

    """
    context = {
        'nav_active': 'courses'
    }

    return render(request, 'courses/index.jade', context)


@login_required(login_url='/login/')
def all(request):
    """ Returns a list of all courses as JSON objects.

    """
    return HttpResponse(json.dumps([c.json() for c in Course.objects.all()]),
                        content_type='application/json')


@login_required(login_url='/login/')
def get_sections(request):
    """ Get all sections of a course.

    """
    subj = request.POST.get('subject')
    num = request.POST.get('number')

    if subj is not None and num is not None:
        filtered = Course.objects.filter(subject=subj, course_number=num)
        courses = [c.json() for c in filtered]
        return HttpResponse(json.dumps(courses),
                            content_type='application/json')

    msg = 'Must specify subject and number'
    return HttpResponse(json.dumps({'error': msg}),
                        content_type='application/json')
