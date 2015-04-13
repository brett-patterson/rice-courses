# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('me', '0008_auto_20150413_1538'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='scheduler',
            options={'ordering': ['id']},
        ),
    ]
