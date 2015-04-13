import os

import markdown

from adminsortable.models import Sortable
from django.conf import settings
from django.db import models


class HelpArticle(Sortable):
    """ A model to represent a help article.

    """
    class Meta(Sortable.Meta):
        pass

    # The title of the article.
    title = models.CharField(max_length=100)

    # The filename of the markdown file containing the article content.
    # Filenames should be relative to the setting `HELP_DATA_DIR`.
    filename = models.CharField(max_length=255)

    def __str__(self):
        """ Represent the article as its title.

        """
        return self.title

    def render_html(self):
        """ Render the markdown in `filename` to html.

        """
        with open(os.path.join(settings.HELP_DATA_DIR, self.filename)) as f:
            return markdown.markdown(f.read())


class Tutorial(models.Model):
    """ A model to represent a tutorial. A tutorial is a collection of
    panels used to walk the user through the usage of a certain page.

    """
    # The name of the tutorial. This should correspond to the URL that the
    # tutorial will be shown on.
    name = models.CharField(max_length=100, primary_key=True)

    # Whether or not the tutorial should be interactive.
    interactive = models.BooleanField(default=True)

    # The thickness of the arrows.
    arrow_weight = models.PositiveIntegerField(default=1)

    # The color of the arrows.
    arrow_color = models.CharField(max_length=100, default='white')

    # The distance of the arrows.
    arrow_distance = models.PositiveIntegerField(default=80)

    # Whether or not the tutorial should have a dark backdrop behind it.
    backdrop = models.BooleanField(default=True)

    # Whether or not the tutorial is closable.
    closable = models.BooleanField(default=True)

    # The amount padding surrounding each annotation.
    annotation_padding = models.PositiveIntegerField(default=10)

    # Whether or not to show a panel counter.
    counter = models.BooleanField(default=True)

    def __str__(self):
        """ Represent a tutorial as its name.

        """
        return self.name

    def json(self):
        """ Convert the tutorial to a JSON-serializable dictionary.

        """
        return {
            'tutorial': [p.json() for p in self.panel_set.all()],
            'interactive': self.interactive,
            'arrows': {
                'weight': self.arrow_weight,
                'color': self.arrow_color,
                'distance': self.arrow_distance
            },
            'backdrop': self.backdrop,
            'closable': self.closable,
            'annotationPadding': self.annotation_padding,
            'counter': self.counter
        }

    @classmethod
    def from_json(cls, json_obj):
        """ Create a Tutorial object from a JSON dictionary.

        """
        tutorial = cls()
        tutorial.name = json_obj['name']
        tutorial.interactive = json_obj['interactive']
        tutorial.backdrop = json_obj['backdrop']
        tutorial.closable = json_obj['closable']
        tutorial.annotation_padding = json_obj['annotationPadding']
        tutorial.counter = json_obj['counter']
        tutorial.arrow_weight = json_obj['arrows']['weight']
        tutorial.arrow_color = json_obj['arrows']['color']
        tutorial.arrow_distance = json_obj['arrows']['distance']
        tutorial.save()

        for index, panel in enumerate(json_obj['tutorial']):
            name = 'Panel ' + str(index + 1)
            p = tutorial.panel_set.create(name=name)

            for annotation in panel:
                p.annotation_set.create(
                    selector=annotation['selector'],
                    arrow=annotation['arrow'],
                    text=annotation['text'],
                    position=annotation['position'],
                    padding=annotation['padding'],
                    no_background=annotation['noBackground']
                )

        return tutorial


class Panel(models.Model):
    """ A model to represent a panel within a tutorial. Panels are collections
    of annotations.

    """
    # The name of the panel.
    name = models.CharField(max_length=100, default='')

    # The tutorial this panel corresponds to.
    tutorial = models.ForeignKey(Tutorial)

    class Meta:
        ordering = ['id']

    def json(self):
        """ Convert the panel to a JSON-serializable dictionary.

        """
        return [a.json() for a in self.annotation_set.all()]


class Annotation(models.Model):
    """ A model to represent an annotation within a panel. Annotations
    are used to highlight and describe and element within the HTML DOM.

    """
    # The HTML selector for the annotation.
    selector = models.CharField(max_length=255)

    # Whether or not to show an arrow for the annotation.
    arrow = models.BooleanField(default=True)

    # The text for the annotation.
    text = models.TextField()

    # The position for the annotation relative to the element.
    position = models.CharField(max_length=6, choices=(
        ('top', 'top'),
        ('bottom', 'bottom'),
        ('left', 'left'),
        ('right', 'right')
    ))

    # The padding between the element and the annotation.
    padding = models.FloatField(default=10)

    # Whether or not to hide the annotation's background.
    no_background = models.BooleanField(default=False)

    # The panel this annotation corresponds to.
    panel = models.ForeignKey(Panel)

    class Meta:
        ordering = ['id']

    def json(self):
        """ Convert the annotation to a JSON-serializable dictionary.

        """
        return {
            'selector': self.selector,
            'arrow': self.arrow,
            'text': self.text,
            'position': self.position,
            'padding': self.padding,
            'noBackground': self.no_background
        }
