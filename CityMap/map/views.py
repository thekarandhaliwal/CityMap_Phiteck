from django.shortcuts import render
from .models import CityMapData


def Index(request):
    return render(request, 'index.html')

class CityMap():
    def get(request):
        pass

    def post(request):
        mapdata = request.data
        
        db = CityMapData.objects.create(
            CityName = mapdata['CityName'],
            Coordinates = mapdata['Coordinates'],
            CountryName = mapdata['CountryName'],
            DesignLayout = mapdata['DesignLayout'],
        )

        print(mapdata)
        print(db)


def convert_html_to_pdf(request):
    pass


def gelato_api
    pass

# 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
