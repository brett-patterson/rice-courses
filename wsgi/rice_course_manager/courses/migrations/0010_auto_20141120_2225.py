# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0009_auto_20141106_2240'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='max_waitlist',
            field=models.PositiveIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='waitlist',
            field=models.PositiveIntegerField(default=0),
            preserve_default=True,
        ),
    ]
