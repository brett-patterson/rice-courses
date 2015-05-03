import re

from dateutil.parser import parse
from django.db import models

from fields import RangeField, Range, DateTimeListField, DateTimeInterval


def try_set(dictionary, key, target, coerce_func=lambda x: x):
    """ Attempt to set a value on a target with the value from a dictionary.
    Assumes the desired attribute on the target is named the same as the
    dictionary key. The value can optionally be coerced by a function.

    """
    if key in dictionary:
        setattr(target, key, coerce_func(dictionary[key]))


def parse_distribution(string):
    """ Parse a distribution string such as 'III' and return a numerical
    representation. For example, parse_distribution('II') would return 2.

    """
    return string.count('I')


def parse_credits(string):
    """ Parse a credits string into a Range object.

    """
    return Range.from_string(string)


def parse_meetings(meetings_string):
    """ Parse a meetings string in the format 'days start_times-end_times'
    into DateTimeInterval objects.

    """
    meetings = []

    pattern = r'([A-Z,\s]+)([0-9,\s]+)-([0-9,\s]+)'
    match = re.search(pattern, meetings_string)

    if not match:
        return meetings

    days, starts, ends = [group.strip().split(', ') for group in match.groups()]

    for i, day_string in enumerate(days):
        start_string = starts[i]
        end_string = ends[i]

        for day_abbr in day_string:
            day = DAY_NUMBER_MAP[day_abbr]
            start = parse('2007-01-%s %s' % (day, start_string))
            end = parse('2007-01-%s %s' % (day, end_string))

            meetings.append(DateTimeInterval(start, end))

    return meetings


# Maps each weekday letter to a numbered day string, assuming January 2007
DAY_NUMBER_MAP = {
    'M': '01',
    'T': '02',
    'W': '03',
    'R': '04',
    'F': '05',
    'S': '06',
    'U': '07'
}


class Course(models.Model):
    """ A model to represent a course.

    """
    # The 4-letter subject code for the course.
    subject = models.CharField(max_length=4, default='')

    # The 3-digit number for the course.
    course_number = models.PositiveIntegerField(default=0)

    # The title of the course.
    title = models.CharField(max_length=50, default='')

    # The section number for the course.
    section = models.CharField(max_length=3, default='')

    # The physical location of the course on campus.
    location = models.CharField(max_length=10, default='')

    # The distribution of the course, represented as a single integer.
    distribution = models.PositiveIntegerField(default=0)

    # The number of credits that the course awards.
    credits = RangeField(default=Range(0, 0))

    # The meeting dates and times for the course
    meetings = DateTimeListField(default=[])

    # A full description of the content of the course.
    description = models.TextField(default='')

    # The number of students currently enrolled in the course.
    enrollment = models.PositiveIntegerField(default=0)

    # The maximum number of students allowed to enroll in the course.
    max_enrollment = models.PositiveIntegerField(default=0)

    # The number of students currently on the waitlist for the course.
    waitlist = models.PositiveIntegerField(default=0)

    # The maximum number of students allowed to be on the waitlist for the
    # course.
    max_waitlist = models.PositiveIntegerField(default=0)

    # Restrictions for the course. E.g. restricted to a certain major
    restrictions = models.TextField(default='')

    # Any prerequisite courses required for this course.
    prerequisites = models.TextField(default='')

    # Any corequisite courses required for this course.
    corequisites = models.TextField(default='')

    # Two letter string representing the group of courses cross-listed
    # together
    cross_list_group = models.CharField(default='', max_length=2)

    # The name of the instructor for this course.
    instructor = models.CharField(max_length=200, default='')

    # The unique 5-digit number for this course, represented as a string.
    crn = models.CharField(max_length=5, primary_key=True)

    def __repr__(self):
        return self.course_id()

    def course_id(self):
        """ Represent each course by its subject and course number.
        E.g. MATH 101

        """
        return '%s %i %s' % (self.subject, self.course_number, self.section)

    def json(self, cross_list=True):
        """ Convert the course to a JSON-serializable dictionary.

        """
        result = {
            'subject': self.subject,
            'course_number': self.course_number,
            'title': self.title,
            'section': self.section,
            'location': self.location,
            'distribution': self.distribution,
            'credits': str(self.credits),
            'meetings': [str(m) for m in self.meetings],
            'description': self.description,
            'enrollment': self.enrollment,
            'max_enrollment': self.max_enrollment,
            'waitlist': self.waitlist,
            'max_waitlist': self.max_waitlist,
            'restrictions': self.restrictions,
            'prerequisites': self.prerequisites,
            'corequisites': self.corequisites,
            'instructor': self.instructor,
            'crn': self.crn
        }

        if cross_list:
            result['cross_list_group'] = [c.json(cross_list=False)
                                          for c in self.cross_listed_group()]

        return result

    @classmethod
    def from_json(cls, json_obj):
        """ Construct a course from a JSON-serializable dictionary.

        """
        self = cls()

        try_set(json_obj, 'subject', self)
        try_set(json_obj, 'course_number', self)
        try_set(json_obj, 'title', self)
        try_set(json_obj, 'section', self)
        try_set(json_obj, 'location', self)
        try_set(json_obj, 'distribution', self, parse_distribution)
        try_set(json_obj, 'credits', self, parse_credits)
        try_set(json_obj, 'description', self)
        try_set(json_obj, 'enrollment', self)
        try_set(json_obj, 'max_enrollment', self)
        try_set(json_obj, 'waitlist', self)
        try_set(json_obj, 'max_waitlist', self)
        try_set(json_obj, 'restrictions', self)
        try_set(json_obj, 'prerequisites', self)
        try_set(json_obj, 'corequisites', self)
        try_set(json_obj, 'instructor', self)
        try_set(json_obj, 'crn', self)
        try_set(json_obj, 'cross_list_group', self)

        if ('meeting_days' in json_obj and 'start_time' in json_obj and
                'end_time' in json_obj):
            meetings = '%s %s-%s' % (json_obj['meeting_days'],
                                     json_obj['start_time'],
                                     json_obj['end_time'])

            self.meetings = parse_meetings(meetings)

        return self

    def cross_listed_group(self):
        """ Get the list of other courses that are in the same cross-list
        group.

        """
        if self.cross_list_group == '':
            return []

        group = Course.objects.filter(cross_list_group=self.cross_list_group)
        return group.exclude(crn=self.crn)
