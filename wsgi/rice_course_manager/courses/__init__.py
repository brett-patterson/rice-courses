def fetch_courses(term, verbose=False):
    """ Get all Rice courses for the current term.

    """
    import os
    import sys

    from requests import Session
    from xml.etree import ElementTree

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rice_courses.settings')
    sys.path.append(os.path.dirname(__file__))

    from rice_course_manager.courses.models import Course

    # Hack of django.setup to prevent models from being loaded twice
    from django.apps import apps
    from django.conf import settings
    from django.utils.log import configure_logging
    configure_logging(settings.LOGGING_CONFIG, settings.LOGGING)
    installed = list(settings.INSTALLED_APPS)
    installed.remove('courses')
    installed.remove('accounts')
    apps.populate(installed)

    COURSE_URL = 'https://courses.rice.edu/admweb/!SWKSECX.main'

    ATTRIBUTE_MAP = {
        'course-number': 'course_number',
        'credit-hours': 'credits',
        'distribution-group': 'distribution',
        'start-time': 'start_time',
        'end-time': 'end_time',
        'meeting-days': 'meeting_days',
        'max-enrollment': 'max_enrollment',
        'actual-enrollment': 'actual_enrollment'
    }

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


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print 'Invalid arguments. Expected fetch_courses.py [term]'
        sys.exit(2)

    fetch_courses(sys.argv[1], verbose=True)
