from django.conf import settings
from django.db import models


class Evaluation(models.Model):
    """ A model to represent a course or instructor evaluation.

    """
    # The evaluation type, either instructor ('i') or course ('c').
    evaluation_type = models.CharField(max_length=1,
                                       choices=(('i', 'Instructor'),
                                                ('c', 'Course')))

    # The CRN for the course being evaluated.
    crn = models.CharField(max_length=6)

    def json(self):
        """ Convert the Evaluation object to a JSON-serializable dictionary.

        """
        return {
            'questions': [q.json() for q in self.question_set.all()],
            'comments': [c.json() for c in self.comment_set.all()]
        }


class Question(models.Model):
    """ A model to represent a question within an evaluation.

    """
    # The text of the question.
    text = models.TextField()

    # The evaluation this question corresponds to.
    evaluation = models.ForeignKey(Evaluation, null=True)

    def json(self):
        """ Convert the Question object to a JSON-serializable dictionary.

        """
        return {
            'text': self.text,
            'choices': [c.json() for c in self.choice_set.all()]
        }


class Choice(models.Model):
    """ A model to represent a choice within a question.

    """
    # The text prompt for the choice.
    prompt = models.TextField()

    # The numerical value for the choice.
    value = models.IntegerField()

    # The percentage of students selecting this choice.
    percent = models.IntegerField()

    # The question this choice corresponds to.
    question = models.ForeignKey(Question, null=True)

    def json(self):
        """ Convert the Choice object to a JSON-serializable dictionary.

        """
        return {
            'prompt': self.prompt,
            'value': self.value,
            'percent': self.percent
        }


class Comment(models.Model):
    """ A model to represent a student comment in an evaluation.

    """
    # The text of the comment.
    text = models.TextField()

    # The date the comment was made.
    date = models.DateTimeField()

    # The evaluation this comment corresponds to.
    evaluation = models.ForeignKey(Evaluation, null=True)

    def json(self):
        """ Convert the Comment object to a JSON-serializable dictionary.

        """
        return {
            'text': self.text,
            'date': self.date.strftime(settings.EVAL_DATE_FORMAT)
        }
