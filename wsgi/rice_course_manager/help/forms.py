from django import forms


class ImportForm(forms.Form):
    import_file = forms.FileField(label='File to import')
