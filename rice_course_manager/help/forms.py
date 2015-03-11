from django import forms


class ImportForm(forms.Form):
    """ A form used to select a tutorial file to import.

    """
    import_file = forms.FileField(label='File to import')
