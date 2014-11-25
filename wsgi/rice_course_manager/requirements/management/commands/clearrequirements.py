from django.core.management.base import BaseCommand

from requirements.models import Major, MajorRequirement, Requirement


class Command(BaseCommand):
    help = 'Clear all requirements from the database'

    def handle(self, *args, **options):
        Major.objects.all().delete()
        MajorRequirement.objects.all().delete()
        Requirement.objects.all().delete()
