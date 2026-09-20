from rest_framework import serializers
from ...models import *
from usuarios.models import *


class Imagen_casa_arrendar_Serializar(serializers.ModelSerializer):
    class Meta:
        model = Imagen_casa_arrendar
        fields = '__all__'
        #depth = 2
    
