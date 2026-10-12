import shutil
import tempfile
from datetime import timedelta
from io import BytesIO

from django.contrib.auth.models import Group
from django.core import mail
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from django.test import TestCase, override_settings
from unittest import skipIf
from django.utils import timezone
from PIL import Image

from inmuebles.models import ConsultaInmueble, SolicitudPublicacion, arrendar
from inmuebles.serializers import CasaSerializer
from inmuebles.utilidades import comprimir_imagen, parsear_coordenadas, slug_de
from usuarios.models import User, propietario

def crear_usuario(nombre, grupo=None):
    usuario = User.objects.create_user(username=nombre, email=f"{nombre}@ejemplo.co", password="Segura123!")
    if grupo:
        usuario.groups.add(Group.objects.get_or_create(name=grupo)[0])
    return usuario


def crear_propietario(nombre):
    usuario = crear_usuario(nombre, 'propietario')
    return propietario.objects.create(user=usuario)


def crear_casa(dueno, **campos):
    datos = dict(propietario=dueno, direccion='Calle 1 # 2-3', barrio='Centro', ciudad='Villavicencio', canonmensual=900000,
                 modalidad='arriendo', publicar=True, tipoInmueble='Apartamento')
    datos.update(campos)
    return arrendar.objects.create(**datos)


class CasaCamposOpcionalesTests(TestCase):
    def test_deposito_vacio_es_valido(self):
        # El deposito es opcional: un formulario JSON lo manda "" y antes daba 400 "A valid integer is required".
        prop = crear_propietario("pedro")
        serializer = CasaSerializer(data={"propietario": prop.id, "direccion": "Calle 1", "canonmensual": 900000,
                                          "deposito": ""})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertIsNone(serializer.validated_data["deposito"])

    def test_registrar_casa_por_formulario_multipart_con_deposito_vacio(self):
        # El formulario de registro (RegistroCasasBasico.jsx) manda un FormData (multipart), no JSON.
        # Un QueryDict TAMBIEN es un dict, y dict(un_querydict) rompe todos sus valores (cada uno
        # queda envuelto en una lista de un elemento): esto tumbaba CUALQUIER registro de casa por
        # este formulario en el que se dejara vacio un campo opcional como el deposito.
        prop = crear_propietario("marta")
        self.client.force_login(prop.user)
        r = self.client.post("/api/crear_casa/", data={
            "propietario": prop.id, "direccion": "Calle 1", "canonmensual": 900000, "deposito": "",
        })
        self.assertEqual(r.status_code, 201, r.content)
        self.assertIsNone(r.json()["deposito"])

    def test_las_cantidades_marcan_que_el_espacio_existe(self):
        prop = crear_propietario("lucia")
        serializer = CasaSerializer(data={"propietario": prop.id, "direccion": "Calle 1", "canonmensual": 1,
                                          "num_habitaciones": 3, "num_banos": 2, "num_parqueaderos": 1})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertTrue(all(serializer.validated_data[c] for c in ('habitaciones', 'baños', 'garage')))


class SeguridadDeLaApiTests(TestCase):
    """Escribir exige ser administrador o el propietario de la casa; leer sin sesion no muestra datos privados."""

    def setUp(self):
        cache.clear()
        self.dueno = crear_propietario("dueno")
        self.otro = crear_propietario("otro")
        self.admin = crear_usuario("jefe", 'administrador')
        self.casa = crear_casa(self.dueno, matriculaInmobiliaria='230-39972')

    def test_sin_sesion_no_se_puede_crear_editar_ni_borrar(self):
        self.assertEqual(self.client.post('/api/crear_casa/', {'direccion': 'X', 'canonmensual': 1, 'propietario': self.dueno.id}).status_code, 403)
        self.assertEqual(self.client.post('/api/casas/', {'direccion': 'X', 'canonmensual': 1, 'propietario': self.dueno.id}).status_code, 403)
        self.assertEqual(self.client.patch(f'/api/casas/{self.casa.id}/', {'direccion': 'Hackeada'}, content_type='application/json').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/casas/{self.casa.id}/').status_code, 403)
        self.casa.refresh_from_db()
        self.assertEqual(self.casa.direccion, 'Calle 1 # 2-3')

    def test_un_propietario_no_toca_la_casa_de_otro(self):
        self.client.force_login(self.otro.user)
        self.assertEqual(self.client.patch(f'/api/casas/{self.casa.id}/', {'direccion': 'Ajena'}, content_type='application/json').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/casas/{self.casa.id}/').status_code, 403)

    def test_el_dueno_y_el_administrador_si_pueden_editar(self):
        self.client.force_login(self.dueno.user)
        self.assertEqual(self.client.patch(f'/api/casas/{self.casa.id}/', {'barrio': 'Nuevo'}, content_type='application/json').status_code, 200)
        self.client.force_login(self.admin)
        self.assertEqual(self.client.patch(f'/api/casas/{self.casa.id}/', {'barrio': 'Otro'}, content_type='application/json').status_code, 200)

    def test_sin_sesion_se_lee_pero_sin_datos_privados(self):
        for url in (f'/api/casas/{self.casa.id}/', '/api/casas/'):
            r = self.client.get(url)
            self.assertEqual(r.status_code, 200)
            datos = r.json() if isinstance(r.json(), dict) else r.json()[0]
            self.assertNotIn('propietario', datos)
            self.assertNotIn('matriculaInmobiliaria', datos)
            self.assertEqual(datos['barrio'], 'Centro')

    def test_el_dueno_y_el_administrador_ven_todo(self):
        for usuario in (self.dueno.user, self.admin):
            self.client.force_login(usuario)
            datos = self.client.get(f'/api/casas/{self.casa.id}/').json()
            self.assertEqual(datos['propietario'], self.dueno.id)
            self.assertEqual(datos['matriculaInmobiliaria'], '230-39972')

    def test_un_propietario_solo_registra_a_su_nombre(self):
        self.client.force_login(self.otro.user)
        r = self.client.post('/api/crear_casa/', {'propietario': self.dueno.id, 'direccion': 'Calle 9', 'canonmensual': 5})
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(arrendar.objects.get(direccion='Calle 9').propietario_id, self.otro.id)

    def test_un_arrendatario_no_puede_registrar_inmuebles(self):
        self.client.force_login(crear_usuario('inquilino', 'arrendatario'))
        self.assertEqual(self.client.post('/api/crear_casa/', {'propietario': self.dueno.id, 'direccion': 'X', 'canonmensual': 1}).status_code, 403)

    def test_listas_internas_exigen_sesion_y_rol(self):
        self.assertEqual(self.client.get('/api/inmuebles/').status_code, 403)
        self.assertEqual(self.client.get('/api/InmuebleViewSet/').status_code, 403)
        self.client.force_login(self.dueno.user)
        self.assertEqual(self.client.get('/api/inmuebles/').status_code, 200)
        self.assertEqual(self.client.get('/api/InmuebleViewSet/').status_code, 403)  # datos personales: solo administrador
        self.client.force_login(self.admin)
        self.assertEqual(self.client.get('/api/InmuebleViewSet/').status_code, 200)

    def test_un_propietario_solo_ve_sus_inmuebles_en_la_lista_interna(self):
        crear_casa(self.otro, direccion='De otro')
        self.client.force_login(self.dueno.user)
        direcciones = [c['direccion'] for c in self.client.get('/api/inmuebles/').json()]
        self.assertEqual(direcciones, ['Calle 1 # 2-3'])

    def test_fotos_y_videos_solo_en_inmuebles_propios(self):
        def foto():
            buffer = BytesIO()
            Image.new('RGB', (10, 10), (1, 2, 3)).save(buffer, format='PNG')
            return SimpleUploadedFile('a.png', buffer.getvalue(), content_type='image/png')

        self.assertEqual(self.client.post('/api/imagenes/', {'arrendar': self.casa.id, 'imagen': foto()}).status_code, 403)
        self.client.force_login(self.otro.user)
        self.assertEqual(self.client.post('/api/imagenes/', {'arrendar': self.casa.id, 'imagen': foto()}).status_code, 403)


class DatosDelInmuebleTests(TestCase):
    def test_las_coordenadas_de_google_maps_se_convierten_en_latitud_y_longitud(self):
        casa = crear_casa(crear_propietario('geo'), coordenadas='4.1295747, -73.6220074')
        self.assertAlmostEqual(casa.latitud, 4.1295747)
        self.assertAlmostEqual(casa.longitud, -73.6220074)
        casa.coordenadas = ''
        casa.save()
        self.assertIsNone(casa.latitud)

    def test_parsear_coordenadas(self):
        self.assertEqual(parsear_coordenadas('4.5,-73.6'), (4.5, -73.6))
        self.assertIsNone(parsear_coordenadas('95, 10'))
        self.assertIsNone(parsear_coordenadas('hola'))

    def test_slug(self):
        self.assertEqual(slug_de('Apartamento en arriendo en Ciudad Salitre'), 'apartamento-en-arriendo-en-ciudad-salitre')
        self.assertEqual(slug_de('Habitación pequeña'), 'habitacion-pequena')

    @skipIf(settings.USE_S3, 'Guarda en disco: ejecutar con USE_S3=0 (si no, la prueba subiria la foto al bucket real)')
    def test_las_fotos_se_reducen_al_guardarse(self):
        carpeta = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, carpeta, True)
        with override_settings(MEDIA_ROOT=carpeta):
            grande = BytesIO()
            Image.new('RGB', (4000, 3000), (200, 30, 30)).save(grande, format='PNG')
            casa = crear_casa(crear_propietario('foto'), fotoPrincipal=SimpleUploadedFile('casa.png', grande.getvalue(), content_type='image/png'))
            casa.refresh_from_db()
            self.assertTrue(casa.fotoPrincipal.name.endswith('.jpg'))
            ancho, alto = Image.open(casa.fotoPrincipal.path).size
            self.assertEqual(max(ancho, alto), 1600)

    def test_una_foto_que_no_es_imagen_no_tumba_el_guardado(self):
        class Campo:
            _committed = False
            name = 'x.jpg'
            file = BytesIO(b'no soy una imagen')
        comprimir_imagen(Campo())  # no lanza error


class BusquedaPublicaTests(TestCase):
    URL = '/api/publico/inmuebles/'

    def setUp(self):
        cache.clear()
        dueno = crear_propietario('vendedor')
        self.a = crear_casa(dueno, barrio='Barzal', canonmensual=700000, num_habitaciones=2, num_banos=1, area=55, estrato=3, verificada=True)
        self.b = crear_casa(dueno, barrio='Centro', canonmensual=1800000, num_habitaciones=4, num_banos=3, area=140, estrato=5, tipoInmueble='Casa', ciudad='Bogotá')
        self.c = crear_casa(dueno, barrio='La Esperanza', modalidad='venta', precioVenta=320000000, canonmensual=0, tipoInmueble='Casa', descripcion='Casa con patio amplio')
        self.oculta = crear_casa(dueno, barrio='Oculta', publicar=False)
        self.arrendada = crear_casa(dueno, barrio='Arrendada', arrendada=True)
        self.aceptada = crear_casa(dueno, barrio='Aceptada', solicitudAceptada=True)

    def ids(self, **parametros):
        cache.clear()
        r = self.client.get(self.URL, parametros)
        self.assertEqual(r.status_code, 200, r.content)
        return [i['id'] for i in r.json()['resultados']]

    def test_solo_se_listan_los_publicados_y_disponibles(self):
        self.assertEqual(sorted(self.ids()), sorted([self.a.id, self.b.id, self.c.id]))

    def test_no_expone_datos_del_propietario(self):
        cache.clear()
        ficha = self.client.get(self.URL).json()['resultados'][0]
        for privado in ('propietario', 'matriculaInmobiliaria', 'condiciones'):
            self.assertNotIn(privado, ficha)

    def test_filtros(self):
        self.assertEqual(self.ids(modalidad='venta'), [self.c.id])
        self.assertEqual(sorted(self.ids(modalidad='arriendo')), sorted([self.a.id, self.b.id]))
        self.assertEqual(self.ids(ciudad='bogotá'), [self.b.id])
        self.assertEqual(self.ids(tipo='casa', modalidad='arriendo'), [self.b.id])
        self.assertEqual(self.ids(modalidad='arriendo', precio_max=1000000), [self.a.id])
        self.assertEqual(self.ids(modalidad='arriendo', precio_min=1000000), [self.b.id])
        self.assertEqual(self.ids(habitaciones=3), [self.b.id])
        self.assertEqual(self.ids(banos=2), [self.b.id])
        self.assertEqual(self.ids(area_min=100), [self.b.id])
        self.assertEqual(self.ids(estrato=3), [self.a.id])
        self.assertEqual(self.ids(q='patio'), [self.c.id])
        self.assertEqual(self.ids(verificada='1'), [self.a.id])

    def test_orden(self):
        self.assertEqual(self.ids(modalidad='arriendo', orden='precio_asc'), [self.a.id, self.b.id])
        self.assertEqual(self.ids(modalidad='arriendo', orden='precio_desc'), [self.b.id, self.a.id])
        self.assertEqual(self.ids(orden='recientes')[0], self.c.id)

    def test_los_destacados_van_primero_y_el_vencimiento_se_respeta(self):
        # a esta verificada (va de primera); b se destaca y la supera; al vencer el destacado, vuelve a ir despues
        self.assertEqual(self.ids()[0], self.a.id)
        arrendar.objects.filter(pk=self.b.pk).update(destacada=True)
        self.assertEqual(self.ids()[0], self.b.id)
        arrendar.objects.filter(pk=self.b.pk).update(destacada_hasta=timezone.localdate() - timedelta(days=1))
        self.assertEqual(self.ids()[0], self.a.id)
        cache.clear()
        fichas = {i['id']: i for i in self.client.get(self.URL).json()['resultados']}
        self.assertFalse(fichas[self.b.id]['destacada'])

    def test_paginacion(self):
        cache.clear()
        r = self.client.get(self.URL, {'por_pagina': 2, 'pagina': 2}).json()
        self.assertEqual((r['total'], r['paginas'], r['pagina'], len(r['resultados'])), (3, 2, 2, 1))
        cache.clear()
        self.assertEqual(self.client.get(self.URL, {'por_pagina': 999}).json()['por_pagina'], 48)

    def test_ficha_con_cantidades_y_visitas(self):
        antes = arrendar.objects.get(pk=self.a.pk).vistas
        r = self.client.get(f'{self.URL}{self.a.id}/')
        self.assertEqual(r.status_code, 200)
        datos = r.json()
        self.assertEqual((datos['habitaciones'], datos['banos'], datos['estrato']), (2, 1, 3))
        self.assertEqual(datos['titulo'], 'Apartamento en arriendo en Barzal')
        self.assertNotIn('propietario', datos)
        self.assertIn('parecidos', datos)
        self.assertEqual(arrendar.objects.get(pk=self.a.pk).vistas, antes + 1)

    def test_una_ficha_no_publicada_no_existe(self):
        for casa in (self.oculta, self.arrendada, self.aceptada):
            self.assertEqual(self.client.get(f'{self.URL}{casa.id}/').status_code, 404)

    def test_mapa_filtros_y_enlace_para_compartir(self):
        arrendar.objects.filter(pk=self.a.pk).update(latitud=4.14, longitud=-73.62)
        cache.clear()
        puntos = self.client.get('/api/publico/mapa/').json()['resultados']
        self.assertEqual([p['id'] for p in puntos], [self.a.id])
        cache.clear()
        filtros = self.client.get('/api/publico/filtros/').json()
        self.assertEqual(filtros['conteo'], {'arriendo': 2, 'venta': 1, 'todas': 3})
        self.assertIn('Villavicencio', filtros['ciudades'])
        pagina = self.client.get(f'/api/compartir/{self.a.id}/')
        self.assertContains(pagina, 'og:title')
        self.assertContains(pagina, f'/propiedad/{self.a.id}-apartamento-en-arriendo-en-barzal')
        self.assertEqual(self.client.get(f'/api/compartir/{self.oculta.id}/').status_code, 404)


@override_settings(NOTIFICAR_A=['equipo@ejemplo.co'])
class ConsultasTests(TestCase):
    def setUp(self):
        cache.clear()
        self.dueno = crear_propietario('consultado')
        self.casa = crear_casa(self.dueno)
        self.url = f'/api/publico/inmuebles/{self.casa.id}/consulta/'
        self.datos = {'nombre': 'Ana Gómez', 'telefono': '3001112233', 'mensaje': '¿Sigue disponible?', 'acepta_datos': 'true'}

    def test_una_consulta_queda_guardada_y_avisa_al_equipo(self):
        r = self.client.post(self.url, self.datos)
        self.assertEqual(r.status_code, 201, r.content)
        consulta = ConsultaInmueble.objects.get()
        self.assertEqual((consulta.casa_id, consulta.estado, consulta.tipo), (self.casa.id, 'nueva', 'info'))
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Ana Gómez', mail.outbox[0].body)

    def test_sin_autorizar_los_datos_no_se_guarda(self):
        r = self.client.post(self.url, {**self.datos, 'acepta_datos': 'false'})
        self.assertEqual(r.status_code, 400)
        self.assertIn('acepta_datos', r.json())
        self.assertEqual(ConsultaInmueble.objects.count(), 0)

    def test_la_visita_pide_fecha_y_no_acepta_el_pasado(self):
        self.assertIn('fecha_visita', self.client.post(self.url, {**self.datos, 'tipo': 'visita'}).json())
        ayer = (timezone.localdate() - timedelta(days=1)).isoformat()
        self.assertEqual(self.client.post(self.url, {**self.datos, 'tipo': 'visita', 'fecha_visita': ayer}).status_code, 400)
        manana = (timezone.localdate() + timedelta(days=1)).isoformat()
        r = self.client.post(self.url, {**self.datos, 'tipo': 'visita', 'fecha_visita': manana, 'franja_visita': 'tarde'})
        self.assertEqual(r.status_code, 201, r.content)

    def test_no_se_puede_consultar_un_inmueble_no_publicado(self):
        oculto = crear_casa(self.dueno, publicar=False)
        self.assertEqual(self.client.post(f'/api/publico/inmuebles/{oculto.id}/consulta/', self.datos).status_code, 404)

    def test_robot_y_limite_por_hora(self):
        self.assertEqual(self.client.post(self.url, {**self.datos, 'sitio_web': 'spam'}).status_code, 201)
        self.assertEqual(ConsultaInmueble.objects.count(), 0)
        for _ in range(10):
            self.client.post(self.url, self.datos)
        self.assertEqual(self.client.post(self.url, self.datos).status_code, 429)


class GestionTests(TestCase):
    def setUp(self):
        cache.clear()
        self.dueno = crear_propietario('gestor1')
        self.otro = crear_propietario('gestor2')
        self.admin = crear_usuario('jefa', 'administrador')
        self.casa = crear_casa(self.dueno)
        self.ajena = crear_casa(self.otro, direccion='De otro')
        self.mia = ConsultaInmueble.objects.create(casa=self.casa, nombre='Luis', telefono='3000000000', acepta_datos=True)
        self.de_otro = ConsultaInmueble.objects.create(casa=self.ajena, nombre='Eva', telefono='3000000001', acepta_datos=True)
        self.solicitud = SolicitudPublicacion.objects.create(nombre='Rosa', telefono='3000000002', direccion='Calle 8', acepta_datos=True)

    def test_sin_sesion_nada(self):
        for url in ('/api/gestion/publicaciones/', '/api/gestion/consultas/', '/api/gestion/mis-inmuebles/'):
            self.assertIn(self.client.get(url).status_code, (401, 403))

    def test_solo_el_administrador_ve_las_solicitudes_de_publicacion(self):
        self.client.force_login(self.dueno.user)
        self.assertEqual(self.client.get('/api/gestion/publicaciones/').status_code, 403)
        self.client.force_login(self.admin)
        self.assertEqual([s['nombre'] for s in self.client.get('/api/gestion/publicaciones/').json()], ['Rosa'])

    def test_el_administrador_cambia_el_estado_de_una_solicitud(self):
        self.client.force_login(self.admin)
        r = self.client.patch(f'/api/gestion/publicaciones/{self.solicitud.id}/', {'estado': 'contactado', 'notas': 'Llamada hecha'}, content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.solicitud.refresh_from_db()
        self.assertEqual((self.solicitud.estado, self.solicitud.notas), ('contactado', 'Llamada hecha'))
        self.assertEqual(self.client.patch(f'/api/gestion/publicaciones/{self.solicitud.id}/', {'estado': 'inventado'}, content_type='application/json').status_code, 400)

    def test_cada_propietario_ve_solo_las_consultas_de_sus_inmuebles(self):
        self.client.force_login(self.dueno.user)
        self.assertEqual([c['nombre'] for c in self.client.get('/api/gestion/consultas/').json()], ['Luis'])
        self.assertEqual(self.client.patch(f'/api/gestion/consultas/{self.de_otro.id}/', {'estado': 'atendida'}, content_type='application/json').status_code, 404)
        self.assertEqual(self.client.patch(f'/api/gestion/consultas/{self.mia.id}/', {'estado': 'atendida'}, content_type='application/json').status_code, 200)
        self.client.force_login(self.admin)
        self.assertEqual(len(self.client.get('/api/gestion/consultas/').json()), 2)

    def test_estadisticas_de_mis_inmuebles(self):
        arrendar.objects.filter(pk=self.casa.pk).update(vistas=12)
        self.client.force_login(self.dueno.user)
        filas = self.client.get('/api/gestion/mis-inmuebles/').json()
        self.assertEqual(len(filas), 1)
        self.assertEqual((filas[0]['vistas'], filas[0]['consultas'], filas[0]['consultas_nuevas'], filas[0]['publicada']), (12, 1, 1, True))


class PublicarPropiedadTests(TestCase):
    """Formulario publico "Publica tu propiedad": no pide cuenta y deja la solicitud pendiente para el equipo."""

    URL = '/api/publicar_propiedad/'
    DATOS = {'nombre': 'Marta Ruiz', 'telefono': '3001234567', 'direccion': 'Calle 5 # 3-20', 'ciudad': 'Villavicencio',
             'modalidad': 'venta', 'precio': '250000000', 'tipoInmueble': 'Casa', 'acepta_datos': 'true'}

    def setUp(self):
        cache.clear()  # el limite por hora usa la cache: cada prueba empieza de cero

    def test_cualquier_persona_puede_enviar_su_propiedad(self):
        respuesta = self.client.post(self.URL, self.DATOS)
        self.assertEqual(respuesta.status_code, 201, respuesta.content)
        solicitud = SolicitudPublicacion.objects.get()
        self.assertEqual(solicitud.estado, 'pendiente')
        self.assertEqual(solicitud.precio, 250000000)
        self.assertEqual(solicitud.modalidad, 'venta')
        self.assertTrue(solicitud.acepta_datos)

    @override_settings(NOTIFICAR_A=['equipo@ejemplo.co'])
    def test_avisa_al_equipo_por_correo(self):
        self.client.post(self.URL, self.DATOS)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Marta Ruiz', mail.outbox[0].body)

    def test_sin_autorizar_los_datos_no_se_guarda(self):
        respuesta = self.client.post(self.URL, {**self.DATOS, 'acepta_datos': 'false'})
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('acepta_datos', respuesta.json())

    def test_faltan_datos_obligatorios(self):
        respuesta = self.client.post(self.URL, {'direccion': 'Calle 5', 'acepta_datos': 'true'})
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('nombre', respuesta.json())
        self.assertIn('telefono', respuesta.json())

    def test_el_estado_no_se_puede_forzar_desde_el_formulario(self):
        self.client.post(self.URL, {**self.DATOS, 'estado': 'descartada'})
        self.assertEqual(SolicitudPublicacion.objects.get().estado, 'pendiente')

    def test_un_robot_que_llena_el_campo_trampa_no_guarda_nada(self):
        respuesta = self.client.post(self.URL, {**self.DATOS, 'sitio_web': 'http://spam.example'})
        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(SolicitudPublicacion.objects.count(), 0)

    def test_limite_de_envios_por_hora(self):
        for _ in range(8):
            self.assertEqual(self.client.post(self.URL, self.DATOS).status_code, 201)
        self.assertEqual(self.client.post(self.URL, self.DATOS).status_code, 429)
