from rest_framework import viewsets, permissions, status
from inicio.models import *
from inicio.api.serializadores.serializararrendar import Imagen_casa_arrendar_Serializar
from rest_framework.decorators import action
from rest_framework.response import Response


class arriendoViewSet(viewsets.ModelViewSet):
    queryset= Imagen_casa_arrendar.objects.all()
    permissions_classes=[permissions.AllowAny]
    serializer_class=Imagen_casa_arrendar_Serializar
