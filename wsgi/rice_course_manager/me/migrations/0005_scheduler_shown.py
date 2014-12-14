# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('me', '0004_auto_20141203_1737'),
    ]

    operations = [
        migrations.AddField(
            model_name='scheduler',
            name='shown',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
