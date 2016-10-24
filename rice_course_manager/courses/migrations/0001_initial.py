# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-10-24 16:42
from __future__ import unicode_literals

import courses.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('terms', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('crn', models.CharField(max_length=5)),
                ('subject', models.CharField(default=b'', max_length=4)),
                ('course_number', models.PositiveIntegerField(default=0)),
                ('title', models.CharField(default=b'', max_length=50)),
                ('section', models.CharField(default=b'', max_length=3)),
                ('location', models.CharField(default=b'', max_length=50)),
                ('distribution', models.PositiveIntegerField(default=0)),
                ('credits', courses.fields.FloatRangeField(default=(0, 0))),
                ('meetings', courses.fields.DateTimeListField(default=[], objects=[])),
                ('description', models.TextField(default=b'')),
                ('enrollment', models.PositiveIntegerField(default=0)),
                ('max_enrollment', models.PositiveIntegerField(default=0)),
                ('waitlist', models.PositiveIntegerField(default=0)),
                ('max_waitlist', models.PositiveIntegerField(default=0)),
                ('restrictions', models.TextField(default=b'')),
                ('prerequisites', models.TextField(default=b'')),
                ('corequisites', models.TextField(default=b'')),
                ('cross_list_group', models.CharField(default=b'', max_length=2)),
                ('instructor', models.TextField(default=b'')),
                ('term', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='terms.Term')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='course',
            unique_together=set([('term', 'crn')]),
        ),
    ]
