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

# def convert_html_to_pdf(request):
#     if request.method == 'POST':
#         # entry_id = 10
#         # mapData = get_object_or_404(CityMapData, id=entry_id)
        
#         template = 'image.html'


#         options = {
#             'enable-local-file-access': '',
#             'javascript-delay' : '5000',
#             'margin-top': '0in',
#             'margin-right': '0in',
#             'margin-bottom': '0in',
#             'margin-left': '0in',
#             'copies' : 1,
#             'no-outline': True,
#             'dpi': 96,
#             'encoding': "UTF-8",
#         }

#         # context = {
#         #     'MapImg': mapData.MapImg,
#         #     'CityName':mapData.CityName,
#         # }

#         # rendered_content = mapData.content.decode('utf-8')

        
#         # temp_pdf = loader.get_template(template)
#         # html_data = temp_pdf.render(context=context)
#         pdf = pdfkit.from_string(template, None, options=options)

#         response = HttpResponse(content_type='application/pdf')
#         response['Content-Disposition'] = 'attachment; filename=output.pdf'
#         response.write(pdf)
#         return response

#     # return HttpResponse(status=200)
#     return render(request, "index1.html")


# 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



from django.shortcuts import render
from django.http import HttpResponse
from django.template.loader import render_to_string
import pdfkit
from django.conf import settings
import os

# config = pdfkit.configuration(wkhtmltopdf=settings.WKHTMLTOPDF_PATH)


def convert_html_to_pdf(request):
    if request.method == 'POST':
        # file_path = os.path.join(settings.BASE_DIR, 'planet/templates/new.html')
        rendered_template = render(request, 'image.html')



        options = {
            'enable-local-file-access': '',
        }
        
        # with open(file_path, 'r') as file:
        #     rendered_content = file.read()

        rendered_content = rendered_template.content.decode('utf-8')

        pdf = pdfkit.from_string(rendered_content, False, options=options)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename=output.pdf'
        response.write(pdf)
        return response

    return render(request, 'index1.html')