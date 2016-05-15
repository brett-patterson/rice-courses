# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-05-15 18:19
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('courses', '0018_auto_20151102_1531'),
        ('me', '0010_auto_20160201_0611'),
    ]

    operations = [
        migrations.CreateModel(
            name='Schedule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['id'],
            },
        ),
        migrations.RemoveField(
            model_name='scheduler',
            name='user_profile',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='courses',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='user',
        ),
        migrations.RenameField(
            model_name='courseshown',
            old_name='show',
            new_name='shown',
        ),
        migrations.RemoveField(
            model_name='courseshown',
            name='crn',
        ),
        migrations.RemoveField(
            model_name='courseshown',
            name='scheduler',
        ),
        migrations.AddField(
            model_name='courseshown',
            name='course',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='courses.Course'),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='Scheduler',
        ),
        migrations.DeleteModel(
            name='UserProfile',
        ),
        migrations.AddField(
            model_name='courseshown',
            name='schedule',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='me.Schedule'),
            preserve_default=False,
        ),
    ]
