from random import randint


def random_hex_color():
    """ Generate a random hexadecimal color.
    """
    r = randint(0, 255)
    g = randint(0, 255)
    b = randint(0, 255)

    return '#%x%x%x' % (r, g, b)
