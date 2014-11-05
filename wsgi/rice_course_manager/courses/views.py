import json

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render

from django_cas.decorators import login_required

from courses.models import Course


@login_required(login_url='/login/')
def index(request):
    context = {
        'items_per_page': settings.API_ITEMS_PER_PAGE,
        'nav_active': 'courses'
    }
    return render(request, 'courses/index.html', context)


@login_required(login_url='/login/')
def detail(request, crn):
    context = {
        'course': Course.objects.get(crn=crn),
        'nav_active': 'courses'
    }
    return render(request, 'courses/detail.html', context)


def all(request):
    return HttpResponse(json.dumps([c.json() for c in Course.objects.all()]))


def page(request, page_num):
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

    return HttpResponse(json.dumps(response))
