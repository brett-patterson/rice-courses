# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import requirements.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Major',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.TextField(default=b'')),
                ('degrees', requirements.fields.ListField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Requirement',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='MajorRequirement',
            fields=[
                ('requirement_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='requirements.Requirement')),
                ('restrict', requirements.fields.ListField()),
                ('major', models.ForeignKey(to='requirements.Major')),
            ],
            options={
            },
            bases=('requirements.requirement',),
        ),
    ]
