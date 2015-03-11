import re

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible


@deconstructible
class Range(object):
    """ An object to represent a range from a minimum to a maximum.

    """
    def __init__(self, minimum, maximum):
        """ Initialize the range.

        minimum : float
            The minimum value for the range.

        maximum : float
            The maximum value for the range.

        """
        self.minimum = minimum
        self.maximum = maximum

    def __str__(self):
        """ Convert the range to a human-readable string.

        """
        if self.minimum == self.maximum:
            return str(self.minimum)
        else:
            return '%s to %s' % (self.minimum, self.maximum)

    def __eq__(self, other):
        """ Assert equality between ranges by comparing their minimums and
        maximums.

        """
        return self.minimum == other.minimum and self.maximum == other.maximum

    @classmethod
    def from_string(cls, string):
        """ Create a range from a string such as '1 to 3' or '1 or 2'. A
        single value such as '4' creates a range with minimum=4 and maximum=4.

        """
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
        """ Initialize the RangeField.

        """
        self.minimum = minimum
        self.maximum = maximum
        kwargs['max_length'] = 20
        super(RangeField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        """ Deconstruct the RangeField into serializable components.

        """
        name, path, args, kwargs = super(RangeField, self).deconstruct()
        kwargs['minimum'] = self.minimum
        kwargs['maximum'] = self.maximum
        del kwargs['max_length']
        return name, path, args, kwargs

    def from_db_value(self, value, connection):
        """ Create a Range object from the string in the database.

        """
        if value is None:
            return value

        return Range.from_string(value)

    def to_python(self, value):
        """ Create a Range object from the given value.

        """
        if isinstance(value, Range) or value is None:
            return value

        return Range.from_string(value)

    def get_prep_value(self, value):
        """ Ensure that the value is a string before writing to the database.

        """
        if isinstance(value, Range):
            return str(value)
        return value

    def __str__(self):
        """ Represent the field as a Range object.

        """
        return str(Range(self.minimum, self.maximum))
