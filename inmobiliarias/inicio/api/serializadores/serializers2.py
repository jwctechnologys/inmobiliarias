from rest_framework import serializers
from .models import *
from usuarios.models import *

class Imagen_casa_arrendar_Serializar(serializers.ModelSerializer):
    class Meta:
        model = Imagen_casa_arrendar
        fields =('id','imagen' )


class inicioSerializar(serializers.ModelSerializer):
    imagen = Imagen_casa_arrendar_Serializar(read_only=True)
    imagenId = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Imagen_casa_arrendar.objects.all(), source='owner')   
            
    class Meta:
        model = arrendar
        fields = ('id', 'imagen', 'imagenId', 'propietario','direccion','descripcion', 'con_administracion', 'canonmensual', 'observacion_canonmensual', 'deposito', 'observacion_deposito', 'sala', 'observacion_sala', 'comedor', 'observacion_comedor', 
                  'cocina', 'observacion_cocina', 'habitaciones', 'observacion_habitaciones', 'baños', 'observacion_baños', 'patio', 'observacion_patio', 'garage', 'observacion_garage', 'tanquesubterraneo', 'observacion_tanquesubterraneo', 
                  'ser_agua', 'observacion_ser_agua', 'ser_energia', 'observacion_ser_energia', 'ser_gas_domiciliario', 'observacion_ser_gas_domiciliario', 'ser_bioagricola', 'observacion_ser_bioagricola', 'otros','fotoPrincipal') #, 'fotoCasa', 'publicar'
        read_only_field= ('id')
        
        
from rest_framework import serializers
from .models import *
from usuarios.models import *


class inicioSerializar(serializers.ModelSerializer):
            
    class Meta:
        model = arrendar
        fields = ('id', 'propietario','direccion','descripcion', 'con_administracion', 'canonmensual', 'observacion_canonmensual', 'deposito', 'observacion_deposito', 'sala', 'observacion_sala', 'comedor', 'observacion_comedor', 
                  'cocina', 'observacion_cocina', 'habitaciones', 'observacion_habitaciones', 'baños', 'observacion_baños', 'patio', 'observacion_patio', 'garage', 'observacion_garage', 'tanquesubterraneo', 'observacion_tanquesubterraneo', 
                  'ser_agua', 'observacion_ser_agua', 'ser_energia', 'observacion_ser_energia', 'ser_gas_domiciliario', 'observacion_ser_gas_domiciliario', 'ser_bioagricola', 'observacion_ser_bioagricola', 'otros','fotoPrincipal') #, 'fotoCasa', 'publicar'
        read_only_field= ('id')
        
        
from rest_framework import serializers
from ...models import *
from usuarios.models import *

class Imagen_casa_arrendar_Serializar(serializers.ModelSerializer):
    class Meta:
        model = Imagen_casa_arrendar
        fields = '__all__'
    def to_representation (self, instance):
        return{
            'id': instance.id,
            'id': getattr(instance.arrendar, 'id', None),
            'imagen': instance.imagen if instance.imagen !='' else '',
            
        }