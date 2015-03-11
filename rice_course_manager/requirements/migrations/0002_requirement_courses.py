# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0011_auto_20141121_1713'),
        ('requirements', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='requirement',
            name='courses',
            field=models.ManyToManyField(to='courses.Course'),
            preserve_default=True,
        ),
    ]
