from adminsortable.admin import SortableAdmin
from django.contrib import admin


from help.models import HelpArticle

admin.site.register(HelpArticle, SortableAdmin)
