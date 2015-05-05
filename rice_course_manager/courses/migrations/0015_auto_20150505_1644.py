# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import courses.fields


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0014_course_cross_list_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='credits',
            field=courses.fields.FloatRangeField(default=(0, 0)),
            preserve_default=True,
        ),
    ]
