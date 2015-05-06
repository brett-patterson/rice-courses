def course_id_filter(value):
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
    if len(value) == 0:
        value = 0
    elif 'i' in value.lower():
        value = value.lower().count('i')

    return {
        'distribution': value
    }


def build_filter(key, func):
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
    'meetings': build_filter('meetings', 'contains'),
    'credits': build_filter('credits', 'contains'),
    'distribution': distribution_filter
}


def filter_courses(courses, filters):
    filtered = courses
    for key, value in filters:
        filtered = filtered.filter(**FILTER_FUNCS[key](value))

    return filtered
