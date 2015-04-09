# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('evaluation', '0003_remove_question_total_count'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='question',
            name='class_mean',
        ),
        migrations.RemoveField(
            model_name='question',
            name='rice_mean',
        ),
    ]
