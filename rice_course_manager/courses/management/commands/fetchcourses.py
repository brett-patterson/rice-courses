from xml.etree import ElementTree

from django.core.management.base import BaseCommand
from requests import Session

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


def fetch_courses(term, verbose=False):
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
        print('Fetching data...')

    session = Session()
    response = session.post(
        url=COURSE_URL,
        data={
            'term': term.to_code(),
        }
    )

    root = ElementTree.fromstring(response.text.encode('utf-8'))
    course_count = len(root)

    bar_count = 40

    old_crns = set([c.crn for c in Course.objects.all()])
    crns = set()

    for i, course in enumerate(root):
        if verbose:
            count = int(float(i + 1) / course_count * bar_count)
            log = '\r[' + '=' * count + ' ' * (bar_count - count) + ']'
            print log,

        course_json = {}

        for attr in course:
            name = ATTRIBUTE_MAP.get(attr.tag, attr.tag)
            course_json[name] = attr.text

        try:
            course = Course.from_json(course_json, term)
            crns.add(course.crn)
            course.save()
        except Exception as e:
            print 'Error parsing course:'
            print course_json
            print e
            print

    # Remove stale courses
    for crn in old_crns - crns:
        Course.objects.get(crn=crn).delete()


class Command(BaseCommand):
    """ A command to fetch courses for a given term and import them into
    the database.

    """
    help = 'Update courses in the database'

    def add_arguments(self, parser):
        parser.add_argument('--year', dest='year', type=int)
        parser.add_argument('--semester', dest='semester', type=int)

    def handle(self, *args, **options):
        verbose = int(options['verbosity']) > 1
        term = Term.current_term()
        if options['year'] is not None and options['semester'] is not None:
            term = Term.objects.get(year=options['year'],
                                    semester=options['semester'])

        fetch_courses(term, verbose=verbose)
