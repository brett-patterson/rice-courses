import json

from django.http import HttpResponse
from django.shortcuts import render

from django_cas.decorators import login_required

from courses.models import Course
from models import Scheduler


@login_required(login_url='/login/')
def index(request):
    """ The index page for the 'Me' tab.

    """
    context = {
        'nav_active': 'me'
    }
    return render(request, 'me/index.jade', context)


@login_required(login_url='/login/')
def export(request, scheduler_name):
    """ Export a scheduler's CRNs for all shown courses.

    """
    if scheduler_name:
        profile = request.user.userprofile
        scheduler = Scheduler.objects.get(name=scheduler_name)
        show_map = scheduler.show_map()
        crns = [course.crn for course in profile.courses.all()
                if show_map[course.crn]]
        return HttpResponse('<br/>'.join(crns))
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@login_required(login_url='/login/')
def courses(request):
    """ Get all of the courses selected by the user.

    """
    course_list = request.user.userprofile.courses.all()
    return HttpResponse(json.dumps([c.json() for c in course_list]),
                        content_type='application/json')


@login_required(login_url='/login/')
def add_course(request):
    """ Select a course for the user.

    """
    crn = request.POST.get('crn')

    if crn:
        course = Course.objects.get(crn=crn)
        request.user.userprofile.courses.add(course)

        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@login_required(login_url='/login/')
def remove_course(request):
    """ Deselect a course for the user.

    """
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

    Parameters:
    -----------
    course_one : Course
        The first course.

    course_two : Course
        The second course.

    Returns:
    --------
    A boolean representing whether the two courses overlap in time.

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


@login_required(login_url='/login/')
def suggest_alternate(request):
    """ Suggest alternate sections for a given course.

    """
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


@login_required(login_url='/login/')
def schedulers(request):
    """ Get all the schedulers for the user.

    """
    profile = request.user.userprofile
    schedulers = [s.json() for s in Scheduler.objects.filter(user_profile=profile)]

    return HttpResponse(json.dumps(schedulers),
                        content_type='application/json')


@login_required(login_url='/login/')
def add_scheduler(request):
    """ Add a scheduler for the user.

    """
    name = request.POST.get('name')

    if name:
        scheduler = request.user.userprofile.create_scheduler(name)
        return HttpResponse(json.dumps({
            'status': 'success',
            'scheduler': scheduler.json()
            }), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@login_required(login_url='/login/')
def remove_scheduler(request):
    """ Remove a scheduler for the user.

    """
    s_id = request.POST.get('id')

    if s_id is not None:
        Scheduler.objects.get(pk=s_id).delete()
        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@login_required(login_url='/login/')
def set_course_shown(request):
    """ Set a course to be shown or hidden.

    """
    s_id = request.POST.get('id')
    crn = request.POST.get('crn')
    shown = request.POST.get('shown')

    if s_id is not None and crn and shown is not None:
        scheduler = Scheduler.objects.get(pk=s_id)
        scheduler.set_shown(Course.objects.get(crn=crn),
                            shown == 'true')
        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')

    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@login_required(login_url='/login/')
def set_scheduler_shown(request):
    """ Set a scheduler to be shown or hidden

    """
    s_id = request.POST.get('id')
    shown = request.POST.get('shown')

    if s_id is not None and shown is not None:
        scheduler = Scheduler.objects.get(pk=s_id)
        scheduler.shown = shown == 'true'
        scheduler.save()
        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')

    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')


@login_required(login_url='/login/')
def rename_scheduler(request):
    """ Rename a scheduler.

    """
    s_id = request.POST.get('id')
    name = request.POST.get('name')

    if s_id is not None and name:
        scheduler = Scheduler.objects.get(pk=s_id)
        scheduler.name = name
        scheduler.save()
        return HttpResponse(json.dumps({'status': 'success'}),
                            content_type='application/json')
    else:
        return HttpResponse(json.dumps({'status': 'error'}),
                            content_type='application/json')
