from django.contrib.auth.models import User
from django.db import models

from courses.models import Course


class UserProfile(models.Model):
    """ A custom user profile model used to store the user's schedulers
    and courses.

    """
    user = models.OneToOneField(User)
    courses = models.ManyToManyField(Course)

    def create_scheduler(self, name, active=False):
        """ Create a new scheduler with a given name. The scheduler initially
        shows all courses.

        Parameters:
        -----------
        name : str
            The name for the scheduler.

        Returns:
        --------
        The new scheduler object.

        """
        scheduler = self.scheduler_set.create(name=name, active=active)

        for course in self.courses.all():
            scheduler.set_shown(course, True)

        return scheduler


class Scheduler(models.Model):
    """ A model to represent a scheduler. A scheduler shows the user's courses
    graphically on a calendar widget.

    """
    # The name of the scheduler.
    name = models.CharField(max_length=255)

    # Whether or not this scheduler is currently active.
    active = models.BooleanField(default=False)

    # The user profile this scheduler corresponds to.
    user_profile = models.ForeignKey(UserProfile)

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        """ On save, ensure that only one Scheduler object is shown.

        """
        if self.active:
            Scheduler.objects.filter(user_profile=self.user_profile,
                                     active=True).update(active=False)
        super(Scheduler, self).save(*args, **kwargs)

    def show_map(self):
        """ Return a mapping of course CRN's to the whether or not they are
        shown in the scheduler.

        """
        result = {}
        for course_shown in self.courseshown_set.all():
            result[course_shown.crn] = course_shown.show

        return result

    def remove_course(self, course):
        """ Remove a course from the show map.

        Parameters:
        -----------
        course : Course
            The course to remove.

        """
        self.courseshown_set.get(crn=course.crn).delete()

    def set_shown(self, course, show):
        """ Set whether a course should be shown in the scheduler.

        Parameters:
        -----------
        course : Course
            The course to be shown/hidden.

        show : bool
            Whether the course should be shown (True) or hidden (False).

        """
        course_shown, new = self.courseshown_set.get_or_create(crn=course.crn)
        course_shown.show = show
        course_shown.save()

    def json(self):
        """ Convert a Scheduler object to a JSON-serializable format.

        """
        return {
            'id': self.id,
            'name': self.name,
            'map': self.show_map()
        }


class CourseShown(models.Model):
    """ A model to represent whether or not a course is shown in a specific
    scheduler.

    """
    # The scheduler that this model corresponds to.
    scheduler = models.ForeignKey(Scheduler)

    # The course that this model corresponds to.
    crn = models.CharField(max_length=5)

    # Whether or not the course should be shown in the scheduler.
    show = models.BooleanField(default=False)


def create_user_profile(sender, instance, created, **kwargs):
    """ A method called when a new user is created to ensure that they
    have the correct UserProfile and create an initial scheduler on their
    account.

    """
    if created:
        profile, created = UserProfile.objects.get_or_create(user=instance)
        scheduler = profile.create_scheduler('Schedule 1', active=True)
        scheduler.save()


models.signals.post_save.connect(create_user_profile, sender=User)
