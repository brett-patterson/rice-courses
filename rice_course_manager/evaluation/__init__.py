import base64
import cookielib
import re
from datetime import datetime
from xml.etree import ElementTree

import mechanize
from bs4 import BeautifulSoup
from requests import Session

from models import Evaluation


# TODO: This is an ugly, fragile hack and should be replaced by a robust
# implementation as soon as evaluation data can be accessed correctly
# from Rice's servers


EVALS_URL = 'https://esther.rice.edu/selfserve/swkscmt.main'
DATA_URL = 'https://esther.rice.edu/selfserve/!swkscmp.ajax'
COURSE_URL = 'https://courses.rice.edu/admweb/!SWKSECX.main'
LOGIN_URL = 'https://esther.rice.edu/selfserve/twbkwbis.P_ValLogin/'


cookie_jar = cookielib.CookieJar()
session = Session()


def esther_login():
    """ Log into Esther using a simulated browser to store the necessary login
        cookies for future requests.

    """
    if 'SESSID' not in [c.name for c in cookie_jar]:
        br = mechanize.Browser()
        br.set_cookiejar(cookie_jar)
        br.open(LOGIN_URL)
        br.select_form(name="loginform")

        # Encode credentials in base64 so that although not any more secure,
        # we don't store credentials as plain text
        br['sid'] = base64.b64decode('UzAxMTk5NjA5')
        br['PIN'] = base64.b64decode('aXRpbjRjdXI=')

        br.submit()
        session.cookies = cookie_jar


def clean_text(text):
    """ Strip text and remove newline characters.

    Parameters:
    -----------
    text : str
        The text to be cleaned.

    Returns:
    --------
    A cleaned version of the text.

    """
    return text.strip().replace('\\n', '')


def parse_question_src(src):
    """ Parse the src attribute of an <img/> tag representing the data
    of an evaluation question chart.

    Paramters:
    ----------
    src : string
        The src attribute of the <img/> tag

    Returns:
    --------
    A 2-tuple of the question title, list of data in format (label, value)

    """
    cleaned = src[src.index('?') + 1:]

    queries = {}
    for query in cleaned.split('&'):
        key, val = query.split('=')
        queries[key] = val

    title = clean_text(queries['chartTitle'])
    labels = [clean_text(l[l.index('\\n') + 2:])
              for l in queries['sampleLabels'].split(',')]
    values = [int(v) for v in queries['sampleValues'].split(',')]

    return title, zip(labels, values)


def parse_comment(comment_text):
    """ Parse the text of a comment into its content and date.

    Parameters:
    -----------
    comment_text : string
        The text of the comment

    Returns:
    --------
    A 2-tuple of comment, datetime object

    """
    comment = comment_text.replace('Report a Concern', '')

    stamp_pattern = r'([0-9]{2}/[0-9]{2}/[0-9]{4} [0-9]{2}:[0-9]{2} [AP].M.)'
    match = re.search(stamp_pattern, comment)

    comment = comment[:match.start()]
    stamp = datetime.strptime(match.group(0).replace('.', ''),
                              '%m/%d/%Y %I:%M %p')

    return comment, stamp


def parse_evaluation(text, course, evaluation_type):
    """ Convert a block of HTML text to an Evaluation object.

    Parameters:
    -----------
    text : str
        The HTML content.

    course : Course
        The course that this evaluation is for.

    evaluation_type : str
        Whether this a course or instructor evaluation. Accepts the values
        'c' or 'i'.

    Returns:
    --------
    An Evaluation object or None if the HTML cannot be correctly parsed.

    """
    soup = BeautifulSoup(text)

    if evaluation_type == 'c':
        course_div = soup.find('div', attrs={'data-crn': course.crn})
    else:
        course_div = soup.find('div', id='results-%s' % course.crn)

    if course_div is None:
        return None

    evaluation = Evaluation.objects.create(evaluation_type=evaluation_type,
                                           crn=course.crn)

    for question_img in course_div.find_all('img'):
        title, data = parse_question_src(question_img['src'])
        question = evaluation.question_set.create(text=title)

        for i, (label, value) in enumerate(data):
            question.choice_set.create(
                value=i+1,
                percent=value,
                prompt=label
            )

    for comment_div in course_div.find_all(class_='cmt'):
        comment, stamp = parse_comment(comment_div.text)
        evaluation.comment_set.create(
            text=comment,
            date=stamp
        )

    return evaluation


# Fetch and cache a list of term codes.
terms_response = session.post(
    url=DATA_URL,
    data={
        'p_data': 'TERMS'
    }
)

term_root = ElementTree.fromstring(terms_response.text.encode('utf-8'))

term_codes = []
for term_element in term_root.findall('TERM'):
    code = term_element.get('CODE')
    if not code.endswith('30'):
        term_codes.insert(0, code)


def child_element_text(elem, child_elem_name, default=''):
    """ Find an XML child element's text, if it exists.

    Parameters:
    -----------
    elem : Element
        The XML element to look within.

    child_elem_name : str
        The name of the child element to look for.

    default : str [default '']
        The default to return if no child exists.


    Returns:
    --------
    The child element's text or `default`.

    """
    child_elem = elem.find(child_elem_name)
    if child_elem is not None:
        return child_elem.text
    return default


def crn_for_course_evaluation(course):
    """ Find a CRN for the given course that has valid evaluations. This method
    will traverse backwards through the terms in order to find a valid CRN.

    Parameters:
    -----------
    course : Course
        The course to look for.

    Returns:
    --------
    A tuple of (term, crn) or (None, None)

    """
    for term in term_codes:
        course_response = session.post(
            url=COURSE_URL,
            data={
                'term': term,
                'subj': course.subject
            }
        )

        course_response_text = course_response.text.encode('utf-8')
        course_root = ElementTree.fromstring(course_response_text)
        crn = None

        for course_element in course_root.findall('course'):
            subject = child_element_text(course_element, 'subject')
            course_num = child_element_text(course_element, 'course-number')
            title = child_element_text(course_element, 'title')
            instructor = child_element_text(course_element, 'instructor')
            if ((course.subject == subject and
                    course.course_number == int(course_num))
                    or (course.title == title and
                        course.instructor == instructor)):
                crn = course_element.find('crn').text
                break

        if crn is not None:
            return (term, crn)
    return (None, None)


def get_course_evaluation(course):
    """ Get the course evalution for a given course.

    Parameters:
    -----------
    course : Course
        The course to fetch evaluations for.

    Returns:
    --------
    An Evaluation object or None.

    """
    esther_login()

    term, crn = crn_for_course_evaluation(course)

    if crn is None:
        return crn

    response = session.post(
        url=EVALS_URL,
        data={
            'p_term': term,
            'p_type': 'Course',
            'p_crn': crn,
            'p_confirm': '1'
        }
    )

    return parse_evaluation(response.text.encode('utf-8'), course, 'c')


def webid_for_instructor_evaluation(course):
    """ Find an instructor's corresponding web ID.

    Parameters:
    -----------
    course : Course
        The course whose instructor should be looked up.

    Returns:
    --------
    A tuple of (term, webid) or (None, None)

    """
    for term in term_codes:
        instructor_response = session.post(
            url=DATA_URL,
            data={
                'p_term': term,
                'p_data': 'INSTRUCTORS'
            }
        )

        course_response = session.post(
            url=COURSE_URL,
            data={
                'term': term,
                'subj': course.subject
            }
        )

        course_response_text = course_response.text.encode('utf-8')
        course_root = ElementTree.fromstring(course_response_text)
        crn = None

        for course_element in course_root.findall('course'):
            subject = child_element_text(course_element, 'subject')
            course_num = child_element_text(course_element, 'course-number')
            title = child_element_text(course_element, 'title')
            instructor = child_element_text(course_element, 'instructor')
            if ((course.subject == subject and
                    course.course_number == int(course_num))
                    or (course.title == title and
                        course.instructor == instructor)):
                crn = course_element.find('crn').text
                break

        if crn is None:
            continue

        root = ElementTree.fromstring(instructor_response.text.encode('utf-8'))
        for instructor_element in root.findall('INSTRUCTOR'):
            if instructor_element.get('NAME') == course.instructor:
                return (term, instructor_element.get('WEBID'))
    return (None, None)


def get_instructor_evaluation(course):
    """ Get the instructor evalution for a given course.

    Parameters:
    -----------
    course : Course
        The course to fetch evaluations for.

    Returns:
    --------
    An Evaluation object or None.

    """
    esther_login()

    term, webid = webid_for_instructor_evaluation(course)
    if webid is None:
        return webid

    response = session.post(
        url=EVALS_URL,
        data={
            'p_term': term,
            'p_type': 'Instructor',
            'p_instr': webid,
            'p_confirm': '1'
        }
    )

    return parse_evaluation(response.text.encode('utf-8'), course, 'i')
