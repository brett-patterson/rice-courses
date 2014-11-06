from django.db import models

from fields import RangeField, Range


def parse_distribution(string):
    return string.count('I')


def parse_credits(string):
    return Range.from_string(string)


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
    'instructor': unicode,
    'crn': unicode,
}


class Course(models.Model):
    """ A model to represent a Rice course.

    """
    meeting_days = models.CharField(max_length=10, default='')

    subject = models.CharField(max_length=4, default='')

    course_number = models.PositiveIntegerField(default=0)

    title = models.CharField(max_length=50, default='')

    section = models.CharField(max_length=3, default='')

    location = models.CharField(max_length=10, default='')

    distribution = models.PositiveIntegerField(default=0)

    credits = RangeField(default=Range(0, 0))

    start_time = models.CharField(max_length=20, default='')

    end_time = models.CharField(max_length=20, default='')

    description = models.TextField(default='')

    enrollment = models.PositiveIntegerField(default=0)

    max_enrollment = models.PositiveIntegerField(default=0)

    instructor = models.CharField(max_length=200, default='')

    crn = models.CharField(max_length=5, primary_key=True)

    def __str__(self):
        return '%s %i' % (self.subject, self.course_number)

    def json(self):
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
            'instructor': self.instructor,
            'crn': self.crn
        }

    @classmethod
    def from_json(cls, json_obj):
        self = cls()

        for field in self._meta.fields:
            name = field.name

            if name in json_obj:
                val = json_obj[name]

                typ = COERCE_MAP.get(name, type(field.default))

                setattr(self, name, typ(val))

        return self
