from rice_courses.views import APIView
from .models import HelpArticle


class ArticlesView(APIView):
    def get(self, request):
        """ Fetch the list of help articles.
        """
        articles = HelpArticle.objects.order_by('index')

        return self.success([a.json() for a in articles])
