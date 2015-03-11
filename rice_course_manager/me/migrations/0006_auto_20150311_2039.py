# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('me', '0005_scheduler_shown'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scheduler',
            name='name',
            field=models.CharField(max_length=255),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='scheduler',
            unique_together=set([('name', 'user_profile')]),
        ),
    ]
