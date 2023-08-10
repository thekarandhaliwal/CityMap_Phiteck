from rest_framework import serializers

from map.models import CityMapData


class CityMapDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CityMapData
        fields = '__all__'