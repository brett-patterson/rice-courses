from django.contrib.auth.models import User
from django.db import models

from courses.models import Course


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    courses = models.ManyToManyField(Course)

    def create_scheduler(self, name):
        scheduler = self.scheduler_set.create(name=name)

        for course in self.courses.all():
            scheduler.set_shown(course, True)

        return scheduler


class Scheduler(models.Model):
    name = models.CharField(max_length=300, unique=True)
    user_profile = models.ForeignKey(UserProfile)

    def show_map(self):
        result = {}
        for course_shown in self.courseshown_set.all():
            result[course_shown.course.crn] = course_shown.show

        return result

    def set_shown(self, course, show):
        course_shown, new = self.courseshown_set.get_or_create(course=course)
        course_shown.show = show
        course_shown.save()


class CourseShown(models.Model):
    scheduler = models.ForeignKey(Scheduler)
    course = models.ForeignKey(Course)
    show = models.BooleanField(default=False)


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile, created = UserProfile.objects.get_or_create(user=instance)
        profile.create_scheduler('Schedule 1')


models.signals.post_save.connect(create_user_profile, sender=User)
