import math

from django.conf import settings
from django.db.models import Value, IntegerField

from rice_courses.views import APIView
from .models import Course
from .search import search_courses, filter_courses
from terms.models import Term


class CourseCollectionView(APIView):
    def get(self, request):
        """ Returns a list of all courses as JSON objects.
        """
        query = request.GET.get('q')
        page = request.GET.get('page')
        term_id = request.GET.get('term')

        term = Term.current_term()
        if term_id is not None:
            term = Term.objects.get(id=term_id)

        courses = Course.objects.filter(term=term) \
            .annotate(rank=Value(0, output_field=IntegerField()))

        if query is not None:
            courses = search_courses(courses, query)

        courses = filter_courses(courses, request.GET)

        courses = courses.order_by(
            'rank', 'subject', 'course_number', 'section'
        )

        l = settings.COURSE_PAGE_LENGTH
        pages = int(math.ceil(courses.count() / float(l)))

        if page is not None:
            page = int(page)
            courses = courses[l * page:l * (page + 1)]

        return self.success({
            'courses': [c.json() for c in courses],
            'pages': pages
        })


class CourseView(APIView):
    def get(self, request, term_id, crn):
        """ Get a course by CRN.
        """
        try:
            term = Term.objects.get(id=int(term_id))
        except Term.DoesNotExist:
            return self.failure('Term does not exist')

        try:
            course = Course.objects.get(crn=crn, term=term)
        except Course.DoesNotExist:
            return self.failure('Course does not exist')

        return self.success(course.json())


class SectionsView(APIView):
    def get(self, request):
        """ Get all sections of a course.
        """
        subj = request.GET.get('subject')
        num = request.GET.get('number')
        term_id = request.GET.get('term')

        if subj is None:
            return self.failure('No subject specified')

        if num is None:
            return self.failure('No course number specified')

        if term_id is None:
            return self.failure('No term specified')

        try:
            term = Term.objects.get(id=term_id)
        except Term.DoesNotExist:
            return self.failure('Invalid term')

        filtered = Course.objects.filter(
            subject=subj, course_number=num, term=term
        )
        return self.success([c.json() for c in filtered])


class SubjectsView(APIView):
    def get(self, request):
        """ Get all unique course subjects.
        """
        term_id = request.GET.get('term')

        try:
            term = Term.objects.get(id=term_id)
        except Term.DoesNotExist:
            term = Term.current_term()

        distinct = Course.objects \
            .filter(term=term) \
            .values('subject') \
            .distinct()

        subjects = sorted(map(lambda x: x['subject'], distinct))
        return self.success(subjects)
