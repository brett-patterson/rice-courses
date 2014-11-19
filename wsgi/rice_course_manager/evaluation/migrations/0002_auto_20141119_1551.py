# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('evaluation', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='evaluation',
            name='comments',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='questions',
        ),
        migrations.RemoveField(
            model_name='question',
            name='choices',
        ),
        migrations.AddField(
            model_name='choice',
            name='question',
            field=models.ForeignKey(to='evaluation.Question', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='comment',
            name='evaluation',
            field=models.ForeignKey(to='evaluation.Evaluation', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='evaluation',
            name='crn',
            field=models.CharField(default='', max_length=6),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='evaluation',
            name='evaluation_type',
            field=models.CharField(default='c', max_length=1, choices=[(b'i', b'Instructor'), (b'c', b'Course')]),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='question',
            name='evaluation',
            field=models.ForeignKey(to='evaluation.Evaluation', null=True),
            preserve_default=True,
        ),
    ]
