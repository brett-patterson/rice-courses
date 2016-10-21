from rice_courses.views import APIView
from .models import Term


class TermsView(APIView):
    def get(self, request):
        """ Get all terms.
        """
        return self.success(
            [t.json() for t in Term.objects.order_by('-id')], safe=False
        )
