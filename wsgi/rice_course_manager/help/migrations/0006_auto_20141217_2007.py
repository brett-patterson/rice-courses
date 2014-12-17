# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('help', '0005_auto_20141213_0352'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='helparticle',
            name='text',
        ),
        migrations.AddField(
            model_name='helparticle',
            name='filename',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
    ]
