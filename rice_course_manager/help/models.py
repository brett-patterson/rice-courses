import os

import markdown
from django.conf import settings
from django.db import models


class HelpArticle(models.Model):
    """ A model to represent a help article.

    """
    # The index of the article
    index = models.IntegerField()

    # The title of the article.
    title = models.CharField(max_length=100)

    # The filename of the markdown file containing the article content.
    # Filenames should be relative to the setting `HELP_DATA_DIR`.
    filename = models.CharField(max_length=255)

    def __str__(self):
        """ Represent the article as its title.

        """
        return self.title

    def render_html(self):
        """ Render the markdown in `filename` to html.

        """
        with open(os.path.join(settings.HELP_DATA_DIR, self.filename)) as f:
            return markdown.markdown(f.read())

    def json(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.render_html()
        }
