from django.db import models

from fields import ListField


class Major(models.Model):
    name = models.TextField(default='')
    degrees = ListField()

    def __repr__(self):
        return '<Major: %s>' % self.name

    def courses_for_degree(self, degree):
        if degree not in self.degrees:
            return []

        result = []
        for req in self.majorrequirement_set.all():
            if len(req.restrict) == 0 or degree in req.restrict:
                result.extend(req.courses.all())

        return result

    def all_courses(self):
        result = []

        for req in self.majorrequirement_set.all():
            result.extend(req.courses.all())

        return result


class Requirement(models.Model):
    courses = models.ManyToManyField('courses.Course')


class MajorRequirement(Requirement):
    major = models.ForeignKey('Major')
    restrict = ListField()
