from django.conf import settings
from django.db import models


class Evaluation(models.Model):
    evaluation_type = models.CharField(max_length=1,
                                       choices=(('i', 'Instructor'),
                                                ('c', 'Course')))
    crn = models.CharField(max_length=6)


class Question(models.Model):
    text = models.TextField()
    class_mean = models.FloatField()
    rice_mean = models.FloatField()
    evaluation = models.ForeignKey(Evaluation, null=True)

    def json(self):
        return {
            'text': self.text,
            'class_mean': self.class_mean,
            'rice_mean': self.rice_mean,
        }


class Choice(models.Model):
    prompt = models.TextField()
    value = models.IntegerField()
    percent = models.IntegerField()
    question = models.ForeignKey(Question, null=True)

    def json(self):
        return {
            'prompt': self.prompt,
            'value': self.value,
            'percent': self.percent
        }


class Comment(models.Model):
    text = models.TextField()
    date = models.DateTimeField()
    evaluation = models.ForeignKey(Evaluation, null=True)

    def json(self):
        return {
            'text': self.text,
            'date': self.date.strftime(settings.EVAL_DATE_FORMAT)
        }
