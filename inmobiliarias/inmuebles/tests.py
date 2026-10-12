from django.test import TestCase

from inmuebles.serializers import CasaSerializer
from usuarios.models import User, propietario


class CasaCamposOpcionalesTests(TestCase):
    def test_deposito_vacio_es_valido(self):
        # El deposito es opcional: un formulario JSON lo manda "" y antes daba 400 "A valid integer is required".
        user = User.objects.create_user(username="pedro", email="pedro@ejemplo.co", password="Segura123!")
        prop = propietario.objects.create(user=user)
        serializer = CasaSerializer(data={"propietario": prop.id, "direccion": "Calle 1", "canonmensual": 900000,
                                          "deposito": ""})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertIsNone(serializer.validated_data["deposito"])

    def test_registrar_casa_por_formulario_multipart_con_deposito_vacio(self):
        # El formulario de registro (RegistroCasasBasico.jsx) manda un FormData (multipart), no JSON.
        # Un QueryDict TAMBIEN es un dict, y dict(un_querydict) rompe todos sus valores (cada uno
        # queda envuelto en una lista de un elemento): esto tumbaba CUALQUIER registro de casa por
        # este formulario en el que se dejara vacio un campo opcional como el deposito.
        user = User.objects.create_user(username="marta", email="marta@ejemplo.co", password="Segura123!")
        prop = propietario.objects.create(user=user)
        r = self.client.post("/api/crear_casa/", data={
            "propietario": prop.id, "direccion": "Calle 1", "canonmensual": 900000, "deposito": "",
        })
        self.assertEqual(r.status_code, 201, r.content)
        self.assertIsNone(r.json()["deposito"])


class PublicarPropiedadTests(TestCase):
    """Formulario publico "Publica tu propiedad": no pide cuenta y deja la solicitud pendiente para el equipo."""

    URL = '/api/publicar_propiedad/'
    DATOS = {'nombre': 'Marta Ruiz', 'telefono': '3001234567', 'direccion': 'Calle 5 # 3-20', 'ciudad': 'Villavicencio',
             'modalidad': 'venta', 'precio': '250000000', 'tipoInmueble': 'Casa'}

    def setUp(self):
        from django.core.cache import cache
        cache.clear()  # el limite por hora usa la cache: cada prueba empieza de cero

    def test_cualquier_persona_puede_enviar_su_propiedad(self):
        from inmuebles.models import SolicitudPublicacion
        respuesta = self.client.post(self.URL, self.DATOS)
        self.assertEqual(respuesta.status_code, 201, respuesta.content)
        solicitud = SolicitudPublicacion.objects.get()
        self.assertEqual(solicitud.estado, 'pendiente')
        self.assertEqual(solicitud.precio, 250000000)
        self.assertEqual(solicitud.modalidad, 'venta')

    def test_faltan_datos_obligatorios(self):
        respuesta = self.client.post(self.URL, {'direccion': 'Calle 5'})
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('nombre', respuesta.json())
        self.assertIn('telefono', respuesta.json())

    def test_el_estado_no_se_puede_forzar_desde_el_formulario(self):
        from inmuebles.models import SolicitudPublicacion
        self.client.post(self.URL, {**self.DATOS, 'estado': 'descartada'})
        self.assertEqual(SolicitudPublicacion.objects.get().estado, 'pendiente')

    def test_un_robot_que_llena_el_campo_trampa_no_guarda_nada(self):
        from inmuebles.models import SolicitudPublicacion
        respuesta = self.client.post(self.URL, {**self.DATOS, 'sitio_web': 'http://spam.example'})
        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(SolicitudPublicacion.objects.count(), 0)

    def test_limite_de_envios_por_hora(self):
        for _ in range(8):
            self.assertEqual(self.client.post(self.URL, self.DATOS).status_code, 201)
        self.assertEqual(self.client.post(self.URL, self.DATOS).status_code, 429)
