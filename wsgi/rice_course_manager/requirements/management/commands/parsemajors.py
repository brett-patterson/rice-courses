import json
import os

from django.core.management.base import BaseCommand

from courses.models import Course
from requirements.models import Major, MajorRequirement


class Command(BaseCommand):
    """ Parse a JSON file of major requirements into Requirement objects.

    """
    help = 'Parse a JSON file of major requirements'

    def add_arguments(self, parser):
        parser.add_argument('filename', type=str)

    def handle(self, *args, **options):
        for json_major in json.load(open(os.path.abspath(args[0]), 'r')):
            major = Major.objects.create(name=json_major['name'],
                                         degrees=json_major['degrees'])

            for json_req in json_major['requirements']:
                subject = json_req['subj']
                number = json_req['number']
                restrict = json_req.get('restrict', [])

                req = major.majorrequirement_set.create(
                    restrict=restrict
                )

                courses = Course.objects.filter(subject=subject,
                                                course_number=number)
                for course in courses:
                    req.courses.add(course)
