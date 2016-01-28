from rice_courses.views import APIView
from .models import Tutorial


class TutorialView(APIView):
    def get(self, request):
        """ Fetch a tutorial from the database.
        """
        tutorial_name = request.POST.get('tutorial')

        if tutorial_name is not None:
            try:
                tutorial = Tutorial.objects.get(name=tutorial_name)
                return self.success(tutorial.json())
            except Tutorial.DoesNotExist:
                return self.failure('No such tutorial')

        return self.failure('Must specify a tutorial name')
