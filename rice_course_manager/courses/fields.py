import json

from dateutil.parser import parse
from django.db import models
from django.utils.deconstruct import deconstructible

from psycopg2.extras import NumericRange


class RangeContainsLookup(models.Lookup):
    lookup_name = 'contains'

    def as_sql(self, qn, connection):
        lhs, lhs_params = self.process_lhs(qn, connection)
        rhs, rhs_params = self.process_rhs(qn, connection)

        if '%%' in rhs_params:
            return '', []

        params = lhs_params + [p.replace('%', '') for p in rhs_params]
        return '%s @> %s::numeric' % (lhs, rhs), params


class FloatRangeField(models.CharField):
    """ Implements a float range field.

    """
    def __init__(self, *args, **kwargs):
        """ Initialize the FloatRangeField.

        """
        kwargs['max_length'] = 20
        super(FloatRangeField, self).__init__(*args, **kwargs)

    def db_type(self, connection):
        """ Represent the FloatRangeField as a custom PostgresSQL field.

        """
        return 'numrange'

    def get_lookup(self, lookup_name):
        """ Use a custom implementation for the 'contains' lookup.

        """
        if lookup_name == 'contains':
            return RangeContainsLookup
        return super(FloatRangeField, self).get_lookup(lookup_name)

    def deconstruct(self):
        """ Deconstruct the FloatRangeField into serializable components.

        """
        name, path, args, kwargs = super(FloatRangeField, self).deconstruct()
        del kwargs['max_length']
        return name, path, args, kwargs

    def from_db_value(self, value, expression, connection, context):
        """ Create a list of dates from the string in the database.

        """
        return self.to_python(value)

    def to_python(self, value):
        """ Create the approriate from the given value.

        """
        if isinstance(value, tuple) and len(value) == 2 or value is None:
            return value
        elif isinstance(value, NumericRange):
            if value.isempty:
                return (0.0, 0.0)
            else:
                return (value.lower, value.upper)

        return tuple(float(a) for a in value[1:-1].split(','))

    def get_prep_value(self, value):
        """ Ensure that the value is a string before writing to the database.

        """
        if isinstance(value, tuple) and len(value) == 2:
            return '[%s,%s]' % value
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
