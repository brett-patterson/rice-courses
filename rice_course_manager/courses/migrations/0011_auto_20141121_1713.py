# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0010_auto_20141120_2225'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='corequisites',
            field=models.TextField(default=b''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='prerequisites',
            field=models.TextField(default=b''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='restrictions',
            field=models.TextField(default=b''),
            preserve_default=True,
        ),
    ]
