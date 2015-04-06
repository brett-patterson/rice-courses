import json

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render

from django_cas.decorators import login_required

from courses.models import Course


@login_required(login_url='/login/')
def index(request):
    """ The index page for the 'Courses' tab.

    """
    context = {
        'items_per_page': settings.API_ITEMS_PER_PAGE,
        'nav_active': 'courses'
    }

    return render(request, 'courses/index.jade', context)


def all(request):
    """ Returns a list of all courses as JSON objects.

    """
    return HttpResponse(json.dumps([c.json() for c in Course.objects.all()]),
                        content_type='application/json')


def page(request):
    """ Returns a page of courses. The number of courses in a page is defined
    in the setting `API_ITEMS_PER_PAGE`. Courses are represented as JSON
    objects.

    """
    page_num = request.POST.get('page_num')

    if page_num:
        page_num = int(page_num)

        all_courses = Course.objects.all()
        count = all_courses.count()

        items_per_page = settings.API_ITEMS_PER_PAGE
        start = page_num * items_per_page
        end = (page_num + 1) * items_per_page

        if start > count:
            page_courses = []
        elif end > count:
            page_courses = all_courses[start:count]
        else:
            page_courses = all_courses[start:end]

        response = {
            'total': count,
            'courses': [c.json() for c in page_courses]
        }
    else:
        response = {
            'error': 'Must specify a page number'
        }

    return HttpResponse(json.dumps(response), content_type='application/json')


def get_course(request):
    """ Returns the course corresponding to the given CRN as a JSON object.

    """
    crn = request.POST.get('crn')

    if crn:
        course = Course.objects.get(crn=crn)
        return HttpResponse(json.dumps(course.json()),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Must specify crn'}),
                            content_type='application/json')
