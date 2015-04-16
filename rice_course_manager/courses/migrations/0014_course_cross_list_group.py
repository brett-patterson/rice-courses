# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0013_auto_20150411_2334'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='cross_list_group',
            field=models.CharField(default=b'', max_length=2),
            preserve_default=True,
        ),
    ]
