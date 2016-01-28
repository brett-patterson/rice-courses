def overlap(course_one, course_two):
    """ Check whether course one overlaps with course two.

    Parameters:
    -----------
    course_one : Course
        The first course.

    course_two : Course
        The second course.

    Returns:
    --------
    A boolean representing whether the two courses overlap in time.
    """
    for interval_one in course_one.meetings:
        for interval_two in course_two.meetings:
            if (interval_two.start < interval_one.start < interval_two.end or
                    interval_two.start < interval_one.end < interval_two.end or
                    interval_one.start == interval_two.start or
                    interval_one.start == interval_two.end or
                    interval_one.end == interval_two.start):
                return True

    return False
