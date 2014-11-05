import markdown

from django.db import models


class HelpArticle(models.Model):
    title = models.CharField(max_length=100)
    text = models.TextField()

    def __str__(self):
        return self.title

    def render_html(self):
        """ Render the markdown in `text` to html.

        """
        return markdown.markdown(self.text)
