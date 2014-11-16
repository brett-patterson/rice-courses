import json

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from rice_course_manager.evaluation import (get_course_evaluation,
                                            get_instructor_evaluation)


@csrf_exempt
def course_evaluation(request):
    crn = request.POST.get('crn')

    if crn:
        evaluation = get_course_evaluation(crn)
        return HttpResponse(json.dumps(evaluation.json()))
    else:
        msg = 'Must specify crn'
        return HttpResponse(json.dumps({'error': msg}))


@csrf_exempt
def instructor_evaluation(request):
    crn = request.POST.get('crn')
    instructor = request.POST.get('instructor')

    if crn and instructor:
        evaluation = get_instructor_evaluation(instructor, crn)
        return HttpResponse(json.dumps(evaluation.json()))

    else:
        msg = 'Must specify instructor and crn'
        return HttpResponse(json.dumps({'error': msg}))
