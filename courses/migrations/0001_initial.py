# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('crn', models.CharField(max_length=5)),
                ('course_id', models.CharField(max_length=12)),
                ('title', models.CharField(max_length=50)),
                ('instructor', models.CharField(max_length=50)),
                ('meeting', models.CharField(max_length=50)),
                ('credits', models.IntegerField(default=0)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
