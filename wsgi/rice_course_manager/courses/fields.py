import re

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible


@deconstructible
class Range(object):
    def __init__(self, minimum, maximum):
        self.minimum = minimum
        self.maximum = maximum

    def __str__(self):
        if self.minimum == self.maximum:
            return str(self.minimum)
        else:
            return '%s to %s' % (self.minimum, self.maximum)

    def __eq__(self, other):
        return self.minimum == other.minimum and self.maximum == other.maximum

    @classmethod
    def from_string(cls, string):
        try:
            minimum = maximum = float(string)
        except ValueError:
            pattern = r'(?P<minimum>[\.\d]+)\s*(to|or)\s*(?P<maximum>[\.\d]+)'
            matches = re.match(pattern, string, flags=re.IGNORECASE)
            if matches:
                match_dict = matches.groupdict()
                minimum = float(match_dict['minimum'])
                maximum = float(match_dict['maximum'])
            else:
                raise ValidationError('Invalid input for Range instance')

        return cls(minimum, maximum)


class RangeField(models.CharField):
    """ Implements a float range field.

    """
    def __init__(self, minimum=0, maximum=0, *args, **kwargs):
        self.minimum = minimum
        self.maximum = maximum
        kwargs['max_length'] = 20
        super(RangeField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(RangeField, self).deconstruct()
        kwargs['minimum'] = self.minimum
        kwargs['maximum'] = self.maximum
        del kwargs['max_length']
        return name, path, args, kwargs

    def from_db_value(self, value, connection):
        if value is None:
            return value

        return Range.from_string(value)

    def to_python(self, value):
        if isinstance(value, Range) or value is None:
            return value

        return Range.from_string(value)

    def get_prep_value(self, value):
        if isinstance(value, Range):
            return str(value)
        return value

    def __str__(self):
        return str(Range(self.minimum, self.maximum))
