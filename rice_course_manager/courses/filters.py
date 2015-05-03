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


def build_contains_filter(key):
    field = '%s__icontains' % key

    def contains_filter(value):
        return {
            field: value
        }

    return contains_filter


FILTER_FUNCS = {
    'crn': build_contains_filter('crn'),
    'courseID': course_id_filter,
    'title': build_contains_filter('title'),
    'instructor': build_contains_filter('instructor'),
    'meetings': build_contains_filter('meetings'),
    'credits': build_contains_filter('credits'),
    'distribution': distribution_filter
}


def filter_courses(courses, filters):
    filtered = courses
    for key, value in filters:
        filtered = filtered.filter(**FILTER_FUNCS[key](value))

    return filtered
