from django.core.management.base import BaseCommand

from courses.models import Course


class Command(BaseCommand):
    help = 'Clear all courses from the database'

    def handle(self, *args, **options):
        Course.objects.all().delete()
