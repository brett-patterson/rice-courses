import json

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import render

from courses.models import Course


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
        'total_credits': total_credits,
        'total_can_vary': total_can_vary
    }
    return render(request, 'accounts/index.html', context)


def user_or_current(request, username):
    if username == 'current':
        return request.user
    else:
        return User.objects.get(username=username)


def courses(request, username):
    user = user_or_current(request, username)
    course_list = user.usercourses.courses.all()
    return HttpResponse(json.dumps([c.json() for c in course_list]))


def add_course(request, username, crn):
    user = user_or_current(request, username)
    course = Course.objects.get(crn=crn)

    user.usercourses.courses.add(course)

    return HttpResponse(json.dumps({'status': 'success'}))


def remove_course(request, username, crn):
    user = user_or_current(request, username)
    course = Course.objects.get(crn=crn)

    user.usercourses.courses.remove(course)

    return HttpResponse(json.dumps({'status': 'success'}))
