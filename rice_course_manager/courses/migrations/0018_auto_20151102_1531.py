# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0017_auto_20150824_1250'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='end_time',
            field=models.CharField(default=b'', max_length=30),
        ),
        migrations.AlterField(
            model_name='course',
            name='start_time',
            field=models.CharField(default=b'', max_length=30),
        ),
    ]
