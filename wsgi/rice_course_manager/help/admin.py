from adminsortable.admin import SortableAdmin
from django.contrib import admin
from nested_inline.admin import NestedStackedInline, NestedModelAdmin

from help.models import HelpArticle, Tutorial, Panel, Annotation


class AnnotationInline(NestedStackedInline):
    model = Annotation
    extra = 1


class PanelInline(NestedStackedInline):
    model = Panel
    inlines = (AnnotationInline,)
    extra = 1


class TutorialAdmin(NestedModelAdmin):
    model = Tutorial
    inlines = (PanelInline,)


admin.site.register(HelpArticle, SortableAdmin)
admin.site.register(Tutorial, TutorialAdmin)
