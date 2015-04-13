# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('help', '0007_annotation_no_background'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='annotation',
            options={'ordering': ['id']},
        ),
        migrations.AlterModelOptions(
            name='panel',
            options={'ordering': ['id']},
        ),
    ]
