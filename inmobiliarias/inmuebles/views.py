"""Casas para arrendar, con sus fotos y videos."""

from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from rest_framework.views import APIView

from inmuebles.models import Imagen_casa_arrendar, Video_Casa, arrendar
from inmuebles.notificaciones import avisar_al_equipo
from inmuebles.permisos import (
    LecturaPublicaEscrituraGestor,
    SoloAdministrador,
    es_administrador,
    es_gestor,
    puede_gestionar,
)
from inmuebles.serializers import (
    CasaSerializer,
    ImagenCasaArrendarSerializer,
    InmuebleSerializer,
    SolicitudPublicacionSerializer,
    VideoCasaSerializer,
)


class EsGestor(BasePermission):
    message = 'Inicia sesión como administrador o propietario para registrar inmuebles.'

    def has_permission(self, request, view):
        return es_gestor(request.user)


class InmuebleViewSet(viewsets.ModelViewSet):
    """Vista completa (con los datos personales del propietario): solo para administradores."""
    queryset = arrendar.objects.all()
    serializer_class = InmuebleSerializer
    permission_classes = [SoloAdministrador]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_inmuebles(request):
    """Lista interna con el propietario y la matricula (la usan las pantallas de contratos): administradores y propietarios."""
    if not es_gestor(request.user):
        return Response({"error": "No tienes permiso para ver esta lista."}, status=status.HTTP_403_FORBIDDEN)
    try:
        inmuebles = arrendar.objects.all()
        if not es_administrador(request.user):
            inmuebles = inmuebles.filter(propietario__user=request.user)
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
                "modalidad": inmueble.modalidad,
                "precioVenta": inmueble.precioVenta,
                "coordenadas": inmueble.coordenadas,
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
    """Registro de un inmueble. Un propietario solo puede registrar a su nombre; el administrador, a cualquiera."""
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated, EsGestor]

    def post(self, request, *args, **kwargs):
        datos = request.data.copy()
        if not es_administrador(request.user):
            datos['propietario'] = request.user.propietario.id
        serializer = CasaSerializer(data=datos)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DuenoAlCrearMixin:
    """Fotos y videos solo se pueden agregar a un inmueble propio (o a cualquiera si eres administrador)."""

    def perform_create(self, serializer):
        if not puede_gestionar(self.request.user, serializer.validated_data['arrendar']):
            raise PermissionDenied('Solo puedes agregar archivos a tus propios inmuebles.')
        serializer.save()


class CasaViewSet(viewsets.ModelViewSet):
    queryset = arrendar.objects.all()
    serializer_class = CasaSerializer
    permission_classes = [LecturaPublicaEscrituraGestor]

    def perform_create(self, serializer):
        if es_administrador(self.request.user):
            serializer.save()
        else:
            serializer.save(propietario=self.request.user.propietario)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ImagenCasaArrendarViewSet(DuenoAlCrearMixin, viewsets.ModelViewSet):
    queryset = Imagen_casa_arrendar.objects.all()
    serializer_class = ImagenCasaArrendarSerializer
    permission_classes = [LecturaPublicaEscrituraGestor]

    def get_queryset(self):
        queryset = super().get_queryset()
        arrendar_id = self.request.query_params.get('arrendar')
        if arrendar_id:
            queryset = queryset.filter(arrendar_id=arrendar_id)
        return queryset


class VideoCasaViewSet(DuenoAlCrearMixin, viewsets.ModelViewSet):
    queryset = Video_Casa.objects.all()
    serializer_class = VideoCasaSerializer
    permission_classes = [LecturaPublicaEscrituraGestor]

    def get_queryset(self):
        queryset = super().get_queryset()
        arrendar_id = self.request.query_params.get('arrendar')
        if arrendar_id:
            queryset = queryset.filter(arrendar_id=arrendar_id)
        return queryset


class PublicarPropiedadThrottle(AnonRateThrottle):
    """Frena el abuso del formulario publico: pocas solicitudes por hora desde la misma direccion."""
    rate = '8/hour'


class SolicitudPublicacionCreateView(APIView):
    """Recibe, sin necesidad de cuenta, una propiedad que alguien quiere publicar. Queda pendiente para el equipo."""
    authentication_classes = []  # sin sesion no aplica CSRF: es un formulario publico
    permission_classes = [AllowAny]
    throttle_classes = [PublicarPropiedadThrottle]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request, *args, **kwargs):
        # Campo trampa: las personas no lo ven; si viene lleno es un robot. Se responde "ok" sin guardar nada.
        if request.data.get('sitio_web'):
            return Response({'ok': True}, status=status.HTTP_201_CREATED)
        serializer = SolicitudPublicacionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        solicitud = serializer.save()
        avisar_al_equipo(
            "Nueva propiedad para publicar",
            f"{solicitud.nombre} ({solicitud.telefono} {solicitud.correo}) quiere publicar un inmueble "
            f"{'en venta' if solicitud.modalidad == 'venta' else 'en arriendo'}:\n{solicitud.tipoInmueble} - {solicitud.direccion}, "
            f"{solicitud.barrio}, {solicitud.ciudad}\nPrecio: {solicitud.precio or 'sin definir'}\n\n{solicitud.descripcion}\n\n"
            "Gestiónala en el administrador: Solicitudes para publicar una propiedad."
        )
        return Response({'ok': True}, status=status.HTTP_201_CREATED)
