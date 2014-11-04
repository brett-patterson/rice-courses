from django.shortcuts import render

from django_cas.decorators import login_required


@login_required(login_url='/login/')
def index(request):
    context = {
        'nav_active': 'planner'
    }
    return render(request, 'planner/index.html', context)
