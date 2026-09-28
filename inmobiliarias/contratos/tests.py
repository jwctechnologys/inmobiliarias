from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import ReportePagoRecibos, contrato_local_vivienda


def crear_contrato(arrendatario_id, **extra):
    datos = dict(
        arrendador_nombre_completo="Propietario Demo", arrendador_doc_identificacion="1",
        arrendatario_nombre_completo="Arrendatario Demo", arrendatario_doc_identificacion="2",
        inmueble_direccion="Calle 1 # 2-3", inmueble_barrio="Centro", inmueble_matricula="123",
        inmueble_canon_mensual=1000000, canonArrendamiento=1000000,
        fechainicio=date(2025, 1, 1), fechafin=date(2026, 1, 1),
        fechaEntregaInmueble=date(2025, 1, 1), fechaRestitucionInmueble=date(2026, 1, 1),
        fecha=date(2025, 1, 1), arrendatario_id_original=arrendatario_id,
    )
    datos.update(extra)
    return contrato_local_vivienda.objects.create(**datos)


class VerPagosServiciosTests(TestCase):
    """GET /api/ver-pagos-servicios/<arrendatario_id>/ (antes fallaba con FieldError)."""

    def test_sin_contratos_responde_404_con_mensaje(self):
        r = self.client.get("/api/ver-pagos-servicios/99/")
        self.assertEqual(r.status_code, 404)
        self.assertIn("no tiene contratos", r.json()["message"])

    def test_con_contrato_pero_sin_pagos_responde_404_con_mensaje(self):
        crear_contrato(arrendatario_id=7)
        r = self.client.get("/api/ver-pagos-servicios/7/")
        self.assertEqual(r.status_code, 404)
        self.assertIn("No se han encontrado pagos", r.json()["message"])

    def test_devuelve_solo_los_pagos_del_arrendatario(self):
        propio = crear_contrato(arrendatario_id=7)
        ajeno = crear_contrato(arrendatario_id=8)
        imgs = {f"imagenRecibo{s}": "recibos/x.jpg" for s in ("Luz", "Agua", "Gas", "Bioagricola")}
        ReportePagoRecibos.objects.create(reportePagoReciboContrato=propio, **imgs)
        ReportePagoRecibos.objects.create(reportePagoReciboContrato=ajeno, **imgs)

        r = self.client.get("/api/ver-pagos-servicios/7/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)


class ReporteNovedadesConAudioTests(TestCase):
    """POST /api/reportes-novedades/: el arrendatario puede adjuntar fotos, videos y audios."""

    def test_crea_el_reporte_con_un_audio_adjunto(self):
        from django.core.files.uploadedfile import SimpleUploadedFile

        from .models import audioReporteNovedades

        contrato = crear_contrato(arrendatario_id=5)
        audio = SimpleUploadedFile("nota.mp3", b"contenido falso de audio", content_type="audio/mpeg")

        r = self.client.post("/api/reportes-novedades/", data={
            "contratoNum": contrato.id, "texto": "Se dañó la llave del baño", "audios": [audio],
        })

        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(audioReporteNovedades.objects.filter(reporteNovedad_id=r.json()["id"]).count(), 1)
        self.assertEqual(r.json()["audios"][0]["id"], audioReporteNovedades.objects.get().id)


class ContratosArrendatarioViewTests(TestCase):
    """GET /api/contratos-arrendatario/<arrendatario_id>/: el selector de "Número de Contrato"
    (Reporte Novedades, Subir Recibo de Pago) necesita la direccion y el tipo del inmueble, no solo
    el id."""

    def setUp(self):
        self.usuario = get_user_model().objects.create_user(username="arrendatario1", password="x")
        self.client.force_login(self.usuario)

    def test_expone_direccion_barrio_y_tipo_del_inmueble(self):
        crear_contrato(
            arrendatario_id=5,
            inmueble_direccion="Calle 1 # 2-3", inmueble_barrio="Centro", inmueble_tipo="Apartamento",
            tipoContrato="vivienda", estaFirmado=True, estaFirmadoArrendatario=True,
        )

        r = self.client.get("/api/contratos-arrendatario/5/")

        self.assertEqual(r.status_code, 200, r.content)
        contrato = r.json()[0]
        self.assertEqual(contrato["inmueble"], "Calle 1 # 2-3")
        self.assertEqual(contrato["inmuebleBarrio"], "Centro")
        self.assertEqual(contrato["inmuebleTipo"], "Apartamento")
        self.assertEqual(contrato["tipoContrato"], "vivienda")

    def test_no_expone_contratos_de_otro_arrendatario(self):
        crear_contrato(arrendatario_id=5, estaFirmado=True, estaFirmadoArrendatario=True)
        crear_contrato(arrendatario_id=6, estaFirmado=True, estaFirmadoArrendatario=True)

        r = self.client.get("/api/contratos-arrendatario/5/")

        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)
