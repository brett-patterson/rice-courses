import json
import re

from dateutil.parser import parse
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
    __metaclass__ = models.SubfieldBase

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


@deconstructible
class DateTimeInterval(object):
    """ Implements an interval represented by a start and end datetime.

    """
    def __init__(self, start, end):
        """ Initialize the DateTimeInterval.

        Parameters:
        -----------
        start : datetime.datetime
            The start of the interval.

        end : datetime.datetime
            The end of the interval.

        """
        self.start = start
        self.end = end

    def __str__(self):
        """ Convert the DateTimeInterval to a string.

        """
        return '%s,%s' % (self.start.isoformat(), self.end.isoformat())

    def __eq__(self, other):
        """ Assert equality between intervals by comparing their starts and
        ends.

        """
        return self.start == other.start and self.end == other.end

    @classmethod
    def from_string(cls, value):
        """ Construct a DateTimeInterval from a string of two ISO format
        date times separated by a comma.

        """
        return cls(*[parse(date_str) for date_str in value.split(',')])


class DateTimeListField(models.CharField):
    """ Implements a Django field used to store a list of datetime objects.

    """
    __metaclass__ = models.SubfieldBase

    def __init__(self, objects=[], *args, **kwargs):
        self.objects = objects
        kwargs['max_length'] = 300
        super(DateTimeListField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        """ Deconstruct the DateTimeListField into serializable components.

        """
        name, path, args, kwargs = super(DateTimeListField, self).deconstruct()
        del kwargs['max_length']
        kwargs['objects'] = self.objects
        return name, path, args, kwargs

    def from_db_value(self, value, expression, connection, context):
        """ Create a list of dates from the string in the database.

        """
        if value is None:
            return value

        return [DateTimeInterval.from_string(i) for i in json.loads(value)]

    def to_python(self, value):
        """ Create a list of dates from the given value.

        """
        if (isinstance(value, list) and len(value) > 0 and
            isinstance(value[0], DateTimeInterval)) or value is None:
            return value

        return [DateTimeInterval.from_string(i) for i in json.loads(value)]

    def get_prep_value(self, value):
        """ Ensure that the value is a string before writing to the database.

        """
        if isinstance(value, list):
            return json.dumps([str(d) for d in value])

        return value
