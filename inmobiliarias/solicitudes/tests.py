from django.test import TestCase

from inmuebles.models import arrendar
from usuarios.models import User, arrendatario, propietario

from .models import Solicitud


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
