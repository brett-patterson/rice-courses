import json

from adminsortable.admin import SortableAdmin
from django.conf.urls import url
from django.contrib import admin
from django.http import HttpResponse
from django.shortcuts import render, redirect
from nested_inline.admin import NestedStackedInline, NestedModelAdmin

from forms import ImportForm
from models import HelpArticle, Tutorial, Panel, Annotation


class AnnotationInline(NestedStackedInline):
    """ An inline admin object to show annotations.

    """
    model = Annotation
    extra = 0


class PanelInline(NestedStackedInline):
    """ An inline admin object to show panels.

    """
    model = Panel
    inlines = (AnnotationInline,)
    extra = 0


class TutorialAdmin(NestedModelAdmin):
    """ A custom admin object to support the editing, export, and import
    of tutorials.

    """
    model = Tutorial
    inlines = (PanelInline,)
    actions = ['export']

    def export(self, request, queryset):
        """ Export the tutorial as a JSON file.

        """
        result = {}
        for tutorial in queryset:
            result[tutorial.name] = tutorial.json()

        response = HttpResponse(content_type='text/json')
        response['Content-Disposition'] = ('attachment; ' +
                                           'filename="tutorials.json"')
        response.write(json.dumps(result))

        return response

    export.short_description = 'Export selected tutorials'

    def get_urls(self):
        """ Override the 'get_urls' method to add custom url paths.

        """
        urls = super(TutorialAdmin, self).get_urls()
        my_urls = [url(r'^import/$', self.import_action)]

        return my_urls + urls

    def import_action(self, request):
        """ Import a tutorial from a JSON file.

        """
        if request.method == 'POST':
            form = ImportForm(request.POST, request.FILES)
            admin_url = '/admin/help/tutorial/'

            if form.is_valid():
                import_file = form.cleaned_data['import_file']

                import_json = json.loads(import_file.read())
                for name, tutorial in import_json.items():
                    tutorial['name'] = name
                    Tutorial.from_json(tutorial)

                return redirect(admin_url)

            else:
                return redirect(admin_url)

        return render(request, 'admin/import.html', {'form': ImportForm()})


admin.site.register(HelpArticle, SortableAdmin)
admin.site.register(Tutorial, TutorialAdmin)
