# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('requirements', '0002_requirement_courses'),
    ]

    operations = [
        migrations.AlterField(
            model_name='requirement',
            name='courses',
            field=models.ManyToManyField(to='courses.Course', null=True),
            preserve_default=True,
        ),
    ]
