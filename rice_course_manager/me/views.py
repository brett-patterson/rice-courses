from django.http import JsonResponse
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
    return render(request, 'me/index.html', context)


@login_required(login_url='/login/')
def courses(request):
    """ Get all of the courses selected by the user.

    """
    course_list = request.user.userprofile.courses.all()
    return JsonResponse([c.json() for c in course_list], safe=False)


@login_required(login_url='/login/')
def add_course(request):
    """ Select a course for the user.

    """
    crn = request.POST.get('crn')

    if crn is not None:
        course = Course.objects.get(crn=crn)

        profile = request.user.userprofile
        profile.courses.add(course)

        for scheduler in Scheduler.objects.filter(user_profile=profile):
            scheduler.set_shown(course, True)

        return JsonResponse({})

    return JsonResponse({'error': 'No CRN specified'}, status=400)


@login_required(login_url='/login/')
def remove_course(request):
    """ Deselect a course for the user.

    """
    crn = request.POST.get('crn')

    if crn is not None:
        course = Course.objects.get(crn=crn)
        request.user.userprofile.courses.remove(course)

        return JsonResponse({})

    return JsonResponse({'error': 'No CRN specified'}, status=400)


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
    for interval_one in course_one.meetings:
        for interval_two in course_two.meetings:
            if (interval_two.start < interval_one.start < interval_two.end or
                    interval_two.start < interval_one.end < interval_two.end or
                    interval_one.start == interval_two.start or
                    interval_one.start == interval_two.end or
                    interval_one.end == interval_two.start):
                return True

    return False


@login_required(login_url='/login/')
def suggest_alternate(request):
    """ Suggest alternate sections for a given course.

    """
    crn = request.POST.get('crn')

    if crn is not None:
        course = Course.objects.get(crn=crn)

        alternates = Course.objects.filter(subject=course.subject,
                                           course_number=course.course_number)
        alternates = alternates.exclude(section=course.section)

        scheduler = Scheduler.objects.get(shown=True)
        user_courses = [Course.objects.get(crn=c.crn)
                        for c in request.user.userprofile.courses.all()
                        if c.crn != crn and scheduler.show_map()[c.crn]]

        result = []
        for alternate in alternates:
            ok = True

            for user_course in user_courses:
                if overlap(alternate, user_course):
                    ok = False
                    break

            if ok:
                result.append(alternate.json())

        return JsonResponse({'course': course.json(), 'alternates': result})

    return JsonResponse({'error': 'No CRN specified'}, status=400)


@login_required(login_url='/login/')
def schedulers(request):
    """ Get all the schedulers for the user.

    """
    profile = request.user.userprofile
    schedulers = [s.json()
                  for s in Scheduler.objects.filter(user_profile=profile)]

    return JsonResponse(schedulers, safe=False)


@login_required(login_url='/login/')
def export_scheduler(request):
    """ Export a scheduler's CRNs for all shown courses.

    """
    s_id = request.POST.get('id')

    if s_id is not None:
        scheduler = Scheduler.objects.get(pk=s_id)
        show_map = scheduler.show_map()
        courses = [course.json() for course in
                   request.user.userprofile.courses.all()
                   if show_map[course.crn]]

        return JsonResponse(courses, safe=False)

    return JsonResponse({'error': 'No CRN specified'}, status=400)


@login_required(login_url='/login/')
def add_scheduler(request):
    """ Add a scheduler for the user.

    """
    name = request.POST.get('name')

    if name is not None:
        scheduler = request.user.userprofile.create_scheduler(name)
        return JsonResponse({'scheduler': scheduler})

    return JsonResponse({'error': 'No name specified'}, status=400)


@login_required(login_url='/login/')
def remove_scheduler(request):
    """ Remove a scheduler for the user.

    """
    s_id = request.POST.get('id')

    if s_id is not None:
        Scheduler.objects.get(pk=s_id).delete()
        return JsonResponse({})

    return JsonResponse({'error': 'No ID specified'}, status=400)


@login_required(login_url='/login/')
def set_course_shown(request):
    """ Set a course to be shown or hidden.

    """
    s_id = request.POST.get('id')
    crn = request.POST.get('crn')
    shown = request.POST.get('shown')

    if s_id is None:
        return JsonResponse({'error': 'No ID specified'}, status=400)

    if crn is None:
        return JsonResponse({'error': 'No CRN specified'}, status=400)

    if shown is None:
        return JsonResponse({'error': 'No shown flag specified'}, status=400)

    scheduler = Scheduler.objects.get(pk=s_id)
    scheduler.set_shown(Course.objects.get(crn=crn), shown == 'true')
    return JsonResponse({})


@login_required(login_url='/login/')
def remove_scheduler_course(request):
    """ Remove a course from a scheduler's show map.

    """
    s_id = request.POST.get('id')
    crn = request.POST.get('crn')

    if s_id is None:
        return JsonResponse({'error': 'No ID specified'}, status=400)

    if crn is None:
        return JsonResponse({'error': 'No CRN specified'}, status=400)

    scheduler = Scheduler.objects.get(pk=s_id)
    scheduler.remove_course(Course.objects.get(crn=crn))
    return JsonResponse({})


@login_required(login_url='/login/')
def set_scheduler_shown(request):
    """ Set a scheduler to be shown or hidden

    """
    s_id = request.POST.get('id')
    shown = request.POST.get('shown')

    if s_id is None:
        return JsonResponse({'error': 'No ID specified'}, status=400)

    if shown is None:
        return JsonResponse({'error': 'No shown flag specified'}, status=400)

    scheduler = Scheduler.objects.get(pk=s_id)
    scheduler.shown = shown == 'true'
    scheduler.save()
    return JsonResponse({})


@login_required(login_url='/login/')
def rename_scheduler(request):
    """ Rename a scheduler.

    """
    s_id = request.POST.get('id')
    name = request.POST.get('name')

    if s_id is None:
        return JsonResponse({'error': 'No ID specified'}, status=400)

    if name is None:
        return JsonResponse({'error': 'No name specified'}, status=400)

    scheduler = Scheduler.objects.get(pk=s_id)
    scheduler.name = name
    scheduler.save()
    return JsonResponse({})
