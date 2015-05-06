# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import courses.fields


alter_credits_sql = "ALTER TABLE courses_course ALTER COLUMN credits TYPE numrange USING CASE WHEN strpos(credits, 'to')=0 THEN ('['||credits||','||credits||']')::numrange ELSE ('['||substr(credits, 1, strpos(credits, 'to')-1)||','||substr(credits, strpos(credits, 'to')+2)||']')::numrange END"


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0014_course_cross_list_group'),
    ]

    operations = [
        migrations.RunSQL(alter_credits_sql),
        migrations.AlterField(
            model_name='course',
            name='credits',
            field=courses.fields.FloatRangeField(default=(0, 0)),
            preserve_default=True,
        ),
    ]
