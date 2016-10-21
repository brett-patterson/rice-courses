from xml.etree import ElementTree

from django.core.management.base import BaseCommand
from requests import Session

from terms.models import Term

TERMS_URL = 'https://courses.rice.edu/admweb/!SWKSCAT.info?action=TERMS'


def fetch_terms(verbose=False):
    """ Get all terms.

    Parameters:
    -----------
    verbose : bool [default False]
        Whether or not to show messages throughout the process of fetching
        terms.
    """
    session = Session()
    response = session.get(url=TERMS_URL)

    root = ElementTree.fromstring(response.text.encode('utf-8'))
    current_term_code = root.attrib['currentTerm']

    for term_el in root:
        code = term_el.attrib['code']
        term = Term.from_code(code)
        query = Term.objects.filter(semester=term.semester, year=term.year)
        if query.exists():
            term = query.first()

        term.current = code == current_term_code
        term.save()

        if verbose:
            print 'Fetched term %s' % term


class Command(BaseCommand):
    """ A command to fetch terms and import them into the database.

    """
    help = 'Update terms in the database'

    def handle(self, *args, **options):
        verbose = int(options['verbosity']) > 1
        fetch_terms(verbose=verbose)
