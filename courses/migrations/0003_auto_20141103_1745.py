# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_auto_20141103_1614'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='credits',
            field=models.CharField(default=b'', max_length=10),
            preserve_default=True,
        ),
    ]
