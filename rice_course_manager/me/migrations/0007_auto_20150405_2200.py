# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('me', '0006_auto_20150311_2039'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='scheduler',
            unique_together=set([]),
        ),
    ]
