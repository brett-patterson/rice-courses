from datetime import datetime

from django.conf import settings


class Evaluation(object):
    def __init__(self, questions=[], comments=[]):
        self.questions = list(questions)
        self.comments = list(comments)

    def add_question(self, question):
        self.questions.append(question)

    def add_comment(self, comment):
        self.comments.append(comment)

    def json(self):
        return {
            'questions': [q.json() for q in self.questions],
            'comments': [c.json() for c in self.comments]
        }


class Question(object):
    def __init__(self, text='', class_mean=0.0, rice_mean=0.0, total_count=0,
                 choices=[]):
        self.text = text
        self.class_mean = class_mean
        self.rice_mean = rice_mean
        self.total_count = total_count
        self.choices = list(choices)

    def add_choice(self, choice):
        self.choices.append(choice)

    def json(self):
        return {
            'text': self.text,
            'class_mean': self.class_mean,
            'rice_mean': self.rice_mean,
            'total_count': self.total_count,
            'choices': [c.json() for c in self.choices]
        }


class Choice(object):
    def __init__(self, prompt='', value=0, percent=''):
        self.prompt = prompt
        self.value = value
        self.percent = percent

    def json(self):
        return {
            'prompt': self.prompt,
            'value': self.value,
            'percent': self.percent
        }


class Comment(object):
    def __init__(self, text='', date=datetime.now()):
        self.text = text
        self.date = date

    def json(self):
        return {
            'text': self.text,
            'date': self.date.strftime(settings.EVAL_DATE_FORMAT)
        }
