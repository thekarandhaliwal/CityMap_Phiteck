# Generated by Django 4.2.4 on 2023-08-24 06:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0004_alter_citymapdata_mapimg'),
    ]

    operations = [
        migrations.AlterField(
            model_name='citymapdata',
            name='DesignLayout',
            field=models.CharField(default=True, max_length=1000),
        ),
    ]