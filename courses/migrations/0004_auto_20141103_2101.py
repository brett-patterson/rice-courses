# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import courses.fields


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_auto_20141103_1745'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='id',
        ),
        migrations.AlterField(
            model_name='course',
            name='credits',
            field=courses.fields.RangeField(default=b'0', minimum=0, maximum=0),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='course',
            name='crn',
            field=models.CharField(max_length=5, serialize=False, primary_key=True),
            preserve_default=True,
        ),
    ]
