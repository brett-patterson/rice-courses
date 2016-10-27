import json
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from help.models import HelpArticle


class Command(BaseCommand):
    """ A command to load the help articles into the database.

    """
    help = 'Update help articles in the database'

    def handle(self, *args, **options):
        verbose = int(options['verbosity']) > 1
        self.load_articles(verbose=verbose)

    def load_articles(self, verbose=False):
        """ Load all help articles.

        Parameters:
        -----------
        verbose : bool [default False]
            Whether or not to show messages throughout the process of fetching
            terms.
        """
        index_path = os.path.join(settings.HELP_DATA_DIR, 'index.json')
        with open(index_path, 'r') as f:
            index = json.load(f)

        HelpArticle.objects.all().delete()

        for i, article in enumerate(index['articles']):
            HelpArticle.objects.create(index=i, **article)
