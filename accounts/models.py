from django.contrib.auth.models import User
from django.db import models

from courses.models import Course


class UserCourses(models.Model):
    user = models.OneToOneField(User)
    courses = models.ManyToManyField(Course)
