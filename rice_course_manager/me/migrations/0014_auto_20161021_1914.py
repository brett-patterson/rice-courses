# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-10-21 19:14
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('me', '0013_schedule_term'),
    ]

    operations = [
        migrations.AlterField(
            model_name='schedule',
            name='term',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='terms.Term'),
        ),
    ]
