"""Casas para arrendar, con sus fotos y videos."""

from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from inmuebles.models import Imagen_casa_arrendar, Video_Casa, arrendar
from inmuebles.serializers import (
    CasaSerializer,
    ImagenCasaArrendarSerializer,
    InmuebleSerializer,
    VideoCasaSerializer,
)


class InmuebleViewSet(viewsets.ModelViewSet):
    queryset = arrendar.objects.all()
    serializer_class = InmuebleSerializer


@api_view(["GET"])
def listar_inmuebles(request):
    try:
        inmuebles = arrendar.objects.all()
        data = []
        
        for inmueble in inmuebles:
            data.append({
                "id": inmueble.id,
                "propietario_id": inmueble.propietario_id,  # Solo el ID del propietario
                "matriculaInmobiliaria": inmueble.matriculaInmobiliaria,
                "tipoInmueble": inmueble.tipoInmueble,
                "usoInmueble": inmueble.usoInmueble,
                "direccion": inmueble.direccion,
                "barrio": inmueble.barrio,
                "ciudad": inmueble.ciudad,
                "descripcion": inmueble.descripcion,
                "condiciones": inmueble.condiciones,
                "con_administracion": inmueble.con_administracion,
                "fotoPrincipal": inmueble.fotoPrincipal.url if inmueble.fotoPrincipal else None,
                "publicar": inmueble.publicar,
                "conCodeudor": inmueble.conCodeudor,
                "arrendada": inmueble.arrendada,
                "canonmensual": inmueble.canonmensual,
                "observacion_canonmensual": inmueble.observacion_canonmensual,
                "deposito": inmueble.deposito,
                "observacion_deposito": inmueble.observacion_deposito,
                "sala": inmueble.sala,
                "observacion_sala": inmueble.observacion_sala,
                "comedor": inmueble.comedor,
                "observacion_comedor": inmueble.observacion_comedor,
                "cocina": inmueble.cocina,
                "observacion_cocina": inmueble.observacion_cocina,
                "habitaciones": inmueble.habitaciones,
                "observacion_habitaciones": inmueble.observacion_habitaciones,
                "baños": inmueble.baños,
                "observacion_baños": inmueble.observacion_baños,
                "patio": inmueble.patio,
                "observacion_patio": inmueble.observacion_patio,
                "garage": inmueble.garage,
                "observacion_garage": inmueble.observacion_garage,
                "tanquesubterraneo": inmueble.tanquesubterraneo,
                "observacion_tanquesubterraneo": inmueble.observacion_tanquesubterraneo,
                "ser_agua": inmueble.ser_agua,
                "observacion_ser_agua": inmueble.observacion_ser_agua,
                "ser_energia": inmueble.ser_energia,
                "observacion_ser_energia": inmueble.observacion_ser_energia,
                "ser_gas_domiciliario": inmueble.ser_gas_domiciliario,
                "observacion_ser_gas_domiciliario": inmueble.observacion_ser_gas_domiciliario,
                "ser_bioagricola": inmueble.ser_bioagricola,
                "observacion_ser_bioagricola": inmueble.observacion_ser_bioagricola,
                "otros": inmueble.otros,
            })
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error en listar_inmuebles: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CasaCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)
        print("Archivos recibidos:", request.FILES)

        serializer = CasaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("Errores de validación:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CasaViewSet(viewsets.ModelViewSet):
    queryset = arrendar.objects.all()
    serializer_class = CasaSerializer

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError as e:
            print(e.detail)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ImagenCasaArrendarViewSet(viewsets.ModelViewSet):
    queryset = Imagen_casa_arrendar.objects.all()
    serializer_class = ImagenCasaArrendarSerializer

    def create(self, request, *args, **kwargs):
        print(
            "Datos recibidos:", request.data
        )  # Imprime los datos recibidos en la consola
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Verifica la validez del serializer
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        queryset = super().get_queryset()
        arrendar_id = self.request.query_params.get('arrendar')
        if arrendar_id:
            queryset = queryset.filter(arrendar_id=arrendar_id)
        return queryset


class VideoCasaViewSet(viewsets.ModelViewSet):
    queryset = Video_Casa.objects.all()
    serializer_class = VideoCasaSerializer

    def create(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)  # Imprime datos recibidos
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        queryset = super().get_queryset()
        arrendar_id = self.request.query_params.get('arrendar')
        if arrendar_id:
            queryset = queryset.filter(arrendar_id=arrendar_id)
        return queryset
