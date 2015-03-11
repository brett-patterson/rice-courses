from django.shortcuts import render


def index(request):
    """ The main index page.

    """
    return render(request, 'index.html')
