import json

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from django_cas.decorators import login_required

from courses.models import Course
from models import Scheduler


@login_required(login_url='/login/')
def index(request):
    context = {
        'nav_active': 'me'
    }
    return render(request, 'me/index.html', context)


@login_required(login_url='/login/')
def export(request):
    crns = [course.crn for course in request.user.userprofile.courses.all()]
    return HttpResponse('<br/>'.join(crns))


@csrf_exempt
@login_required(login_url='/login/')
def courses(request):
    course_list = request.user.userprofile.courses.all()
    return HttpResponse(json.dumps([c.json() for c in course_list]),
                        content_type='application/json')


@csrf_exempt
@login_required(login_url='/login/')
def add_course(request):
    crn = request.POST.get('crn')

    if crn:
        course = Course.objects.get(crn=crn)
        request.user.userprofile.courses.add(course)

        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@csrf_exempt
@login_required(login_url='/login/')
def remove_course(request):
    crn = request.POST.get('crn')

    if crn:
        course = Course.objects.get(crn=crn)
        request.user.userprofile.courses.remove(course)

        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


def overlap(course_one, course_two):
    """ Check whether course one overlaps with course two.

    """
    days_one = course_one.meeting_days.split(',')
    days_two = course_two.meeting_days.split(',')

    start_times_one = [int(t) for t in course_one.start_time.split(',')]
    start_times_two = [int(t) for t in course_two.start_time.split(',')]

    end_times_two = [int(t) for t in course_two.end_time.split(',')]

    for i, day in enumerate(days_one):
        try:
            j = days_two.index(day)
            if (start_times_one[i] >= start_times_two[j] and
                    start_times_one[i] <= end_times_two[j]):
                return True
        except ValueError:
            continue

    return False


@csrf_exempt
@login_required(login_url='/login/')
def suggest_alternate(request):
    crn = request.POST.get('crn')

    if crn:
        course = Course.objects.get(crn=crn)

        alternates = Course.objects.filter(subject=course.subject,
                                           course_number=course.course_number)

        user_courses = [c.crn for c in request.user.userprofile.courses.all()]

        result = []
        for alternate in alternates:
            if (not overlap(course, alternate) and
                    not overlap(alternate, course) and
                    alternate.crn not in user_courses):
                result.append(alternate.json())

        return HttpResponse(json.dumps(result),
                            content_type='application/json')

    else:
        return HttpResponse(json.dumps({'error': 'Must specify crn'}),
                            content_type='application/json')


@csrf_exempt
@login_required(login_url='/login/')
def schedulers(request):
    profile = request.user.userprofile
    names = [s.name for s in Scheduler.objects.filter(user_profile=profile)]

    return HttpResponse(json.dumps(names), content_type='application/json')


@csrf_exempt
@login_required(login_url='/login/')
def add_scheduler(request):
    name = request.POST.get('name')

    if name:
        request.user.userprofile.create_scheduler(name)
        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@csrf_exempt
@login_required(login_url='/login/')
def remove_scheduler(request):
    name = request.POST.get('name')

    if name:
        Scheduler.objects.get(name=name).delete()
        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@csrf_exempt
@login_required(login_url='/login/')
def set_shown(request):
    name = request.POST.get('name')
    crn = request.POST.get('crn')
    shown = request.POST.get('shown')

    if name and crn and shown:
        scheduler = Scheduler.objects.get(name=name)
        scheduler.set_shown(Course.objects.get(crn=crn),
                            shown == 'true')
        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@csrf_exempt
@login_required(login_url='/login/')
def show_map(request):
    name = request.POST.get('name')

    if name:
        scheduler = Scheduler.objects.get(name=name)
        return HttpResponse(json.dumps(scheduler.show_map()),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@csrf_exempt
@login_required(login_url='/login/')
def rename(request):
    name = request.POST.get('name')
    new = request.POST.get('new')

    if name and new:
        scheduler = Scheduler.objects.get(name=name)
        scheduler.name = new
        scheduler.save()
        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')
