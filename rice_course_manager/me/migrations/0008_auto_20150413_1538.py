# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('me', '0007_auto_20150405_2200'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='courseshown',
            name='course',
        ),
        migrations.AddField(
            model_name='courseshown',
            name='crn',
            field=models.CharField(default='', max_length=5),
            preserve_default=False,
        ),
    ]
