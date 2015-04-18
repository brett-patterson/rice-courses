from django.http import JsonResponse
from django.shortcuts import render

from django_cas.decorators import login_required

from courses.models import Course


@login_required(login_url='/login/')
def index(request):
    """ The index page for the 'Courses' tab.

    """
    context = {
        'nav_active': 'courses'
    }

    return render(request, 'courses/index.jade', context)


@login_required(login_url='/login/')
def all(request):
    """ Returns a list of all courses as JSON objects.

    """
    return JsonResponse([c.json() for c in Course.objects.all()], safe=False)


@login_required(login_url='/login/')
def get_sections(request):
    """ Get all sections of a course.

    """
    subj = request.POST.get('subject')
    num = request.POST.get('number')

    if subj is None:
        return JsonResponse({'error': 'No subject specified'}, status=400)

    if num is None:
        return JsonResponse({'error': 'No course number specified'},
                            status=400)

    filtered = Course.objects.filter(subject=subj, course_number=num)
    return JsonResponse([c.json() for c in filtered], safe=False)


@login_required(login_url='/login/')
def get_subjects(request):
    """ Get all unique course subjects.

    """
    subjects = sorted(map(lambda x: x['subject'],
                          Course.objects.values('subject').distinct()))
    return JsonResponse(subjects, safe=False)
