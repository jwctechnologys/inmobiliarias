import json

from django.test import TestCase

from usuarios.models import User, arrendatario

from .models import coarrendatario


class CrearCoarrendatarioTests(TestCase):
    def setUp(self):
        user = User.objects.create_user(username="ana", email="ana@ejemplo.co", password="Segura123!")
        self.arrendatario = arrendatario.objects.create(user=user)

    def crear(self, **extra):
        payload = {
            "arrendatario": self.arrendatario.id, "first_name": "Luis", "last_name": "Perez",
            "email": "luis@ejemplo.co", "tipo_documento": "CC", "doc_identificacion": "1122121279",
            "lugarExpCedula": "Acacias", "genero": "M", "empresa": "", "ocupacion": "",
            "direccion": "Calle 31 # 13-31", "barrio": "Centro", "ciudad": "Villavicencio",
            "direccionCorrespondencia": "Calle 31 # 13-31", "barrioCorrespondencia": "Centro",
            "ciudadCorrespondencia": "Villavicencio", "celular": "3112977693", "celularDos": None,
            **extra,
        }
        return self.client.post("/api/coarrendatarios/create/", data=json.dumps(payload),
                                content_type="application/json")

    def test_se_guarda_ligado_al_arrendatario(self):
        # Antes daba 500: arrendatario_id llegaba NULL porque el serializador (depth=2) lo ignoraba.
        r = self.crear()
        self.assertEqual(r.status_code, 201, r.content)
        co = coarrendatario.objects.get()
        self.assertEqual(co.arrendatario_id, self.arrendatario.id)
        self.assertEqual(co.celular, 3112977693)

    def test_sin_arrendatario_responde_400(self):
        r = self.crear(arrendatario="")
        self.assertEqual(r.status_code, 400)
