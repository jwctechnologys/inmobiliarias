from datetime import date

from django.test import TestCase

from .models import ReportePagoRecibos, contrato_local_vivienda


def crear_contrato(arrendatario_id):
    return contrato_local_vivienda.objects.create(
        arrendador_nombre_completo="Propietario Demo", arrendador_doc_identificacion="1",
        arrendatario_nombre_completo="Arrendatario Demo", arrendatario_doc_identificacion="2",
        inmueble_direccion="Calle 1 # 2-3", inmueble_barrio="Centro", inmueble_matricula="123",
        inmueble_canon_mensual=1000000, canonArrendamiento=1000000,
        fechainicio=date(2025, 1, 1), fechafin=date(2026, 1, 1),
        fechaEntregaInmueble=date(2025, 1, 1), fechaRestitucionInmueble=date(2026, 1, 1),
        fecha=date(2025, 1, 1), arrendatario_id_original=arrendatario_id,
    )


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
