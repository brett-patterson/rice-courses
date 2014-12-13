import json

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from django_cas.decorators import login_required

from courses.models import Course


@login_required(login_url='/login/')
def index(request):
    context = {
        'items_per_page': settings.API_ITEMS_PER_PAGE,
        'nav_active': 'courses'
    }

    return render(request, 'courses/index.html', context)


@csrf_exempt
def all(request):
    return HttpResponse(json.dumps([c.json() for c in Course.objects.all()]),
                        content_type='application/json')


@csrf_exempt
def page(request):
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


@csrf_exempt
def get_course(request):
    crn = request.POST.get('crn')

    if crn:
        course = Course.objects.get(crn=crn)
        return HttpResponse(json.dumps(course.json()),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Must specify crn'}),
                            content_type='application/json')
