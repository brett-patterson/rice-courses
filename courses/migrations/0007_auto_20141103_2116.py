# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import courses.fields


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_auto_20141103_2109'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='credits',
            field=courses.fields.RangeField(default=courses.fields.Range(0, 0), minimum=0, maximum=0),
            preserve_default=True,
        ),
    ]
