from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

from usuarios.models import arrendatario, propietario, proveedor

from .models import AtributoProveedor, CalificacionArrendatario, CalificacionProveedor


class CalificacionesTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        User = get_user_model()
        cls.prop = propietario.objects.create(user=User.objects.create_user('prop', 'p@x.co', 'x'))
        cls.arr = arrendatario.objects.create(user=User.objects.create_user('arr', 'a@x.co', 'x'))
        cls.prov = proveedor.objects.create(user=User.objects.create_user('prov', 'v@x.co', 'x'))

    def test_atributos_iniciales_creados_por_la_migracion(self):
        codigos = set(AtributoProveedor.objects.values_list('codigo', flat=True))
        self.assertEqual(codigos, {'responsable', 'diligente', 'acomedido', 'otro'})

    def test_puntuacion_debe_estar_entre_1_y_5(self):
        for mala in (0, 6):
            c = CalificacionArrendatario(propietario=self.prop, arrendatario=self.arr, puntuacion=mala)
            with self.assertRaises(ValidationError):
                c.full_clean()
        CalificacionArrendatario(propietario=self.prop, arrendatario=self.arr, puntuacion=5).full_clean()

    def test_resumen_da_promedio_y_total(self):
        for p in (5, 3):
            CalificacionArrendatario.objects.create(propietario=self.prop, arrendatario=self.arr, puntuacion=p)
        r = CalificacionArrendatario.objects.filter(arrendatario=self.arr).resumen()
        self.assertEqual(r, {'promedio': 4.0, 'total': 2})

    def test_calificacion_de_proveedor_con_cualidades(self):
        c = CalificacionProveedor.objects.create(propietario=self.prop, proveedor=self.prov, puntuacion=4)
        c.atributos.set(AtributoProveedor.objects.filter(codigo__in=['responsable', 'diligente']))
        self.assertEqual(c.atributos.count(), 2)
        self.assertEqual(self.prov.calificaciones.count(), 1)

    def test_str_no_falla(self):
        a = CalificacionArrendatario.objects.create(propietario=self.prop, arrendatario=self.arr, puntuacion=4)
        p = CalificacionProveedor.objects.create(propietario=self.prop, proveedor=self.prov, puntuacion=2)
        self.assertIn('4/5', str(a))
        self.assertIn('2/5', str(p))

    def test_existe_restriccion_de_una_calificacion_por_contrato(self):
        # Con contrato NULL la base permite repetidos; la restriccion aplica cuando hay contrato.
        nombres = [c.name for c in CalificacionArrendatario._meta.constraints]
        self.assertIn('calificacion_arrendatario_unica_por_contrato', nombres)
