from django.shortcuts import render, get_object_or_404
from .models import CityMapData
from .serializers import CityMapDataSerializer
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
import pdfkit
from django.http import HttpResponse
from django.template import loader


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
            MapImg = mapdata['MapImg']
        )

        print(mapdata)
        print(db)

        data_return = CityMapDataSerializer(db, many=False, context={"request": request} )
        return Response(data_return.data)

def convert_html_to_pdf(request):
    if request.method == 'POST':

        entry_id = 1

        mapData = get_object_or_404(CityMapData, id=entry_id)

        template = ''
        
        if mapData.DesignLayout == '1':
            template = 'polar.html'
        elif mapData.DesignLayout == '2':
            template = 'classic.html'
        elif mapData.DesignLayout == '3':
            template = 'halo.html'
        elif mapData.DesignLayout =='4':
            template = 'square.html'
        elif mapData.DesignLayout == '5':
            template = 'card.html'
        elif mapData.DesignLayout == '6':
            template = 'architect.html'


        options = {
            'enable-local-file-access': '',
            'javascript-delay':5000,
            'page-size': 'A2',
            'margin-top': '15',
            'margin-right': '15',
            'margin-bottom': '15',
            'margin-left': '15',
            'copies' : 1,
            'no-outline': True,
            'dpi': 300,
            'encoding': "UTF-8",
            # 'zoom': 4,    
        }

        context = {
            'CityName':mapData.CityName,
            'CountryName' : mapData.CountryName,
            'Coordinates' : mapData.Coordinates,
            'MapImg': mapData.MapImg,
        }

        # rendered_content = mapData.content.decode('utf-8')

        
        temp_pdf = loader.get_template(template)
        html_data = temp_pdf.render(context=context)
        pdf_path = 'output.pdf'
        pdf = pdfkit.from_string(html_data, pdf_path, options=options)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename=output.pdf'
        response.write(pdf)
        return response

    # return HttpResponse(status=200)
    return render(request, "index1.html")


# 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