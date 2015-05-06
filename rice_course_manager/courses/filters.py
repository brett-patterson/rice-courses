def course_id_filter(value):
    """ A custom filter set for course ID's.

    """
    split = value.split(' ')
    if len(split) == 1:
        subject = split[0]
        return {
            'subject__istartswith': subject
        }

    elif len(split) == 2:
        subject, number = split
        return {
            'subject__istartswith': subject,
            'course_number__istartswith': number,
        }

    subject, number, section = split
    return {
        'subject__istartswith': subject,
        'course_number__istartswith': number,
        'section__istartswith': section
    }


def distribution_filter(value):
    """ A custom filter set for course distribution.

    """
    if len(value) == 0:
        value = 0
    elif 'i' in value.lower():
        value = value.lower().count('i')

    return {
        'distribution': value
    }


def meetings_filter(value):
    """ A custom filter set for course meetings.

    """
    if ' ' in value:
        days, times = value.split(' ')
        if '-' in times:
            start, end = times.split('-')
            return {
                'meeting_days__icontains': days,
                'start_time__icontains': start,
                'end_time__icontains': end
            }

        return {
            'meeting_days__icontains': days,
            'start_time__icontains': times
        }

    return {
        'meeting_days__icontains': value
    }


def build_filter(key, func):
    """ Build a generic filter for the course property `key` and the Django
    filter type `func`.

    """
    field = '%s__%s' % (key, func)

    def _filter(value):
        return {
            field: value
        }

    return _filter


FILTER_FUNCS = {
    'crn': build_filter('crn', 'icontains'),
    'courseID': course_id_filter,
    'title': build_filter('title', 'icontains'),
    'instructor': build_filter('instructor', 'icontains'),
    'meetings': meetings_filter,
    'credits': build_filter('credits', 'contains'),
    'distribution': distribution_filter
}


def filter_courses(courses, filters):
    """ Filter a QuerySet of courses with a list of client side filters.

    """
    filtered = courses
    for key, value in filters:
        filtered = filtered.filter(**FILTER_FUNCS[key](value))

    return filtered
