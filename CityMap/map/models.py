from django.db import models
from django_base64field.fields import Base64Field


class CityMapData(models.Model):
    CityName = models.CharField(max_length=1000, default=True)
    Coordinates = models.CharField(max_length=1000, default=True)
    CountryName = models.CharField(max_length=1000, default=True)
    DesignLayout = models.IntegerField(max_length=1000, default=True)
    # MapImg = models.Base64(blank=True, null=True, editable=True)
    MapImg = Base64Field(max_length=900000, blank=True, null=True)

