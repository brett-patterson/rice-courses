from django.shortcuts import render

from help.models import HelpArticle


def index(request):
    context = {
        'nav_active': 'help',
        'articles': HelpArticle.objects.all()
    }

    return render(request, 'help/index.html', context)
