from django.contrib.auth.models import User
from django.db import models

from courses.models import Course


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    courses = models.ManyToManyField(Course)


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile, created = UserProfile.objects.get_or_create(user=instance)


models.signals.post_save.connect(create_user_profile, sender=User)
