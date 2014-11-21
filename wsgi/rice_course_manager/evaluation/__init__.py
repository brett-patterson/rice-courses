import cookielib
from datetime import datetime
from xml.etree import ElementTree

import mechanize
from bs4 import BeautifulSoup
from requests import Session
from django.conf import settings

from models import Evaluation


EVALS_URL = 'https://esther.rice.edu/selfserve/swkscmt.main'
DATA_URL = 'https://esther.rice.edu/selfserve/!swkscmp.ajax'
COURSE_URL = 'https://courses.rice.edu/admweb/!SWKSECX.main'
LOGIN_URL = 'https://esther.rice.edu/selfserve/twbkwbis.P_ValLogin/'


br = mechanize.Browser()
cookie_jar = cookielib.CookieJar()
br.set_cookiejar(cookie_jar)

br.set_handle_equiv(True)
br.set_handle_redirect(True)
br.set_handle_referer(True)
br.set_handle_robots(False)
br.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=1)
br.addheaders = [('User-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 Safari/537.36')]  # noqa


br.open(LOGIN_URL)
br.select_form(name="loginform")
br['sid'] = 'S01199609'
br['PIN'] = 'is9d9enuf'
br.submit()
br.close()

session = Session()
session.cookies = cookie_jar


def clean_text(text):
    return text.strip().replace('\\n', '')


def convert_date(text):
    date_text = clean_text(text).replace('.', '')
    return datetime.strptime(date_text, settings.EVAL_DATE_FORMAT)


def parse_evaluation(text, course, evaluation_type):
    soup = BeautifulSoup(text)
    headers = soup.find_all('header')

    data = None
    for header in headers:
        course_element = header.find('course')
        instr_element = header.find('instructor')
        if ((course_element.get('subj_code') == course.subject and
                course_element.get('crse_numb') == str(course.course_number))
                or (course_element.get('title') == course.title and
                    instr_element.get('name') == course.instructor)):
            data = header

    if not data:
        return None

    evaluation = Evaluation.objects.create(evaluation_type=evaluation_type,
                                           crn=course.crn)

    for question in data.find_all('question'):
        q = evaluation.question_set.create(
            text=clean_text(question.find('text').get_text()),
            class_mean=float(question.get('class_mean')),
            rice_mean=float(question.get('rice_mean'))
        )

        for choice in question.find_all('choice'):
            q.choice_set.create(
                value=int(choice.get('choice')),
                percent=int(choice.get('perc')),
                prompt=clean_text(choice.find('prompt').get_text())
            )

    for comment in data.find_all('student-comment'):
        evaluation.comment_set.create(
            text=clean_text(comment.find('response').get_text()),
            date=convert_date(comment.get('activity_date'))
        )

    return evaluation


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


def sub_element_text(elem, sub_elem_name, default=''):
    """ Get the text of a sub element if it exists

    """
    sub_elem = elem.find(sub_elem_name)
    if sub_elem is not None:
        return sub_elem.text
    return default


def crn_for_course_evaluation(course):
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
            subject = sub_element_text(course_element, 'subject')
            course_num = sub_element_text(course_element, 'course-number')
            title = sub_element_text(course_element, 'title')
            instructor = sub_element_text(course_element, 'instructor')
            if ((course.subject == subject and
                    course.course_number == int(course_num))
                    or (course.title == title and
                        course.instructor == instructor)):
                crn = course_element.find('crn').text
                break

        if crn is not None:
            return crn
    return None


def get_course_evaluation(course):
    crn = crn_for_course_evaluation(course)
    if crn is None:
        return crn

    response = session.post(
        url=EVALS_URL,
        data={
            'p_term': '201420',
            'p_type': 'Course',
            'p_crn': crn,
            'p_confirm': '1'
        }
    )

    return parse_evaluation(response.text.encode('utf-8'), course, 'c')


def webid_for_instructor_evaluation(course):
    for term in term_codes:
        instructor_response = session.post(
            url=DATA_URL,
            data={
                'p_term': term,
                'p_data': 'INSTRUCTORS'
            }
        )

        root = ElementTree.fromstring(instructor_response.text.encode('utf-8'))
        for instructor_element in root.findall('INSTRUCTOR'):
            if instructor_element.get('NAME') == course.instructor:
                return (term, instructor_element.get('WEBID'))
    return (None, None)


def get_instructor_evaluation(course):
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
