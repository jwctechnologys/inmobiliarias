"""API de gestion para el equipo y los propietarios: solicitudes de publicacion, consultas y estadisticas.

Requiere sesion iniciada. El administrador ve todo; el propietario solo lo de sus inmuebles.
"""
from django.db.models import Count, Q
from django.http import Http404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from inmuebles.models import ConsultaInmueble, SolicitudPublicacion, arrendar
from inmuebles.permisos import es_administrador, es_propietario

ESTADOS_PUBLICACION = {e for e, _ in SolicitudPublicacion.ESTADOS}
ESTADOS_CONSULTA = {e for e, _ in ConsultaInmueble.ESTADOS}


class EsAdminOPropietario(BasePermission):
    message = 'Esta sección es para administradores y propietarios.'

    def has_permission(self, request, view):
        return es_administrador(request.user) or es_propietario(request.user)


class EsAdmin(BasePermission):
    message = 'Esta sección es solo para administradores.'

    def has_permission(self, request, view):
        return es_administrador(request.user)


def _foto(request, casa):
    return request.build_absolute_uri(casa.fotoPrincipal.url) if casa.fotoPrincipal else None


def _publicacion(s, request):
    return {'id': s.id, 'creada': s.creada, 'estado': s.estado, 'nombre': s.nombre, 'telefono': s.telefono, 'correo': s.correo,
            'tipoInmueble': s.tipoInmueble, 'modalidad': s.modalidad, 'direccion': s.direccion, 'barrio': s.barrio,
            'ciudad': s.ciudad, 'precio': s.precio, 'descripcion': s.descripcion, 'notas': s.notas,
            'foto': request.build_absolute_uri(s.foto.url) if s.foto else None}


def _consulta(c):
    return {'id': c.id, 'creada': c.creada, 'estado': c.estado, 'tipo': c.tipo, 'nombre': c.nombre, 'telefono': c.telefono,
            'correo': c.correo, 'mensaje': c.mensaje, 'fecha_visita': c.fecha_visita, 'franja_visita': c.franja_visita,
            'notas': c.notas, 'casa_id': c.casa_id, 'casa': f"{c.casa.direccion}, {c.casa.barrio}".strip(', ')}


class PublicacionesView(APIView):
    """GET: solicitudes para publicar una propiedad (solo administradores)."""
    permission_classes = [IsAuthenticated, EsAdmin]

    def get(self, request):
        consulta = SolicitudPublicacion.objects.all()
        if request.query_params.get('estado') in ESTADOS_PUBLICACION:
            consulta = consulta.filter(estado=request.query_params['estado'])
        return Response([_publicacion(s, request) for s in consulta[:300]])


class PublicacionDetalleView(APIView):
    """PATCH: cambiar el estado o las notas de una solicitud (solo administradores)."""
    permission_classes = [IsAuthenticated, EsAdmin]

    def patch(self, request, pk):
        try:
            solicitud = SolicitudPublicacion.objects.get(pk=pk)
        except SolicitudPublicacion.DoesNotExist as error:
            raise Http404 from error
        if 'estado' in request.data:
            if request.data['estado'] not in ESTADOS_PUBLICACION:
                return Response({'estado': 'Estado no válido.'}, status=status.HTTP_400_BAD_REQUEST)
            solicitud.estado = request.data['estado']
        if 'notas' in request.data:
            solicitud.notas = str(request.data['notas'])[:2000]
        solicitud.save()
        return Response(_publicacion(solicitud, request))


def _consultas_visibles(usuario):
    consulta = ConsultaInmueble.objects.select_related('casa')
    return consulta if es_administrador(usuario) else consulta.filter(casa__propietario__user=usuario)


class ConsultasView(APIView):
    """GET: consultas y visitas pedidas. El administrador ve todas; el propietario, las de sus inmuebles."""
    permission_classes = [IsAuthenticated, EsAdminOPropietario]

    def get(self, request):
        consulta = _consultas_visibles(request.user)
        if request.query_params.get('estado') in ESTADOS_CONSULTA:
            consulta = consulta.filter(estado=request.query_params['estado'])
        if request.query_params.get('casa', '').isdigit():
            consulta = consulta.filter(casa_id=int(request.query_params['casa']))
        return Response([_consulta(c) for c in consulta[:300]])


class ConsultaDetalleView(APIView):
    permission_classes = [IsAuthenticated, EsAdminOPropietario]

    def patch(self, request, pk):
        try:
            consulta = _consultas_visibles(request.user).get(pk=pk)
        except ConsultaInmueble.DoesNotExist as error:
            raise Http404 from error
        if 'estado' in request.data:
            if request.data['estado'] not in ESTADOS_CONSULTA:
                return Response({'estado': 'Estado no válido.'}, status=status.HTTP_400_BAD_REQUEST)
            consulta.estado = request.data['estado']
        if 'notas' in request.data:
            consulta.notas = str(request.data['notas'])[:2000]
        consulta.save()
        return Response(_consulta(consulta))


class MisInmueblesView(APIView):
    """GET: los inmuebles del propietario (todos para el administrador) con sus numeros: visitas y consultas."""
    permission_classes = [IsAuthenticated, EsAdminOPropietario]

    def get(self, request):
        casas = arrendar.objects.all() if es_administrador(request.user) else arrendar.objects.filter(propietario__user=request.user)
        casas = casas.annotate(
            total_consultas=Count('consultas', distinct=True),
            consultas_nuevas=Count('consultas', filter=Q(consultas__estado='nueva'), distinct=True),
        ).order_by('-id')[:300]
        hoy = timezone.localdate()
        return Response([{
            'id': c.id, 'direccion': c.direccion, 'barrio': c.barrio, 'ciudad': c.ciudad, 'tipoInmueble': c.tipoInmueble,
            'modalidad': c.modalidad, 'precio': c.precioVenta if c.modalidad == 'venta' else c.canonmensual,
            'foto': _foto(request, c), 'publicada': c.publicar and not c.solicitudAceptada and not c.arrendada,
            'arrendada': c.arrendada, 'verificada': c.verificada,
            'destacada': bool(c.destacada and (c.destacada_hasta is None or c.destacada_hasta >= hoy)),
            'vistas': c.vistas, 'consultas': c.total_consultas, 'consultas_nuevas': c.consultas_nuevas,
        } for c in casas])
