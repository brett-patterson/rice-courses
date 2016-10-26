from rice_courses.views import APIView
from .models import Term


SEMESTER_ORDER = {
    Term.FALL: 0,
    Term.SUMMER: 1,
    Term.SPRING: 2
}


class TermsView(APIView):
    def get(self, request):
        """ Get all terms.
        """
        # We sort at the python level rather than the database level
        # for convenience. The number of terms should be small enough
        # for the performance impact to be negligible.
        terms = sorted(
            Term.objects.all(),
            key=lambda t: (-t.year, SEMESTER_ORDER[t.semester])
        )

        return self.success(
            [t.json() for t in terms], safe=False
        )
