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
