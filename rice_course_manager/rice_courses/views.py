import json

from django.shortcuts import render

from django_cas.decorators import login_required
from help.models import HelpArticle


@login_required
def home(request):
    return render(request, 'index.html', {
        'help_articles': json.dumps(
            [a.json() for a in HelpArticle.objects.all()]
        )
    })
