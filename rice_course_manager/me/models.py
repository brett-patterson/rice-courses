from django.contrib.auth.models import User
from django.db import models

from courses.models import Course


class Schedule(models.Model):
    """ A model to represent a schedule for a user.

    """
    # The name of the schedule.
    name = models.CharField(max_length=255)

    # The user profile this schedule corresponds to.
    user = models.ForeignKey(User)

    class Meta:
        ordering = ['id']

    def show_map(self):
        """ Return a mapping of course CRN's to the whether or not they are
        shown in the schedule.
        """
        result = {}
        for cs in self.courseshown_set.all():
            result[cs.course] = cs.shown

        return result

    def remove_course(self, course):
        """ Remove a course from the schedule.

        Parameters:
        -----------
        course : Course
            The course to remove.

        """
        self.courseshown_set.get(course=course).delete()

    def set_shown(self, course, shown):
        """ Set whether a course should be shown in the schedule.

        Parameters:
        -----------
        course : Course
            The course to be shown/hidden.

        shown : bool
            Whether the course should be shown (True) or hidden (False).
        """
        course_shown, new = self.courseshown_set.get_or_create(course=course)
        course_shown.shown = shown
        course_shown.save()

    def json(self):
        """ Convert a Schedule object to a JSON-serializable format.
        """
        return {
            'id': self.id,
            'name': self.name,
            'map': [(c.json(), s) for c, s in self.show_map().items()]
        }


class CourseShown(models.Model):
    """ A model to represent whether or not a course is shown in a specific
    schedule.
    """
    # The schedule that this model corresponds to.
    schedule = models.ForeignKey(Schedule)

    # The course that this model corresponds to.
    course = models.ForeignKey(Course)

    # Whether or not the course should be shown in the schedule.
    shown = models.BooleanField(default=False)


def create_initial_schedule(sender, instance, created, **kwargs):
    """ A method called when a new user is created to ensure that there is
    an initial schedule on their account.
    """
    if created:
        Schedule.objects.create(user=instance, name='Schedule 1')


models.signals.post_save.connect(create_initial_schedule, sender=User)
