import json
import math

from django.conf import settings

from rice_courses.views import APIView
from .filters import filter_courses
from .models import Course


COURSE_ORDER = {
    'courseID': ('subject', 'course_number', 'section'),
}


class CoursesView(APIView):
    def get(self, request):
        """ Returns a list of all courses as JSON objects.
        """
        filtersJson = request.GET.get('filters')
        page = request.GET.get('page')
        order = request.GET.get('order')

        if filtersJson is None:
            filters = []
        else:
            try:
                filters = json.loads(filtersJson)
            except ValueError:
                return self.failure('Improperly formatted filters')

        if order is None:
            order = 'courseID'

        if order.startswith('-'):
            order_params = COURSE_ORDER.get(order[1:], (order[1:],))
            all_courses = Course.objects.order_by(*order_params).reverse()
        else:
            order_params = COURSE_ORDER.get(order, (order,))
            all_courses = Course.objects.order_by(*order_params)

        filtered_courses = filter_courses(all_courses, filters)

        l = settings.COURSE_PAGE_LENGTH

        if page is not None:
            page = int(page)
            filtered_courses = filtered_courses[l * page:l * (page + 1)]

        pages = int(math.ceil(filtered_courses.count() / float(l)))

        return self.success({
            'courses': [c.json() for c in filtered_courses],
            'pages': pages
        }, safe=False)


class SectionsView(APIView):
    def get(self, request):
        """ Get all sections of a course.
        """
        subj = request.GET.get('subject')
        num = request.GET.get('number')

        if subj is None:
            return self.failure('No subject specified')

        if num is None:
            return self.failure('No course number specified')

        filtered = Course.objects.filter(subject=subj, course_number=num)
        return self.success([c.json() for c in filtered], safe=False)


class SubjectsView(APIView):
    def get(self, request):
        """ Get all unique course subjects.
        """
        subjects = sorted(map(lambda x: x['subject'],
                              Course.objects.values('subject').distinct()))
        return self.success(subjects, safe=False)
