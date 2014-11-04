# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='course_id',
        ),
        migrations.RemoveField(
            model_name='course',
            name='meeting',
        ),
        migrations.AddField(
            model_name='course',
            name='course_number',
            field=models.PositiveIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='description',
            field=models.TextField(default=b''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='distribution',
            field=models.PositiveIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='end_time',
            field=models.TimeField(default=datetime.time(0, 0)),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='enrollment',
            field=models.PositiveIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='location',
            field=models.CharField(default=b'', max_length=10),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='max_enrollment',
            field=models.PositiveIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='meeting_days',
            field=models.CharField(default=b'', max_length=5),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='section',
            field=models.CharField(default=b'', max_length=3),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='start_time',
            field=models.TimeField(default=datetime.time(0, 0)),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='course',
            name='subject',
            field=models.CharField(default=b'', max_length=4),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='course',
            name='credits',
            field=models.PositiveIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='course',
            name='crn',
            field=models.CharField(default=b'', max_length=5),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='course',
            name='instructor',
            field=models.CharField(default=b'', max_length=50),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='course',
            name='title',
            field=models.CharField(default=b'', max_length=50),
            preserve_default=True,
        ),
    ]
