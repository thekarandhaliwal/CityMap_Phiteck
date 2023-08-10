from django.db import models

class CityMapData(models.Model):
    CityName = models.CharField(max_length=1000, default=True)
    Coordinates = models.CharField(max_length=1000, default=True)
    CountryName = models.CharField(max_length=1000, default=True)
    DesignLayout = models.IntegerField(max_length=1000, default=True)
    MapImg = models.CharField(max_length=5000, default=True)