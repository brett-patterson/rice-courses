from xml.etree import ElementTree

import requests
from django.core.management.base import BaseCommand

from courses.models import Course
from terms.models import Term

COURSE_URL = 'https://courses.rice.edu/admweb/!SWKSECX.main'

# Maps attributes in the course XML feed to attributes on the Course model.
ATTRIBUTE_MAP = {
    'course-number': 'course_number',
    'credit-hours': 'credits',
    'distribution-group': 'distribution',
    'start-time': 'start_time',
    'end-time': 'end_time',
    'meeting-days': 'meeting_days',
    'max-enrollment': 'max_enrollment',
    'actual-enrollment': 'enrollment',
    'xlst-wait-capacity': 'max_waitlist',
    'xlst-wait-count': 'waitlist',
    'major-restrictions': 'restrictions',
    'pre-requisites': 'prerequisites',
    'co-requisites': 'corequisites',
    'xlst-group': 'cross_list_group'
}


class Command(BaseCommand):
    """ A command to fetch courses for a given term and import them into
    the database.

    """
    help = 'Update courses in the database'

    def add_arguments(self, parser):
        parser.add_argument('--all', dest='all', action='store_true',
                            default=False)
        parser.add_argument('--year', dest='year', type=int)
        parser.add_argument('--semester', dest='semester', type=int)

    def handle(self, *args, **options):
        verbose = int(options['verbosity']) > 1
        if options['all']:
            for term in Term.objects.all():
                self.fetch_courses(term, verbose=verbose)
            return

        term = Term.current_term()
        if options['year'] is not None and options['semester'] is not None:
            term = Term.objects.get(year=options['year'],
                                    semester=options['semester'])

        self.fetch_courses(term, verbose=verbose)

    def fetch_courses(self, term, verbose=False):
        """ Get all courses for the given term.

        Parameters:
        -----------
        term : Term
            The term to fetch courses for.

        verbose : bool [default False]
            Whether or not to show messages throughout the process of fetching
            courses.

        """
        if verbose:
            self.stdout.write('Fetching data...')

        response = requests.post(
            url=COURSE_URL,
            data={
                'term': term.to_code(),
            }
        )

        if verbose:
            self.stdout.write('Parsing data...')

        root = ElementTree.fromstring(response.text.encode('utf-8'))
        course_count = len(root)

        bar_count = 40

        old_crns = set([c.crn for c in Course.objects.filter(term=term)])
        crns = set()

        if verbose:
            self.stdout.write('Building courses...')

        for i, course in enumerate(root):
            if verbose:
                count = int(float(i + 1) / course_count * bar_count)
                log = '[' + '=' * count + ' ' * (bar_count - count) + ']'
                self.stdout.write(log, ending='\r')
                self.stdout.flush()

            course_json = {}

            for attr in course:
                name = ATTRIBUTE_MAP.get(attr.tag, attr.tag)
                course_json[name] = attr.text

            try:
                course = Course.from_json(course_json, term)
                crns.add(course.crn)
                schedules = []

                try:
                    old_course = Course.objects.get(crn=course.crn, term=term)
                    schedules = map(
                        lambda x: (x.schedule, x.shown),
                        old_course.courseshown_set.all()
                    )
                    old_course.delete()

                except Course.DoesNotExist:
                    pass

                course.save()
                for schedule, shown in schedules:
                    schedule.set_shown(course, shown)

            except Exception as e:
                self.stdout.write('Error parsing course:')
                self.stdout.write(str(course_json))
                self.stdout.write(str(e))
                self.stdout.write('\n')

        # Remove stale courses
        for crn in old_crns - crns:
            Course.objects.get(crn=crn, term=term).delete()
