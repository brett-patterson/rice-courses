import json

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from django_cas.decorators import login_required

from courses.models import Course


@login_required(login_url='/login/')
def index(request):
    context = {
        'nav_active': 'account',
    }
    return render(request, 'accounts/index.html', context)


@login_required(login_url='/login/')
def export(request):
    crns = [course.crn for course in request.user.userprofile.courses.all()]
    return HttpResponse('<br/>'.join(crns))


@csrf_exempt
@login_required(login_url='/login/')
def courses(request):
    user = request.user
    course_list = user.userprofile.courses.all()
    return HttpResponse(json.dumps([c.json() for c in course_list]))


@csrf_exempt
@login_required(login_url='/login/')
def add_course(request):
    crn = request.POST.get('crn')

    user = request.user

    if crn:
        course = Course.objects.get(crn=crn)
        user.userprofile.courses.add(course)

        return HttpResponse(json.dumps({'status': 'success'}))
    else:
        return HttpResponse(json.dumps({'status': 'error'}))


@csrf_exempt
@login_required(login_url='/login/')
def remove_course(request):
    crn = request.POST.get('crn')
    print request.POST

    user = request.user

    if crn:
        course = Course.objects.get(crn=crn)
        user.userprofile.courses.remove(course)

        return HttpResponse(json.dumps({'status': 'success'}))
    else:
        return HttpResponse(json.dumps({'status': 'error'}))
