from django.db import models


class Course(models.Model):
    """ A model to represent a Rice course.

    Attributes:
    -----------
    crn : string
        The unique course registration number corresponding to the course.

    course_id : string
        The identification for the course, e.g. MATH 211 001.

    title : string
        The title of the course.

    instructor : string
        The instructor of the course.

    meeting : string
        The meeting time(s) for the course.

    credits : string
        The number of credits given by the course.

    """
    crn = models.CharField(max_length=5)
    course_id = models.CharField(max_length=12)
    title = models.CharField(max_length=50)
    instructor = models.CharField(max_length=50)
    meeting = models.CharField(max_length=50)
    credits = models.CharField(max_length=10)

    def __str__(self):
        return self.course_id

    def json(self):
        return {
            'crn': self.crn,
            'course_id': self.course_id,
            'title': self.title,
            'instructor': self.instructor,
            'meeting': self.meeting,
            'credits': self.credits
        }
