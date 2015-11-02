# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('help', '0008_auto_20150413_1756'),
    ]

    operations = [
        migrations.AlterField(
            model_name='helparticle',
            name='order',
            field=models.PositiveIntegerField(default=0, editable=False, db_index=True),
            preserve_default=True,
        ),
    ]
