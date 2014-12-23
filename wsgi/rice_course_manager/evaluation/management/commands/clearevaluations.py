from django.core.management.base import BaseCommand

from evaluation.models import Evaluation, Question, Choice, Comment


class Command(BaseCommand):
    """ Clears all of the evaluations in the database.

    """
    help = 'Clear course and instructor evaluations in the database'

    def handle(self, *args, **options):
        Evaluation.objects.all().delete()
        Question.objects.all().delete()
        Choice.objects.all().delete()
        Comment.objects.all().delete()
