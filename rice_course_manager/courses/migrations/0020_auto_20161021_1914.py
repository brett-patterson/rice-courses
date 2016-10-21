# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-10-21 19:14
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('me', '0014_auto_20161021_1914'),
        ('courses', '0019_auto_20161021_1730'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='term',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='terms.Term'),
        ),
        migrations.DeleteModel(
            name='Term',
        ),
    ]
