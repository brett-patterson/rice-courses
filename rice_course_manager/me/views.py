from django.http import QueryDict

from courses.models import Course
from rice_courses.views import APIView
from .models import Schedule, Term


class AlternateCourseView(APIView):
    def get(self, request):
        """ Suggest alternate sections for a given course.
        """
        # crn = request.GET.get('crn')
        #
        # if crn is not None:
        #     course = Course.objects.get(crn=crn)
        #
        #     alternates = Course.objects.filter(
        #         subject=course.subject, course_number=course.course_number
        #     )
        #     alternates = alternates.exclude(section=course.section)
        #
        #     user = request.user
        #     schedule = (Schedule.objects.filter(user=user).get(shown=True))
        #
        #     user_courses = [c for c in request.user.userprofile.courses.all()
        #                     if c.crn != crn and scheduler.show_map()[c.crn]]
        #
        #     result = []
        #     for alternate in alternates:
        #         ok = True
        #
        #         for user_course in user_courses:
        #             if overlap(alternate, user_course):
        #                 ok = False
        #                 break
        #
        #         if ok:
        #             result.append(alternate.json())
        #
        #     return self.success({
        #         'course': course.json(),
        #         'alternates': result
        #     })
        return self.failure('Not implemented')
        # return self.failure('No CRN specified')


class ScheduleCollectionView(APIView):
    def get(self, request):
        """ Get all the schedules for the user.
        """
        user = request.user
        term = request.GET.get('term') or Term.current_term()
        schedules = Schedule.objects.filter(user=user, term=term)

        return self.success([s.json() for s in schedules], safe=False)

    def post(self, request):
        """ Add a schedule for the user.
        """
        name = request.POST.get('name')
        term = request.POST.get('term')

        try:
            term = Term.objects.get(id=term)
        except Term.DoesNotExist:
            return self.failure('Invalid term ID')

        if name is not None:
            s = Schedule.objects.create(name=name, term=term,
                                        user=request.user)
            return self.success(s.json())

        return self.failure('No name specified')


class ScheduleView(APIView):
    def delete(self, request, schedule_id):
        """ Remove a schedule for the user.
        """
        Schedule.objects.get(id=schedule_id, user=request.user).delete()
        return self.success()

    def put(self, request, schedule_id):
        """ Rename a schedule.
        """
        PUT = QueryDict(request.body)
        name = PUT.get('name')

        schedule = Schedule.objects.get(id=schedule_id, user=request.user)

        if name is None:
            return self.failure('No name specified')

        schedule.name = name
        schedule.save()

        return self.success(schedule.json())


class ScheduleCourseView(APIView):
    def post(self, request, schedule_id):
        """ Add a course to the schedule.
        """
        crn = request.POST.get('crn')
        if crn is None:
            return self.failure('No CRN specified')

        schedule = Schedule.objects.get(id=schedule_id, user=request.user)
        schedule.set_shown(
            Course.objects.get(crn=crn, term=schedule.term), True
        )
        return self.success(schedule.json())

    def put(self, request, schedule_id):
        """ Set a course to be shown or hidden.
        """
        PUT = QueryDict(request.body)
        crn = PUT.get('crn')
        shown = PUT.get('shown')

        if crn is None:
            return self.failure('No CRN specified')

        if shown is None:
            return self.failure('No shown flag specified')

        schedule = Schedule.objects.get(id=schedule_id, user=request.user)
        schedule.set_shown(
            Course.objects.get(crn=crn, term=schedule.term),
            shown == 'true'
        )

        return self.success(schedule.json())

    def delete(self, request, schedule_id):
        """ Remove a course from a schedule's show map.
        """
        crn = QueryDict(request.body).get('crn')

        if crn is None:
            return self.failure('No CRN specified')

        schedule = Schedule.objects.get(id=schedule_id, user=request.user)
        schedule.remove_course(Course.objects.get(crn=crn, term=schedule.term))
        return self.success(schedule.json())
