from xml.etree import ElementTree

from django.core.management.base import BaseCommand
from requests import Session

from courses.models import Course

COURSE_URL = 'https://courses.rice.edu/admweb/!SWKSECX.main'

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
    'xlst-wait-count': 'waitlist'
}


def fetch_courses(term, verbose=False):
    """ Get all Rice courses for the current term.

    """
    if verbose:
        print('Fetching data...')

    session = Session()
    response = session.post(
        url=COURSE_URL,
        data={
            'term': term,
        }
    )

    root = ElementTree.fromstring(response.text.encode('utf-8'))
    course_count = len(root)

    bar_count = 40

    for i, course in enumerate(root):
        if verbose:
            count = int(float(i + 1) / course_count * bar_count)
            log = '\r[' + '=' * count + ' ' * (bar_count - count) + ']'
            print log,

        course_json = {}

        for attr in course:
            name = ATTRIBUTE_MAP.get(attr.tag, attr.tag)
            course_json[name] = attr.text

        Course.from_json(course_json).save()


class Command(BaseCommand):
    help = 'Update courses in the database'

    def add_arguments(self, parser):
        parser.add_argument('term', type=str)

    def handle(self, *args, **options):
        term = args[0]
        verbose = int(options['verbosity']) > 1

        fetch_courses(term, verbose=verbose)
