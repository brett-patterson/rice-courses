from django.db.models import CharField, IntegerField, Value, Case, When, F, Q
from django.db.models.functions import Concat


def search_courses(courses, query):
    """ Search through a course query set for the given query text.
    """
    return courses.annotate(
        course_id=Concat('subject', Value(' '), 'course_number', Value(' '),
                         'section', output_field=CharField()),
    ).annotate(rank=Case(
        When(
            course_id__istartswith=query,
            then=1
        ),
        When(
            title__icontains=query,
            then=2
        ),
        When(
            instructor__icontains=query,
            then=3
        ),
        default=0,
        output_field=IntegerField()
    )).filter(rank__gt=0)


def filter_courses(courses, params):
    """ Filter a course query set based on known filtering parameters.
    """
    if 'notFull' in params and params['notFull'] == 'true':
        courses = courses.filter(
            Q(enrollment__lt=F('max_enrollment')) | Q(max_enrollment=0)
        )

    if 'distributions' in params:
        ds = int(params['distributions'])
        valid = []
        if ds & 0x1:
            valid.append(0)
        if ds & 0x2:
            valid.append(1)
        if ds & 0x4:
            valid.append(2)
        if ds & 0x8:
            valid.append(3)

        courses = courses.filter(distribution__in=valid)

    return courses
