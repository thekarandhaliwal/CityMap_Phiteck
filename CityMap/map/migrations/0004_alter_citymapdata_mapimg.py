# Generated by Django 4.2.4 on 2023-08-11 05:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0003_alter_citymapdata_mapimg'),
    ]

    operations = [
        migrations.AlterField(
            model_name='citymapdata',
            name='MapImg',
            field=models.TextField(blank=True, null=True),
        ),
    ]