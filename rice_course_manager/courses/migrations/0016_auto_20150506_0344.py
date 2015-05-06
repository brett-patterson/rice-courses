# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0015_auto_20150505_1644'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='end_time',
            field=models.CharField(default=b'', max_length=15),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='meeting_days',
            field=models.CharField(default=b'', max_length=7),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='start_time',
            field=models.CharField(default=b'', max_length=15),
            preserve_default=True,
        ),
    ]
