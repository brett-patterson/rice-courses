from django.http import QueryDict

from courses.models import Course
from rice_courses.views import APIView
from .methods import overlap
from .models import Scheduler


class UserCoursesView(APIView):
    def get(self, request):
        """ Get all of the courses selected by the user.
        """
        course_list = request.user.userprofile.courses.all()
        return self.success([c.json() for c in course_list], safe=False)

    def put(self, request):
        """ Add a course for the user.
        """
        PUT = QueryDict(request.body)

        crn = PUT.get('crn')
        if crn is None:
            return self.failure('No CRN specified')

        flag = PUT.get('flag')
        if flag is None:
            return self.failure('User course flag must be specified')

        course = Course.objects.get(crn=crn)

        profile = request.user.userprofile

        if flag == 'true':
            profile.courses.add(course)

            for scheduler in Scheduler.objects.filter(user_profile=profile):
                scheduler.set_shown(course, True)

        else:
            profile.courses.remove(course)

        return self.success(
            [c.json() for c in profile.courses.all()], safe=False
        )


class AlternateCourseView(APIView):
    def get(self, request):
        """ Suggest alternate sections for a given course.
        """
        crn = request.GET.get('crn')

        if crn is not None:
            course = Course.objects.get(crn=crn)

            alternates = Course.objects.filter(
                subject=course.subject, course_number=course.course_number
            )
            alternates = alternates.exclude(section=course.section)

            scheduler = Scheduler.objects.get(shown=True)
            user_courses = [Course.objects.get(crn=c.crn)
                            for c in request.user.userprofile.courses.all()
                            if c.crn != crn and scheduler.show_map()[c.crn]]

            result = []
            for alternate in alternates:
                ok = True

                for user_course in user_courses:
                    if overlap(alternate, user_course):
                        ok = False
                        break

                if ok:
                    result.append(alternate.json())

            return self.success({
                'course': course.json(),
                'alternates': result
            })

        return self.failure('No CRN specified')


class SchedulerCollectionView(APIView):
    def get(self, request):
        """ Get all the schedulers for the user.
        """
        profile = request.user.userprofile
        schedulers = [s.json()
                      for s in Scheduler.objects.filter(user_profile=profile)]

        return self.success(schedulers, safe=False)

    def post(self, request):
        """ Add a scheduler for the user.
        """
        name = request.POST.get('name')

        if name is not None:
            request.user.userprofile.create_scheduler(name, active=True)
            return self.success(
                [s.json() for s in Scheduler.objects.all()],
                safe=False
            )

        return self.failure('No name specified')


class SchedulerView(APIView):
    def delete(self, request, scheduler_id):
        """ Remove a scheduler for the user.
        """
        Scheduler.objects.get(id=scheduler_id).delete()
        return self.success(
            [s.json() for s in Scheduler.objects.all()],
            safe=False
        )

    def put(self, request, scheduler_id):
        """ Rename a scheduler or set it shown or hidden.
        """
        PUT = QueryDict(request.body)
        name = PUT.get('name')
        shown = PUT.get('shown')

        scheduler = Scheduler.objects.get(id=scheduler_id)

        if name is not None:
            scheduler.name = name

        if shown is not None:
            scheduler.shown = shown == 'true'

        scheduler.save()
        return self.success(
            [s.json() for s in Scheduler.objects.all()],
            safe=False
        )


class SchedulerCourseView(APIView):
    def put(self, request, scheduler_id):
        """ Set a course to be shown or hidden.
        """
        PUT = QueryDict(request.body)
        crn = PUT.get('crn')
        shown = PUT.get('shown')

        if crn is None:
            return self.failure('No CRN specified')

        if shown is None:
            return self.failure('No shown flag specified')

        scheduler = Scheduler.objects.get(id=scheduler_id)
        scheduler.set_shown(Course.objects.get(crn=crn), shown == 'true')
        return self.success(
            [s.json() for s in Scheduler.objects.all()],
            safe=False
        )

    def delete(self, request, scheduler_id):
        """ Remove a course from a scheduler's show map.
        """
        crn = QueryDict(request.body).get('crn')

        if crn is None:
            return self.failure('No CRN specified')

        scheduler = Scheduler.objects.get(id=scheduler_id)
        scheduler.remove_course(Course.objects.get(crn=crn))
        return self.success(
            [s.json() for s in Scheduler.objects.all()],
            safe=False
        )


class SchedulerExportView(APIView):
    def get(self, request, scheduler_id):
        """ Export a scheduler's CRNs for all shown courses.
        """
        scheduler = Scheduler.objects.get(id=scheduler_id)
        show_map = scheduler.show_map()
        courses = [course.json() for course in
                   request.user.userprofile.courses.all()
                   if show_map[course.crn]]

        return self.success(courses, safe=False)
