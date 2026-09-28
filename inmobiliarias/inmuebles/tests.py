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
