import json

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from django_cas.decorators import login_required

from courses.models import Course


@login_required(login_url='/login/')
def index(request):
    context = {
        'nav_active': 'planner'
    }
    return render(request, 'planner/index.html', context)


@csrf_exempt
@login_required(login_url='/login/')
def suggest_alternate(request):
    crn = request.POST.get('crn')

    if crn:
        course = Course.objects.get(crn=crn)

        alternates = Course.objects.filter(subject=course.subject,
                                           course_number=course.course_number)

        result = []
        for alternate in alternates:
            if (alternate.meeting_days != course.meeting_days or
                    alternate.start_time != course.start_time):
                result.append(alternate.crn)

        return HttpResponse(json.dumps(result),
                            content_type='application/json')

    else:
        return HttpResponse(json.dumps({'error': 'Must specify crn'}),
                            content_type='application/json')
