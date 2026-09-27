import json

from django.test import TestCase

from .models import arrendatario, propietario, proveedor


class RegistroMixin:
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


class RegistroCompletoTests(RegistroMixin, TestCase):
    """Registro con is_basic=False: crea el usuario y su perfil de rol en un solo paso."""

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

    def test_registro_con_numericos_opcionales_vacios(self):
        # Celular, documento, cuentas y codigo CIIU se dejan vacios ("" desde el formulario): a NULL.
        vacios = dict(celular="", celularDos="", doc_identificacion="", cuentaDaviplata="",
                      cuentaNequi="", CuentaBancolombia="", CodClasificaIndustrialIU="")
        for grupo in ("arrendatario", "propietario", "proveedor"):
            r = self.registrar(grupo, username=f"vacio_{grupo}", **vacios)
            self.assertEqual(r.status_code, 201, (grupo, r.content))
        p = propietario.objects.get(user__username="vacio_propietario")
        self.assertIsNone(p.celular)
        self.assertIsNone(p.cuentaNequi)
        self.assertIsNone(p.doc_identificacion)


class ActualizarPerfilTests(RegistroMixin, TestCase):
    def test_actualizar_con_id_del_perfil_distinto_al_del_usuario(self):
        # listar_usuarios_por_grupo devuelve el id del PERFIL (arrendatario.id), no el del User: hay
        # que crear otro usuario antes para que difieran y no pasar la prueba "por casualidad".
        self.registrar("propietario", username="otro")
        self.registrar("arrendatario", celular=3209028064, CodClasificaIndustrialIU="9602")
        perfil = arrendatario.objects.get(user__username="ana")
        self.assertNotEqual(perfil.id, perfil.user_id)  # confirma que el caso realmente los distingue

        # El formulario de edicion manda "" en los numericos que se borran: a NULL, no error 500.
        r = self.client.put("/api/user_profile_update/", data=json.dumps(
            {"groups": "arrendatario", "id": perfil.id, "celular": "", "CodClasificaIndustrialIU": ""}),
            content_type="application/json")
        self.assertEqual(r.status_code, 200, r.content)
        # El "user_id" de la respuesta debe ser el de ana (dueña del perfil), no el de "otro": antes
        # se buscaba el User con el mismo numero que el perfil, y aqui coincidia con OTRO usuario
        # (sin dar error), devolviendo el usuario equivocado sin que nada lo delatara.
        self.assertEqual(r.json()["user_id"], perfil.user_id)
        perfil.refresh_from_db()
        self.assertIsNone(perfil.celular)
        self.assertIsNone(perfil.CodClasificaIndustrialIU)
