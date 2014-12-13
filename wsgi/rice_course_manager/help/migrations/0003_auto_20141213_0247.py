# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('help', '0002_auto_20141110_1606'),
    ]

    operations = [
        migrations.CreateModel(
            name='Annotation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('selector', models.CharField(max_length=255)),
                ('arrow', models.BooleanField(default=True)),
                ('text', models.TextField()),
                ('position', models.CharField(max_length=6, choices=[(b'top', b'top'), (b'bottom', b'bottom'), (b'left', b'left'), (b'right', b'right')])),
                ('padding', models.FloatField(default=10)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Panel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Tutorial',
            fields=[
                ('name', models.CharField(max_length=100, serialize=False, primary_key=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='panel',
            name='tutorial',
            field=models.ForeignKey(to='help.Tutorial'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='annotation',
            name='panel',
            field=models.ForeignKey(to='help.Panel'),
            preserve_default=True,
        ),
    ]
