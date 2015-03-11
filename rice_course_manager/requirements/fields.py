from django.db import models
import ast


class ListField(models.TextField):
    """ A custom field to store a Python list.

    """
    __metaclass__ = models.SubfieldBase

    def to_python(self, value):
        """ Convert a value to a list.

        """
        if not value:
            value = []

        if isinstance(value, list):
            return value

        return ast.literal_eval(value)

    def get_prep_value(self, value):
        """ Ensure that the value is a string before writing to database.

        """
        if value is None:
            return value

        return unicode(value)

    def value_to_string(self, obj):
        """ Convert an object to a string.

        """
        value = self._get_val_from_obj(obj)
        return self.get_db_prep_value(value)
