import json

from django.test import TestCase

from .models import arrendatario, propietario, proveedor


class RegistroCompletoTests(TestCase):
    """Registro con is_basic=False: crea el usuario y su perfil de rol en un solo paso."""

    def registrar(self, group, username="ana", **extra):
        # Los mismos campos que envia el formulario del frontend.
        payload = {
            "username": username, "email": f"{username}@ejemplo.co", "password": "Segura123!",
            "group": group, "is_basic": False, "genero": "F", "tipo_documento": "CC",
            "doc_identificacion": 123456, "lugarExpCedula": "Villavicencio",
            "direccion": "Calle 1 # 2-3", "barrio": "Centro", "ciudad": "Villavicencio",
            "direccionCorrespondencia": "Calle 1 # 2-3", "barrioCorrespondencia": "Centro",
            "ciudadCorrespondencia": "Villavicencio", **extra,
        }
        return self.client.post("/api/create/", data=json.dumps(payload),
                                content_type="application/json")

    def test_arrendatario_guarda_su_estado_civil(self):
        # Antes fallaba con NameError (estadoCivil no estaba definido) y borraba el usuario.
        r = self.registrar("arrendatario", estadoCivil="Soltera")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(arrendatario.objects.get(user__username="ana").estadoCivil, "Soltera")

    def test_arrendatario_sin_estado_civil_tambien_se_registra(self):
        r = self.registrar("arrendatario")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertIsNone(arrendatario.objects.get(user__username="ana").estadoCivil)

    def test_propietario_y_proveedor_siguen_funcionando(self):
        self.assertEqual(self.registrar("propietario").status_code, 201)
        self.assertTrue(propietario.objects.filter(user__username="ana").exists())

        r = self.registrar("proveedor", username="beto")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertTrue(proveedor.objects.filter(user__username="beto").exists())
