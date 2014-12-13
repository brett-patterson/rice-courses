# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('help', '0004_panel_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='tutorial',
            name='annotation_padding',
            field=models.PositiveIntegerField(default=10),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='tutorial',
            name='arrow_color',
            field=models.CharField(default=b'white', max_length=100),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='tutorial',
            name='arrow_distance',
            field=models.PositiveIntegerField(default=80),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='tutorial',
            name='arrow_weight',
            field=models.PositiveIntegerField(default=1),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='tutorial',
            name='backdrop',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='tutorial',
            name='closable',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='tutorial',
            name='counter',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='tutorial',
            name='interactive',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
    ]
