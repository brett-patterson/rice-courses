import json

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import render

from django_cas.decorators import login_required

from courses.models import Course


@login_required(login_url='/login/')
def index(request):
    course_list = request.user.userprofile.courses.all()
    distribution_list = []
    total_credits = 0.0
    total_can_vary = False

    for course in course_list:
        distribution_list.append('I' * course.distribution)
        try:
            total_credits += float(course.credits)
        except ValueError:
            total_can_vary = True

    context = {
        'nav_active': 'account',
        'courses': course_list,
        'distributions': distribution_list,
        'total_credits': total_credits,
        'total_can_vary': total_can_vary
    }
    return render(request, 'accounts/index.html', context)


@login_required(login_url='/login/')
def export(request):
    crns = [course.crn for course in request.user.userprofile.courses.all()]
    return HttpResponse('<br/>'.join(crns))


def user_or_current(request, username):
    if username == 'current':
        return request.user
    else:
        return User.objects.get(username=username)


def courses(request, username):
    user = user_or_current(request, username)
    course_list = user.userprofile.courses.all()
    return HttpResponse(json.dumps([c.json() for c in course_list]))


def add_course(request, username, crn):
    user = user_or_current(request, username)
    course = Course.objects.get(crn=crn)

    user.userprofile.courses.add(course)

    return HttpResponse(json.dumps({'status': 'success'}))


def remove_course(request, username, crn):
    user = user_or_current(request, username)
    course = Course.objects.get(crn=crn)

    user.userprofile.courses.remove(course)

    return HttpResponse(json.dumps({'status': 'success'}))
