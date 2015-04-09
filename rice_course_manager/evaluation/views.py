import json

from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from courses.models import Course
from evaluation import get_course_evaluation, get_instructor_evaluation
from models import Evaluation


def evaluation_to_json(evaluation_type, crn):
    """ Fetch an evaluation from the database if it exists, otherwise fetch
    it from the Rice servers.

    Parameters:
    -----------
    evaluation_type : str
        The type of the evaluation (either 'c' or 'i').

    crn : str
        The CRN of the course to look for.

    Returns:
    --------
    A JSON-serializable dictionary representing the evaluation.

    """
    try:
        evaluation = Evaluation.objects.get(evaluation_type=evaluation_type,
                                            crn=crn)

    except ObjectDoesNotExist:
        course = Course.objects.get(crn=crn)
        if evaluation_type == 'c':
            evaluation = get_course_evaluation(course)
        elif evaluation_type == 'i':
            evaluation = get_instructor_evaluation(course)

    if evaluation is None:
        return {
            'questions': [],
            'comments': []
        }

    return evaluation.json()


@csrf_exempt
def course_evaluation(request):
    """ Get the evaluation for a course.

    """
    crn = request.POST.get('crn')

    if crn:
        return HttpResponse(json.dumps(evaluation_to_json('c', crn)),
                            content_type='application/json')
    else:
        msg = 'Must specify crn'
        return HttpResponse(json.dumps({'error': msg}),
                            content_type='application/json')


@csrf_exempt
def instructor_evaluation(request):
    """ Get the evaluation for an instructor.

    """
    crn = request.POST.get('crn')

    if crn:
        return HttpResponse(json.dumps(evaluation_to_json('i', crn)),
                            content_type='application/json')

    else:
        msg = 'Must specify crn'
        return HttpResponse(json.dumps({'error': msg}),
                            content_type='application/json')
