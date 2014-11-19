# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('evaluation', '0002_auto_20141119_1551'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='question',
            name='total_count',
        ),
    ]
