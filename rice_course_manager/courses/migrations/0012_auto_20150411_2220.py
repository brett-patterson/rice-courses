# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import courses.fields


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0011_auto_20141121_1713'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='end_time',
        ),
        migrations.RemoveField(
            model_name='course',
            name='meeting_days',
        ),
        migrations.RemoveField(
            model_name='course',
            name='start_time',
        ),
        migrations.AddField(
            model_name='course',
            name='meetings',
            field=courses.fields.DateTimeListField(default=[], objects=b'["[", "\\"", "[", "\\"", ",", " ", "\\"", "]", "\\"", "]"]'),
            preserve_default=True,
        ),
    ]
