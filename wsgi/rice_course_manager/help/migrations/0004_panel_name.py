# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('help', '0003_auto_20141213_0247'),
    ]

    operations = [
        migrations.AddField(
            model_name='panel',
            name='name',
            field=models.CharField(default=b'', max_length=100),
            preserve_default=True,
        ),
    ]
