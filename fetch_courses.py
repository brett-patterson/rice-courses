import urllib2
from HTMLParser import HTMLParser

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'rice_courses.settings'

from courses.models import Course


COURSE_URL = 'https://courses.rice.edu/admweb/!SWKSCAT.cat?p_action=QUERY&p_term=201520&p_name=STATIC'  # noqa


COURSE_DATA_MAP = {
    'searchCourse': 'course_id',
    'searchTitle': 'title',
    'searchInstructor': 'instructor',
    'searchMeeting': 'meeting',
    'credits': 'credits',
    'searchSection': None,
    'searchSession': None
}


class CoursesParser(HTMLParser):
    """ A class to fetch and parse courses from the Rice website.

    """
    def __init__(self):
        HTMLParser.__init__(self)
        self.in_table = False
        self.in_results = False
        self.in_course = False
        self.course_data_type = None

    def get_class(self, attrs):
        """ Get the class attribute from the list of tag attributes.

        """
        for attr in attrs:
            if attr[0] == 'class':
                return attr[1]
        return None

    def handle_starttag(self, tag, attrs):
        tag_class = self.get_class(attrs)

        if tag == 'table' and tag_class == 'searchResults':
            self.in_table = True

        elif self.in_table and tag == 'tbody':
            self.in_results = True

        if self.in_results:
            if tag == 'tr':
                self.in_course = True
                self.current_course = Course()

            elif self.in_course and tag == 'td':
                self.course_data_type = COURSE_DATA_MAP[tag_class]

            elif self.in_course and tag == 'a':
                self.course_data_type = 'crn'

    def handle_endtag(self, tag):
        if tag == 'table':
            self.in_table = False

        elif self.in_table and tag == 'tbody':
            self.in_results = False

        elif self.in_results and tag == 'tr':
            self.in_course = False
            self.current_course.save()

    def handle_data(self, data):
        if self.in_course and self.course_data_type is not None:
            setattr(self.current_course, self.course_data_type, data)


def fetch_courses():
    """ Get all Rice courses for the current term.

    """
    parser = CoursesParser()
    courses_data = urllib2.urlopen(COURSE_URL)
    parser.feed(courses_data.read())
    courses_data.close()

if __name__ == '__main__':
    fetch_courses()
