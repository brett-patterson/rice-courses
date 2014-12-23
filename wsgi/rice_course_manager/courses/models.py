from django.db import models

from fields import RangeField, Range


def parse_distribution(string):
    """ Parse a distribution string such as 'III' and return a numerical
    representation. For example, parse_distribution('II') would return 2.

    """
    return string.count('I')


def parse_credits(string):
    """ Parse a credits string into a Range object.

    """
    return Range.from_string(string)


# Maps each course attribute to a coercing function used to coerce from string
# to the appropriate type.
COERCE_MAP = {
    'meeting_days': unicode,
    'subject': unicode,
    'course_number': int,
    'title': unicode,
    'section': unicode,
    'location': unicode,
    'distribution': parse_distribution,
    'credits': parse_credits,
    'start_time': unicode,
    'end_time': unicode,
    'description': unicode,
    'enrollment': int,
    'max_enrollment': int,
    'waitlist': int,
    'max_waitlist': int,
    'restrictions': unicode,
    'prerequisites': unicode,
    'corequisites': unicode,
    'instructor': unicode,
    'crn': unicode,
}


class Course(models.Model):
    """ A model to represent a course.

    """
    # The days of the week that the courses meets.
    # Days are represented as 'M', 'T', 'W', 'R', 'F'
    meeting_days = models.CharField(max_length=10, default='')

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

    # The start time of the course, as a string.
    start_time = models.CharField(max_length=20, default='')

    # The end time of the course, as a string.
    end_time = models.CharField(max_length=20, default='')

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

    # The name of the instructor for this course.
    instructor = models.CharField(max_length=200, default='')

    # The unique 5-digit number for this course, represented as a string.
    crn = models.CharField(max_length=5, primary_key=True)

    def __str__(self):
        """ Represent each course by its subject and course number.
        E.g. MATH 101

        """
        return '%s %i' % (self.subject, self.course_number)

    def json(self):
        """ Convert the course to a JSON-serializable dictionary.

        """
        return {
            'meeting_days': self.meeting_days,
            'subject': self.subject,
            'course_number': self.course_number,
            'title': self.title,
            'section': self.section,
            'location': self.location,
            'distribution': self.distribution,
            'credits': self.credits,
            'start_time': self.start_time,
            'end_time': self.end_time,
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

    @classmethod
    def from_json(cls, json_obj):
        """ Construct a course from a JSON-serializable dictionary.

        """
        self = cls()

        for field in self._meta.fields:
            name = field.name

            if name in json_obj:
                val = json_obj[name]

                typ = COERCE_MAP.get(name, type(field.default))

                setattr(self, name, typ(val))

        return self
