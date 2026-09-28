"""Campos opcionales que llegan vacios.

Un formulario web manda "" cuando se deja un campo vacio. Para un campo de texto no hay problema, pero un
campo numerico, de fecha o de relacion no acepta "": el servidor respondia 400 ("A valid integer is
required") o 500 ("Field '...' expected a number but got ''"). Aqui "" pasa a None solo en los campos
que admiten NULL y no son de texto; el resto se deja tal cual para que la validacion normal decida.
"""
from django.db import models
from rest_framework import serializers

# Campos de Django que no son de texto ni de verdadero/falso.
_TIPOS_NO_TEXTO = (
    models.IntegerField, models.FloatField, models.DecimalField,
    models.DateField, models.TimeField, models.DateTimeField,  # DateTimeField ya hereda de DateField
    models.ForeignKey,
)


def vacios_a_none(modelo, datos):
    """Copia de `datos` (dict) donde "" pasa a None en los campos de `modelo` que admiten NULL y no son de texto."""
    limpios = dict(datos)
    for campo in modelo._meta.get_fields():
        if not isinstance(campo, _TIPOS_NO_TEXTO) or not getattr(campo, "null", False):
            continue
        for clave in (campo.name, getattr(campo, "attname", None)):
            if clave in limpios and isinstance(limpios[clave], str) and not limpios[clave].strip():
                limpios[clave] = None
    return limpios


class VaciosANoneMixin:
    """Para ModelSerializer: "" en un campo numerico/fecha/relacion opcional se trata como "sin valor".

    Funciona tanto con datos JSON (un dict comun) como con datos de un formulario multipart (un
    QueryDict, para peticiones con archivos): un QueryDict TAMBIEN es un dict, asi que hay que
    tener cuidado al copiarlo. dict(un_querydict) rompe todos sus valores (cada uno queda envuelto
    en una lista de un elemento, porque por dentro un QueryDict guarda listas) y por eso antes esto
    tumbaba cualquier serializador con este mixin que recibiera un formulario multipart (ej. un
    reporte de novedades con fotos, o una casa con foto principal). data.copy() evita el problema:
    da una copia mutable conservando el tipo real (QueryDict o dict).
    """

    _TIPOS_SERIALIZADOR = (
        serializers.IntegerField, serializers.FloatField, serializers.DecimalField,
        serializers.DateField, serializers.DateTimeField, serializers.TimeField,
        serializers.PrimaryKeyRelatedField,
    )

    def to_internal_value(self, data):
        if isinstance(data, dict):
            datos = data.copy()
            for nombre, campo in self.fields.items():
                valor = datos.get(nombre)
                if (
                    campo.allow_null and not campo.read_only
                    and isinstance(campo, self._TIPOS_SERIALIZADOR)
                    and isinstance(valor, str) and not valor.strip()
                ):
                    datos[nombre] = None
            data = datos
        return super().to_internal_value(data)
