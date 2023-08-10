from django.shortcuts import render
from .models import CityMapData
from .serializers import CityMapDataSerializer
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from rest_framework.views import APIView


def Index(request):
    return render(request, 'index.html')

class CityMap(APIView):
    @csrf_exempt
    def get(self, request):
        pass

    @csrf_exempt
    def post(self, request):

        mapdata = request.data
        
        db = CityMapData.objects.create(
            CityName = mapdata['CityName'],
            Coordinates = mapdata['Coordinates'],
            CountryName = mapdata['CountryName'],
            DesignLayout = mapdata['DesignLayout'],
        )

        print(mapdata)
        print(db)

        data_return = CityMapDataSerializer(db, many=False, context={"request": request} )
        return Response(data_return.data)

def convert_html_to_pdf(request):
    pass


def gelato_api(request):
    pass


# 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