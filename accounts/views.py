import json

from django.contrib.auth.models import User
from django.http import HttpResponse

from courses.models import Course


def courses(self, username):
    user = User.objects.get(username=username)
    course_list = user.usercourses.courses.all()
    return HttpResponse(json.dumps([c.json() for c in course_list]))


def add_course(self, username, crn):
    user = User.objects.get(username=username)
    course = Course.objects.get(crn=crn)

    user.usercourses.courses.add(course)

    return HttpResponse(json.dumps({'status': 'success'}))


def remove_course(self, username, crn):
    user = User.objects.get(username=username)
    course = Course.objects.get(crn=crn)

    user.usercourses.courses.remove(course)

    return HttpResponse(json.dumps({'status': 'success'}))
