from xml.etree import ElementTree

import requests
from django.core.management.base import BaseCommand

from terms.models import Term

TERMS_URL = 'https://courses.rice.edu/admweb/!SWKSCAT.info?action=TERMS'


class Command(BaseCommand):
    """ A command to fetch terms and import them into the database.

    """
    help = 'Update terms in the database'

    def handle(self, *args, **options):
        verbose = int(options['verbosity']) > 1
        self.fetch_terms(verbose=verbose)

    def fetch_terms(self, verbose=False):
        """ Get all terms.

        Parameters:
        -----------
        verbose : bool [default False]
            Whether or not to show messages throughout the process of fetching
            terms.
        """
        response = requests.get(url=TERMS_URL)

        root = ElementTree.fromstring(response.text.encode('utf-8'))
        current_term_code = root.attrib['currentTerm']

        terms = set([(t.semester, t.year) for t in Term.objects.all()])
        for term_el in root[-3:]:
            code = term_el.attrib['code']
            term = Term.from_code(code)
            query = Term.objects.filter(semester=term.semester, year=term.year)
            if query.exists():
                term = query.first()

            term.current = code == current_term_code
            term.save()

            key = (term.semester, term.year)
            if key in terms:
                terms.remove(key)

            if verbose:
                self.stdout.write('Fetched term %s' % term)

        # Remove stale terms
        for semester, year in terms:
            Term.objects.get(semester=semester, year=year).delete()
