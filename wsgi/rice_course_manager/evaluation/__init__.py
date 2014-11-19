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
        if (course_element.get('subj_code') == course.subject and
                course_element.get('crse_numb') == str(course.course_number)):
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

course_response = session.post(
    url=DATA_URL,
    data={
        'p_term': '201420',
        'p_data': 'COURSES',
    }
)

course_root = ElementTree.fromstring(course_response.text.encode('utf-8'))


def get_course_evaluation(course):
    crn = None
    for course_element in course_root.findall('COURSE'):
        if (course_element.get('SUBJ') == course.subject and
                course_element.get('NUMB') == str(course.course_number)):
            crn = course_element.get('CRN')

    if not crn:
        return None

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


instructor_response = session.post(
    url=DATA_URL,
    data={
        'p_term': '201420',
        'p_data': 'INSTRUCTORS'
    }
)

root = ElementTree.fromstring(instructor_response.text.encode('utf-8'))
instructor_map = {}
for instructor_element in root.findall('INSTRUCTOR'):
    name = instructor_element.get('NAME')
    web_id = instructor_element.get('WEBID')
    instructor_map[name] = web_id


def get_instructor_evaluation(course):
    if course.instructor not in instructor_map:
        return None

    response = session.post(
        url=EVALS_URL,
        data={
            'p_term': '201420',
            'p_type': 'Instructor',
            'p_instr': instructor_map[course.instructor],
            'p_confirm': '1'
        }
    )

    return parse_evaluation(response.text.encode('utf-8'), course, 'i')
