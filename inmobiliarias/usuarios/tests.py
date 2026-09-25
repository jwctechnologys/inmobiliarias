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

    def test_arrendatario_de_vivienda_sin_codigo_industrial(self):
        # El formulario manda "" cuando se deja vacio (no aplica a vivienda): antes daba
        # "Field 'CodClasificaIndustrialIU' expected a number but got ''".
        r = self.registrar("arrendatario", CodClasificaIndustrialIU="")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertIsNone(arrendatario.objects.get(user__username="ana").CodClasificaIndustrialIU)

    def test_arrendatario_comercial_guarda_su_codigo_industrial(self):
        r = self.registrar("arrendatario", CodClasificaIndustrialIU="9602")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(arrendatario.objects.get(user__username="ana").CodClasificaIndustrialIU, 9602)

    def test_celular_colombiano_de_10_digitos(self):
        # 3209028064 supera el maximo de un entero de 32 bits (2.147.483.647): en PostgreSQL daba
        # "integer out of range" y el usuario recien creado se borraba.
        for grupo in ("arrendatario", "proveedor"):
            r = self.registrar(grupo, username=f"celu_{grupo}", celular=3209028064, celularDos=3017654321)
            self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(arrendatario.objects.get(user__username="celu_arrendatario").celular, 3209028064)
        self.assertEqual(proveedor.objects.get(user__username="celu_proveedor").celularDos, 3017654321)

    def test_propietario_y_proveedor_siguen_funcionando(self):
        self.assertEqual(self.registrar("propietario").status_code, 201)
        self.assertTrue(propietario.objects.filter(user__username="ana").exists())

        r = self.registrar("proveedor", username="beto")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertTrue(proveedor.objects.filter(user__username="beto").exists())
