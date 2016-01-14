import json
import math

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render

from django_cas.decorators import login_required

from courses.filters import filter_courses
from courses.models import Course


COURSE_ORDER = {
    'courseID': ('subject', 'course_number', 'section'),
}


@login_required
def index(request):
    """ The index page for the 'Courses' tab.

    """
    context = {
        'nav_active': 'courses'
    }

    return render(request, 'courses/index.html', context)


@login_required
def courses(request):
    """ Returns a list of all courses as JSON objects.

    """
    filtersJson = request.POST.get('filters')
    page = request.POST.get('page')
    order = request.POST.get('order')

    if filtersJson is None:
        filters = []
    else:
        try:
            filters = json.loads(filtersJson)
        except ValueError:
            return JsonResponse({'error': 'Improperly formatted filters'},
                                status=400)

    if page is None:
        return JsonResponse([c.json() for c in Course.objects.all()],
                            status=400)

    if order is None:
        order = 'courseID'

    if order.startswith('-'):
        order_params = COURSE_ORDER.get(order[1:], (order[1:],))
        all_courses = Course.objects.order_by(*order_params).reverse()
    else:
        order_params = COURSE_ORDER.get(order, (order,))
        all_courses = Course.objects.order_by(*order_params)

    filtered_courses = filter_courses(all_courses, filters)

    pages = int(math.ceil(filtered_courses.count() /
                          float(settings.COURSE_PAGE_LENGTH)))

    page = int(page)
    start = settings.COURSE_PAGE_LENGTH * page
    end = settings.COURSE_PAGE_LENGTH * (page + 1)

    return JsonResponse({
        'courses': [c.json() for c in filtered_courses[start:end]],
        'pages': pages
    }, safe=False)


@login_required
def get_sections(request):
    """ Get all sections of a course.

    """
    subj = request.POST.get('subject')
    num = request.POST.get('number')

    if subj is None:
        return JsonResponse({'error': 'No subject specified'}, status=400)

    if num is None:
        return JsonResponse({'error': 'No course number specified'},
                            status=400)

    filtered = Course.objects.filter(subject=subj, course_number=num)
    return JsonResponse([c.json() for c in filtered], safe=False)


@login_required
def get_subjects(request):
    """ Get all unique course subjects.

    """
    subjects = sorted(map(lambda x: x['subject'],
                          Course.objects.values('subject').distinct()))
    return JsonResponse(subjects, safe=False)
