import os

import markdown

from adminsortable.models import Sortable
from django.conf import settings
from django.db import models


class HelpArticle(Sortable):
    class Meta(Sortable.Meta):
        pass

    title = models.CharField(max_length=100)
    filename = models.CharField(max_length=255)

    def __str__(self):
        return self.title

    def render_html(self):
        """ Render the markdown in `filename` to html.

        """
        with open(os.path.join(settings.HELP_DATA_DIR, self.filename)) as f:
            return markdown.markdown(f.read())


class Tutorial(models.Model):
    name = models.CharField(max_length=100, primary_key=True)

    interactive = models.BooleanField(default=True)

    arrow_weight = models.PositiveIntegerField(default=1)

    arrow_color = models.CharField(max_length=100, default='white')

    arrow_distance = models.PositiveIntegerField(default=80)

    backdrop = models.BooleanField(default=True)

    closable = models.BooleanField(default=True)

    annotation_padding = models.PositiveIntegerField(default=10)

    counter = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def json(self):
        """ Return a json representation of the tutorial.

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
        """ Create a Tutorial object from a JSON representation.

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
                )

        tutorial.save()
        return tutorial


class Panel(models.Model):
    name = models.CharField(max_length=100, default='')

    tutorial = models.ForeignKey(Tutorial)

    def json(self):
        """ Return a json representation of the panel.

        """
        return [a.json() for a in self.annotation_set.all()]


class Annotation(models.Model):
    selector = models.CharField(max_length=255)

    arrow = models.BooleanField(default=True)

    text = models.TextField()

    position = models.CharField(max_length=6, choices=(
        ('top', 'top'),
        ('bottom', 'bottom'),
        ('left', 'left'),
        ('right', 'right')
    ))

    padding = models.FloatField(default=10)

    panel = models.ForeignKey(Panel)

    def json(self):
        """ Return a json representation of the annotation.

        """
        return {
            'selector': self.selector,
            'arrow': self.arrow,
            'text': self.text,
            'position': self.position,
            'padding': self.padding
        }
