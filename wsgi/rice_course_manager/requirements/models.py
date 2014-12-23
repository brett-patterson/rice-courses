from django.db import models

from fields import ListField


class Major(models.Model):
    """ A model to represent a major.

    """
    # The name of the major.
    name = models.TextField(default='')

    # The available degrees within the major.
    degrees = ListField()

    def __repr__(self):
        return '<Major: %s>' % self.name

    def courses_for_degree(self, degree):
        """ Find all courses for the given degree.

        Parameters:
        -----------
        degree : str
            The degree to filter courses for.

        Returns:
        --------
        A list of Course objects.

        """
        if degree not in self.degrees:
            return []

        result = []
        for req in self.majorrequirement_set.all():
            if len(req.restrict) == 0 or degree in req.restrict:
                result.extend(req.courses.all())

        return result

    def all_courses(self):
        """ Get all courses for the major.

        """
        result = []

        for req in self.majorrequirement_set.all():
            result.extend(req.courses.all())

        return result


class Requirement(models.Model):
    """ A model to represent a general requirement of courses.

    """
    courses = models.ManyToManyField('courses.Course')


class MajorRequirement(Requirement):
    """ A model to represent a requirement specifically for a major.

    """
    # The major the requirement represents.
    major = models.ForeignKey('Major')

    # The degree restrictions for the requirement.
    restrict = ListField()
