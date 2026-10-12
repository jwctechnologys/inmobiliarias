"""API publica del portal: buscar inmuebles, ver una ficha, dejar una consulta y compartir un enlace.

Todo es de solo lectura (salvo la consulta) y nunca expone datos del propietario. Solo se listan los inmuebles
publicados (`publicar`), que no estén arrendados ni con solicitud aceptada.
"""
import html

from django.conf import settings
from django.db.models import Case, F, IntegerField, Q, When
from django.http import Http404, HttpResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from inmuebles.models import ConsultaInmueble, arrendar
from inmuebles.notificaciones import avisar_al_equipo
from inmuebles.serializers import (
    ConsultaInmuebleSerializer,
    InmueblePublicoDetalleSerializer,
    InmueblePublicoSerializer,
)

POR_PAGINA_MAXIMO = 48
POR_PAGINA_PREDETERMINADO = 12


def publicados():
    """Inmuebles visibles en el portal, con el precio unico y la marca de destacado ya calculados."""
    hoy = timezone.localdate()
    return arrendar.objects.filter(publicar=True, solicitudAceptada=False, arrendada=False).annotate(
        precio_total=Case(When(modalidad='venta', then=F('precioVenta')), default=F('canonmensual'), output_field=IntegerField()),
        destacada_activa=Case(
            When(Q(destacada=True) & (Q(destacada_hasta__isnull=True) | Q(destacada_hasta__gte=hoy)), then=1),
            default=0, output_field=IntegerField()),
    )


def _entero(valor):
    try:
        return int(valor)
    except (TypeError, ValueError):
        return None


ORDENES = {
    'recientes': ('-id',),
    'precio_asc': ('precio_total', '-id'),
    'precio_desc': ('-precio_total', '-id'),
    'destacadas': ('-destacada_activa', '-verificada', '-id'),
}


def filtrar(consulta, params):
    """Aplica los filtros de la busqueda (todos opcionales) a un queryset de `publicados()`."""
    if params.get('modalidad') in ('arriendo', 'venta'):
        consulta = consulta.filter(modalidad=params['modalidad'])
    for parametro, campo in (('tipo', 'tipoInmueble'), ('uso', 'usoInmueble'), ('ciudad', 'ciudad'), ('barrio', 'barrio'), ('estado', 'estado_inmueble')):
        if params.get(parametro):
            consulta = consulta.filter(**{f'{campo}__iexact': params[parametro]})
    if params.get('q'):
        for palabra in params['q'].split()[:6]:
            consulta = consulta.filter(Q(direccion__icontains=palabra) | Q(barrio__icontains=palabra) | Q(ciudad__icontains=palabra)
                                       | Q(tipoInmueble__icontains=palabra) | Q(descripcion__icontains=palabra))
    if _entero(params.get('precio_min')) is not None:
        consulta = consulta.filter(precio_total__gte=_entero(params['precio_min']))
    if _entero(params.get('precio_max')) is not None:
        consulta = consulta.filter(precio_total__lte=_entero(params['precio_max']))
    for parametro, campo in (('habitaciones', 'num_habitaciones'), ('banos', 'num_banos'), ('parqueaderos', 'num_parqueaderos')):
        minimo = _entero(params.get(parametro))
        if minimo:
            consulta = consulta.filter(**{f'{campo}__gte': minimo})
    if _entero(params.get('area_min')):
        consulta = consulta.filter(area__gte=_entero(params['area_min']))
    if _entero(params.get('estrato')):
        consulta = consulta.filter(estrato=_entero(params['estrato']))
    if params.get('verificada') in ('1', 'true'):
        consulta = consulta.filter(verificada=True)
    return consulta.order_by(*ORDENES.get(params.get('orden'), ORDENES['destacadas']))


@method_decorator(cache_page(60), name='dispatch')  # una busqueda repetida no vuelve a la base de datos durante un minuto
class InmueblesPublicosView(APIView):
    """GET /api/publico/inmuebles/ : busqueda con filtros, orden y paginacion."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        consulta = filtrar(publicados(), request.query_params)
        por_pagina = min(_entero(request.query_params.get('por_pagina')) or POR_PAGINA_PREDETERMINADO, POR_PAGINA_MAXIMO)
        total = consulta.count()
        paginas = max(1, -(-total // por_pagina))
        pagina = min(max(_entero(request.query_params.get('pagina')) or 1, 1), paginas)
        elementos = consulta[(pagina - 1) * por_pagina: pagina * por_pagina]
        datos = InmueblePublicoSerializer(elementos, many=True, context={'request': request}).data
        return Response({'total': total, 'pagina': pagina, 'paginas': paginas, 'por_pagina': por_pagina, 'resultados': datos})


@method_decorator(cache_page(60), name='dispatch')
class MapaPublicoView(APIView):
    """GET /api/publico/mapa/ : todos los puntos de la busqueda (con coordenadas) para dibujar el mapa."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        consulta = filtrar(publicados(), request.query_params).filter(latitud__isnull=False, longitud__isnull=False)[:300]
        datos = InmueblePublicoSerializer(consulta, many=True, context={'request': request}).data
        return Response({'resultados': datos})


@method_decorator(cache_page(300), name='dispatch')
class FiltrosPublicosView(APIView):
    """GET /api/publico/filtros/ : lo que existe hoy (ciudades, tipos...), para llenar los filtros sin ofrecer opciones vacias."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        base = publicados()

        def distintos(campo):
            return sorted({v for v in base.values_list(campo, flat=True) if v}, key=str.lower)

        conteo = {m: base.filter(modalidad=m).count() for m in ('arriendo', 'venta')}
        return Response({'ciudades': distintos('ciudad'), 'barrios': distintos('barrio'), 'tipos': distintos('tipoInmueble'),
                         'usos': distintos('usoInmueble'), 'conteo': {**conteo, 'todas': sum(conteo.values())}})


class InmueblePublicoDetalleView(APIView):
    """GET /api/publico/inmuebles/<id>/ : la ficha completa, con fotos, videos e inmuebles parecidos. Cuenta la visita."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            casa = publicados().prefetch_related('imagen_casa_arrendar_set', 'video_casa_set').get(pk=pk)
        except arrendar.DoesNotExist as error:
            raise Http404 from error
        arrendar.objects.filter(pk=pk).update(vistas=F('vistas') + 1)  # sin save(): no vuelve a comprimir ni tocar nada mas
        contexto = {'request': request}
        datos = InmueblePublicoDetalleSerializer(casa, context=contexto).data
        parecidos = (publicados().filter(modalidad=casa.modalidad).exclude(pk=pk)
                     .filter(Q(ciudad__iexact=casa.ciudad) | Q(tipoInmueble__iexact=casa.tipoInmueble))
                     .order_by('-destacada_activa', '-id')[:4])
        datos['parecidos'] = InmueblePublicoSerializer(parecidos, many=True, context=contexto).data
        return Response(datos)


class ConsultaThrottle(AnonRateThrottle):
    rate = '10/hour'


class ConsultaInmuebleView(APIView):
    """POST /api/publico/inmuebles/<id>/consulta/ : mensaje o solicitud de visita, sin necesidad de cuenta."""
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ConsultaThrottle]

    def post(self, request, pk):
        try:
            casa = publicados().get(pk=pk)
        except arrendar.DoesNotExist as error:
            raise Http404 from error
        if request.data.get('sitio_web'):  # campo trampa para robots
            return Response({'ok': True}, status=status.HTTP_201_CREATED)
        serializador = ConsultaInmuebleSerializer(data=request.data)
        if not serializador.is_valid():
            return Response(serializador.errors, status=status.HTTP_400_BAD_REQUEST)
        consulta = serializador.save(casa=casa)
        cuando = f"\nVisita: {consulta.fecha_visita} ({consulta.get_franja_visita_display() or 'sin franja'})" if consulta.tipo == 'visita' else ''
        avisar_al_equipo(
            f"{'Visita' if consulta.tipo == 'visita' else 'Consulta'} por el inmueble {casa.id}",
            f"{consulta.nombre} ({consulta.telefono} {consulta.correo})\nInmueble: {casa.direccion}, {casa.barrio}, {casa.ciudad}"
            f"{cuando}\n\n{consulta.mensaje}\n\nGestiónala en el administrador: Consultas sobre inmuebles.")
        return Response({'ok': True}, status=status.HTTP_201_CREATED)


def _foto_absoluta(request, casa):
    if not casa.fotoPrincipal:
        return ''
    return request.build_absolute_uri(casa.fotoPrincipal.url)


def compartir(request, pk):
    """GET /api/compartir/<id>/ : pagina minima con las etiquetas de vista previa (WhatsApp, Facebook...) que redirige a la ficha.

    El portal se dibuja en el navegador, asi que WhatsApp no ve el titulo ni la foto de cada inmueble; este enlace si.
    """
    try:
        casa = publicados().get(pk=pk)
    except arrendar.DoesNotExist as error:
        raise Http404 from error
    ficha = InmueblePublicoSerializer(casa, context={'request': request}).data
    destino = f"{settings.FRONTEND_URL}/propiedad/{casa.id}-{ficha['slug']}"
    precio = f"${ficha['precio']:,.0f}".replace(',', '.') if ficha['precio'] else ''
    titulo = html.escape(f"{ficha['titulo']} · {precio}" if precio else ficha['titulo'])
    descripcion = html.escape((casa.descripcion or f"{casa.direccion}, {casa.ciudad}")[:200])
    foto = html.escape(_foto_absoluta(request, casa))
    pagina = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{titulo}</title>
<meta property="og:type" content="website"><meta property="og:site_name" content="Inmobiliaria CL">
<meta property="og:title" content="{titulo}"><meta property="og:description" content="{descripcion}">
<meta property="og:image" content="{foto}"><meta property="og:url" content="{html.escape(destino)}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url={html.escape(destino)}"></head>
<body><p><a href="{html.escape(destino)}">Ver la propiedad</a></p></body></html>"""
    return HttpResponse(pagina, content_type='text/html; charset=utf-8')

