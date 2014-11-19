import json

from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from courses.models import Course
from evaluation import get_course_evaluation, get_instructor_evaluation
from models import Evaluation


def evaluation_to_json(evaluation_type, crn):
    try:
        evaluation = Evaluation.objects.get(evaluation_type=evaluation_type,
                                            crn=crn)

    except ObjectDoesNotExist:
        course = Course.objects.get(crn=crn)
        if evaluation_type == 'c':
            evaluation = get_course_evaluation(course)
        elif evaluation_type == 'i':
            evaluation = get_instructor_evaluation(course)

    eval_json = {
        'questions': [],
        'comments': []
    }

    if evaluation is None:
        return eval_json

    questions = evaluation.question_set.all()
    comments = evaluation.comment_set.all()

    for question in questions:
        q_json = question.json()
        choices = question.choice_set.all()
        q_json['choices'] = [c.json() for c in choices]
        eval_json['questions'].append(q_json)

    for comment in comments:
        eval_json['comments'].append(comment.json())

    return eval_json


@csrf_exempt
def course_evaluation(request):
    crn = request.POST.get('crn')

    if crn:
        return HttpResponse(json.dumps(evaluation_to_json('c', crn)))
    else:
        msg = 'Must specify crn'
        return HttpResponse(json.dumps({'error': msg}))


@csrf_exempt
def instructor_evaluation(request):
    crn = request.POST.get('crn')

    if crn:
        return HttpResponse(json.dumps(evaluation_to_json('i', crn)))

    else:
        msg = 'Must specify instructor and crn'
        return HttpResponse(json.dumps({'error': msg}))
