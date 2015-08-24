# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0016_auto_20150506_0344'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='location',
            field=models.CharField(default=b'', max_length=30),
            preserve_default=True,
        ),
    ]
