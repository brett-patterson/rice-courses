from django.db import models


class Term(models.Model):
    """ A model to represent a term.
    """
    # The year of the term
    year = models.PositiveIntegerField()

    FALL = 10
    SPRING = 20
    SUMMER = 30
    SEMESTERS = (
        (FALL, 'Fall'),
        (SPRING, 'Spring'),
        (SUMMER, 'Summer')
    )

    # The semester for the term
    semester = models.PositiveIntegerField(choices=SEMESTERS)

    # Whether this is the current term
    current = models.BooleanField(default=False)

    @classmethod
    def current_term(cls):
        """ Get the current term.
        """
        return cls.objects.get(current=True)

    @classmethod
    def from_code(cls, code):
        """ Parse a code obtained from courses.rice.edu into a Term object.
        """
        year = int(code[:4])
        semester = int(code[4:])

        if semester not in [s[0] for s in cls.SEMESTERS]:
            raise ValueError('Invalid semester for term')

        if semester == cls.FALL:
            # Because of the way that courses.rice.edu encodes the terms,
            # 201510 is the fall semester of the academic year 2014-2015
            # and therefore actually Fall 2014
            year -= 1

        return cls(year=year, semester=semester)

    def to_code(self):
        """ Convert the term to a code compatible with the courses.rice.edu API.
        """
        year = self.year
        if self.semester == self.FALL:
            year += 1
        return '%d%d' % (year, self.semester)

    def json(self):
        """ Convert the term to a JSON-serializable dictionary.
        """
        return {
            'id': self.id,
            'name': str(self),
            'current': self.current
        }

    def __repr__(self):
        return str(self)

    def __str__(self):
        return '%s %d' % (dict(self.SEMESTERS)[self.semester], self.year)
