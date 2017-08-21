import re
import time
import datetime

from django.core.exceptions import ValidationError
from django.db import models

from fields import DateTimeInterval, DateTimeListField, FloatRangeField
from terms.models import Term


TIME_FORMAT = '%H%M'
DAY_ORDER = ['M', 'T', 'W', 'R', 'F', 'S', 'U']


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
    """ Parse a credits string into a range tuple.

    """
    try:
        minimum = maximum = float(string)

    except ValueError:
        pattern = r'(?P<minimum>[\.\d]+)\s*(?:to|or)\s*(?P<maximum>[\.\d]+)'
        matches = re.match(pattern, string, flags=re.IGNORECASE)
        if matches:
            match_dict = matches.groupdict()
            minimum = float(match_dict['minimum'])
            maximum = float(match_dict['maximum'])
        else:
            raise ValidationError(
                'Invalid input for Range instance: "%s"' % string
            )

    return minimum, maximum


def simplest_float(value):
    """ Return the simplest number type for the given floating value. That is,
    if a floating point number has no decimal part (e.g. 4.0) convert it to an
    integer (e.g. 4).

    """
    if float(value) == int(value):
        return int(value)
    return value


def display_credits(credits_range):
    """ Convert a tuple credits range into a formatted string.

    """
    lower, upper = [simplest_float(value) for value in credits_range]

    if lower == upper:
        return str(lower)

    else:
        return '%s - %s' % (lower, upper)


def parse_meetings(days, start_times, end_times):
    """ Parse a meetings string in the format 'days start_times-end_times'.
    """
    meetings = []
    days = days.strip().split(', ')
    starts = start_times.strip().split(', ')
    ends = end_times.strip().split(', ')

    for i, day_string in enumerate(days):
        start_string = starts[i]
        end_string = ends[i]

        for day in day_string:
            start = time.strptime(start_string, TIME_FORMAT)
            start = datetime.time(hour=start.tm_hour, minute=start.tm_min)

            end = time.strptime(end_string, TIME_FORMAT)
            end = datetime.time(hour=end.tm_hour, minute=end.tm_min)

            meetings.append({'day': day, 'start': start, 'end': end})

    return meetings


class Course(models.Model):
    """ A model to represent a course.
    """
    class Meta:
        unique_together = (('term', 'crn'),)

    # The term for this course
    term = models.ForeignKey(Term)

    # The unique 5-digit number for this course, represented as a string.
    crn = models.CharField(max_length=5)

    # The 4-letter subject code for the course.
    subject = models.CharField(max_length=4, default='')

    # The 3-digit number for the course.
    course_number = models.PositiveIntegerField(default=0)

    # The title of the course.
    title = models.CharField(max_length=50, default='')

    # The section number for the course.
    section = models.CharField(max_length=3, default='')

    # The physical location of the course on campus.
    location = models.CharField(max_length=50, default='')

    # The distribution of the course, represented as a single integer.
    distribution = models.PositiveIntegerField(default=0)

    # The number of credits that the course awards.
    credits = FloatRangeField(default=(0, 0))

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

    # The name of the instructor(s) for this course.
    instructor = models.TextField(default='')

    def __repr__(self):
        return self.course_id()

    def course_id(self):
        """ Represent each course by its subject and course number.
        E.g. MATH 101

        """
        return '%s %s %s' % (self.subject, self.course_number, self.section)

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
            'credits': display_credits(self.credits),
            'meetings': sorted([m.json() for m in self.coursemeeting_set.all()], key=lambda m: DAY_ORDER.index(m['day'])),
            'description': self.description,
            'enrollment': self.enrollment,
            'max_enrollment': self.max_enrollment,
            'waitlist': self.waitlist,
            'max_waitlist': self.max_waitlist,
            'restrictions': self.restrictions,
            'prerequisites': self.prerequisites,
            'corequisites': self.corequisites,
            'instructor': self.instructor,
            'crn': self.crn,
            'term': self.term.json()
        }

        if cross_list:
            result['cross_list_group'] = [c.json(cross_list=False)
                                          for c in self.cross_listed_group()]

        return result

    @classmethod
    def from_json(cls, json_obj, term):
        """ Construct a course from a JSON-serializable dictionary.
        """
        self = cls(term=term)

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

        self.save()

        if 'meeting_days' in json_obj and 'start_time' in json_obj and 'end_time' in json_obj:
            meetings = parse_meetings(json_obj['meeting_days'], json_obj['start_time'], json_obj['end_time'])
            for meeting in meetings:
                self.coursemeeting_set.create(**meeting)

        return self

    def cross_listed_group(self):
        """ Get the list of other courses that are in the same cross-list
        group.

        """
        if self.cross_list_group == '':
            return []

        group = Course.objects.filter(cross_list_group=self.cross_list_group)
        return group.exclude(crn=self.crn)


class CourseMeeting(models.Model):
    """ A meeting for a course.
    """
    # The course this meeting is for
    course = models.ForeignKey(Course)

    # The day of the meeting
    day = models.CharField(max_length=1)

    # The start time of the meeting
    start = models.TimeField()

    # The end time of the meeting
    end = models.TimeField()

    def json(self):
        """ Convert the meeting into a JSON-serializable format.
        """
        return {
            'day': self.day,
            'start': str(self.start),
            'end': str(self.end)
        }
