from django.test import TestCase

from inmuebles.models import arrendar
from usuarios.models import User, arrendatario, propietario

from .models import Solicitud
from .serializers import SolicitudSerializer


class SolicitudCompletaTests(TestCase):
    def setUp(self):
        dueno = User.objects.create_user(username="pedro", email="pedro@ejemplo.co", password="Segura123!")
        self.casa = arrendar.objects.create(propietario=propietario.objects.create(user=dueno),
                                            direccion="Calle 1", canonmensual=900000)
        user = User.objects.create_user(username="ana", email="ana@ejemplo.co", password="Segura123!")
        self.arrendatario = arrendatario.objects.create(user=user)

    def enviar(self, **extra):
        datos = {"casa_id": self.casa.id, "arrendatario_id": self.arrendatario.id, "duracionContrato": "6", **extra}
        return self.client.post("/api/solicitud-completa/", data=datos)

    def test_solicitud_sin_codeudor(self):
        # Antes daba 400: idCoarrendatario no admitia NULL y una solicitud sin codeudor no se podia guardar.
        r = self.enviar(tieneCoarrendatario="false")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertIsNone(Solicitud.objects.get().idCoarrendatario)

    def test_solicitud_con_codeudor_nuevo_con_solo_lo_basico(self):
        # Los campos opcionales del codeudor llegan vacios (""): no deben romper el INSERT.
        r = self.enviar(tieneCoarrendatario="true", **{"coarrendatario[first_name]": "Luis",
                        "coarrendatario[last_name]": "Perez", "coarrendatario[doc_identificacion]": "",
                        "coarrendatario[celular]": "", "coarrendatario[lugarExpCedula]": "",
                        "coarrendatario[direccion]": "", "coarrendatario[empresa]": ""})
        self.assertEqual(r.status_code, 201, r.content)
        self.assertIsNotNone(Solicitud.objects.get().idCoarrendatario)


class SolicitudSerializerTests(TestCase):
    """La tarjeta de "Solicitudes Aceptadas" (Crear Contratos) necesita saber si el inmueble es
    de uso Vivienda o Comercial, para saber que tipo de contrato corresponde, y el celular/email
    del arrendatario para poder contactarlo."""

    def setUp(self):
        dueno = User.objects.create_user(username="pedro", email="pedro@ejemplo.co", password="Segura123!")
        self.casa = arrendar.objects.create(propietario=propietario.objects.create(user=dueno),
                                            direccion="Calle 1", canonmensual=900000,
                                            tipoInmueble="Casa", usoInmueble="Comercial")
        user = User.objects.create_user(username="ana", email="ana@ejemplo.co", password="Segura123!")
        self.arrendatario_obj = arrendatario.objects.create(user=user, celular=3001234567)
        self.solicitud = Solicitud.objects.create(casa=self.casa, usuario=self.arrendatario_obj,
                                                  idCoarrendatario=None)

    def test_expone_el_uso_del_inmueble(self):
        self.assertEqual(SolicitudSerializer(self.solicitud).data["usoInmueble"], "Comercial")

    def test_expone_celular_y_email_del_arrendatario(self):
        # La tarjeta de "Solicitudes Aceptadas" los mostraba siempre vacios: el serializador
        # exponia "celular_arrendatario" (que ningun formulario usa) y no exponia el email.
        data = SolicitudSerializer(self.solicitud).data
        self.assertEqual(data["celular"], "3001234567")
        self.assertEqual(data["email"], "ana@ejemplo.co")
