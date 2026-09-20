from rest_framework import viewsets, permissions, status
from inicio.models import *
from inicio.api.serializadores.serializers import inicioSerializar
from rest_framework.decorators import action
from rest_framework.response import Response


class inicioViewSet(viewsets.ModelViewSet):
    queryset= arrendar.objects.all()
    permissions_classes=[permissions.AllowAny]
    serializer_class=inicioSerializar
    

 #   @action(detail=True, methods=['post'])
 #   def publicar (self, request, pk=None):
 #       casa = self.get_object()
 #       casa.publicar = not casa.publicar
 #       casa.save()
 #       return Response ({
 #           'status': 'casa publicada' if casa.publicar else 'casa no publicada'
 #       }, status.HTTP_200_OK)
        
        
        
