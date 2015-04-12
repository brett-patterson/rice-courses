# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import courses.fields


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0012_auto_20150411_2220'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='meetings',
            field=courses.fields.DateTimeListField(default=[], objects=[]),
            preserve_default=True,
        ),
    ]
