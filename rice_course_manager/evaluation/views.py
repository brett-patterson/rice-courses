from courses.models import Course
from rice_courses.views import APIView
from .scraper import get_course_evaluation, get_instructor_evaluation
from .models import Evaluation


def evaluation_to_json(evaluation_type, crn):
    """ Fetch an evaluation from the database if it exists, otherwise fetch
    it from the Rice servers.

    Parameters:
    -----------
    evaluation_type : str
        The type of the evaluation (either 'c' or 'i').
i
    crn : str
        The CRN of the course to look for.

    Returns:
    --------
    A JSON-serializable dictionary representing the evaluation.

    """
    try:
        evaluation = Evaluation.objects.get(evaluation_type=evaluation_type,
                                            crn=crn)
        return evaluation.json()

    except Evaluation.DoesNotExist:
        return {
            'questions': [],
            'comments': []
        }

        # course = Course.objects.get(crn=crn)
        # if evaluation_type == 'c':
        #     evaluation = get_course_evaluation(course)
        # elif evaluation_type == 'i':
        #     evaluation = get_instructor_evaluation(course)

        # if evaluation is None:
        #     return {
        #         'questions': [],
        #         'comments': []
        #     }

        # return evaluation.json()


class CourseEvaluationView(APIView):
    def get(self, request):
        """ Get the evaluation for a course.
        """
        crn = request.GET.get('crn')

        if crn is not None:
            return self.success(evaluation_to_json('c', crn))

        return self.failure('No CRN specified')


class InstructorEvaluationView(APIView):
    def get(self, request):
        """ Get the evaluation for an instructor.
        """
        crn = request.GET.get('crn')

        if crn is not None:
            return self.success(evaluation_to_json('i', crn))

        return self.failure('No CRN specified')
