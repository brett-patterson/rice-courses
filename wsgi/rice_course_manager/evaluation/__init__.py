import cookielib
from datetime import datetime
from xml.etree import ElementTree

import mechanize
from bs4 import BeautifulSoup
from requests import Session
from django.conf import settings

from models import Evaluation, Question, Choice, Comment


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


def parse_evaluation(text, crn):
    soup = BeautifulSoup(text)
    data = soup.find('header', {'survey_crn': crn})
    evaluation = Evaluation()

    for question in data.find_all('question'):
        q = Question()

        q.text = clean_text(question.find('text').get_text())
        q.class_mean = float(question.get('class_mean'))
        q.rice_mean = float(question.get('rice_mean'))
        q.total_count = int(question.get('total_count'))

        for choice in question.find_all('choice'):
            c = Choice()
            c.value = int(choice.get('choice'))
            c.percent = int(choice.get('perc'))
            c.prompt = clean_text(choice.find('prompt').get_text())
            q.add_choice(c)

        evaluation.add_question(q)

    for comment in soup.find_all('student-comment'):
        c = Comment()
        c.text = clean_text(comment.find('response').get_text())
        date_text = clean_text(comment.get('activity_date').replace('.', ''))
        c.date = datetime.strptime(date_text, settings.EVAL_DATE_FORMAT)
        evaluation.add_comment(c)

    return evaluation


def get_course_evaluation(crn):
    response = session.post(
        url=EVALS_URL,
        data={
            'p_term': '201420',
            'p_type': 'Course',
            'p_crn': crn,
            'p_confirm': '1'
        }
    )

    return parse_evaluation(response.text.encode('utf-8'), crn)


def get_instructor_evaluation(instructor, crn):
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

    response = session.post(
        url=EVALS_URL,
        data={
            'p_term': '201420',
            'p_type': 'Instructor',
            'p_instr': instructor_map[instructor],
            'p_confirm': '1'
        }
    )

    return parse_evaluation(response.text.encode('utf-8'), crn)
