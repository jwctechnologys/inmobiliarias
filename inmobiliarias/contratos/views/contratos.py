"""Contratos de vivienda: consulta, detalle, edicion y baja."""
from datetime import date

from django.http import Http404
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from contratos.models import contrato_local_vivienda
from contratos.serializers import (
    ContratoDetalleSerializer,
    ContratoGeneralSerializer,
    ContratoInconformeSerializer,
    ContratoViviendaCreateSerializer,
    ContratoViviendaDetalleSerializer,
    ContratoViviendaListSerializer,
    ContratoViviendaSerializer,
    ContratoViviendaUpdateSerializer,
)
from inmuebles.models import arrendar
from solicitudes.models import Solicitud


class ContratoViviendaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar contratos de vivienda con datos inmutables
    """
    queryset = contrato_local_vivienda.objects.all().order_by('-creado_en')
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tipoContrato', 'contrato_Activo', 'estaFirmado', 'estaFirmadoArrendatario']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ContratoViviendaSerializer
        elif self.action == 'create':
            return ContratoViviendaCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ContratoViviendaUpdateSerializer
        return ContratoViviendaSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filtrar por tipo de contrato si se especifica
        tipo_contrato = self.request.query_params.get('tipoContrato')
        if tipo_contrato:
            queryset = queryset.filter(tipoContrato=tipo_contrato)
        
        # Filtrar por arrendatario (para que los arrendatarios vean sus contratos)
        arrendatario_id = self.request.query_params.get('arrendatario_id')
        if arrendatario_id:
            queryset = queryset.filter(arrendatario_id_original=arrendatario_id)
        
        # Filtrar por estado del contrato
        estado = self.request.query_params.get('estado')
        if estado:
            if estado == 'activo':
                queryset = queryset.filter(contrato_Activo=True, fechafin__gte=date.today())
            elif estado == 'vencido':
                queryset = queryset.filter(fechafin__lt=date.today())
            elif estado == 'inactivo':
                queryset = queryset.filter(contrato_Activo=False)
        
        return queryset

    def create(self, request, *args, **kwargs):
        """
        Crear un nuevo contrato con datos copiados (inmutables)
        """
        try:
            data = request.data
            print("=== CREANDO CONTRATO DE VIVIENDA ===")
            print(f"Datos recibidos: {data}")
            
            # Validar que los campos requeridos estén presentes
            campos_requeridos = [
                'arrendador_nombre_completo', 'arrendador_doc_identificacion',
                'arrendatario_nombre_completo', 'arrendatario_doc_identificacion',
                'inmueble_direccion', 'inmueble_matricula',
                'fechainicio', 'fechafin', 'canonArrendamiento'
            ]
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    return Response(
                        {'error': f'El campo {campo} es requerido'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Crear el contrato usando el serializer
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                contrato = serializer.save()
                
                # ACTUALIZAR SOLICITUDES DEL INMUEBLE
                self._actualizar_solicitudes(contrato)
                
                # Retornar respuesta con el contrato creado
                read_serializer = ContratoViviendaSerializer(contrato)
                return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(f"Errores de validación: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Error creando contrato: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error al crear contrato: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _actualizar_solicitudes(self, contrato):
        """
        Actualiza todas las solicitudes del inmueble cuando se crea un contrato
        """
        try:
            inmueble_id = contrato.inmueble_id_original
            if not inmueble_id:
                print("⚠️ No hay inmueble_id_original para actualizar solicitudes")
                return
            
            print(f"=== ACTUALIZANDO SOLICITUDES PARA INMUEBLE ID: {inmueble_id} ===")
            
            # Obtener todas las solicitudes del inmueble
            solicitudes = Solicitud.objects.filter(casa_id=inmueble_id)
            
            # Actualizar cada solicitud a cancelada
            for solicitud in solicitudes:
                solicitud.estado = 'cancelada'
                solicitud.solicitudRevisada = True
                solicitud.comentario_estado = f'Cancelado - Inmueble ocupado (Contrato #{contrato.id})'
                solicitud.save()
                print(f"✅ Solicitud #{solicitud.id} cancelada")
            
            # Si hay una solicitud específica, marcarla como contratada
            if contrato.solicitud_id:
                try:
                    solicitud_contratada = Solicitud.objects.get(id=contrato.solicitud_id)
                    solicitud_contratada.estado = 'contratada'
                    solicitud_contratada.solicitudContratada = True
                    solicitud_contratada.solicitudRevisada = True
                    solicitud_contratada.save()
                    print(f"✅ Solicitud #{contrato.solicitud_id} marcada como contratada")
                except Solicitud.DoesNotExist:
                    print(f"⚠️ Solicitud #{contrato.solicitud_id} no encontrada")
            
            # Actualizar el estado del inmueble
            try:
                inmueble = arrendar.objects.get(id=inmueble_id)
                inmueble.arrendada = True
                inmueble.publicar = False
                inmueble.save()
                print(f"✅ Inmueble #{inmueble_id} marcado como arrendado")
            except arrendar.DoesNotExist:
                print(f"⚠️ Inmueble #{inmueble_id} no encontrado")
                
        except Exception as e:
            print(f"❌ Error actualizando solicitudes: {str(e)}")
            import traceback
            traceback.print_exc()


class ContratosArrendatarioView(APIView):
    """
    Obtiene los contratos de un arrendatario específico
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, arrendatario_id):
        try:
            # Buscar contratos por el ID original del arrendatario
            contratos = contrato_local_vivienda.objects.filter(
                arrendatario_id_original=arrendatario_id,
                estaFirmado=True,
                estaFirmadoArrendatario=True
            )
            
            serializer = ContratoViviendaListSerializer(contratos, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"Error en ContratosArrendatarioView: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContratosActivosPorArrendatarioAPIView(APIView):
    """
    Obtiene los contratos activos de un arrendatario específico
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        arrendatario_id = request.query_params.get('arrendatario_id')
        
        if not arrendatario_id:
            return Response(
                {'error': 'El parámetro arrendatario_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            contratos = contrato_local_vivienda.objects.filter(
                contrato_Activo=True,
                estaFirmado=True,
                arrendatario_id_original=arrendatario_id
            ).values('id', 'tipoContrato', 'estaFirmadoArrendatario')
            
            return Response(contratos)
            
        except Exception as e:
            print(f"Error en ContratosActivosPorArrendatarioAPIView: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContratosActivosAPIView(APIView):
    """
    Obtiene todos los contratos activos
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            contratos_activos = contrato_local_vivienda.objects.filter(
                contrato_Activo=True
            )
            serializer = ContratoGeneralSerializer(contratos_activos, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error en ContratosActivosAPIView: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DetalleContratoAPIView(APIView):
    """
    Obtiene el detalle completo de un contrato
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            contrato = get_object_or_404(contrato_local_vivienda, pk=pk)
            serializer = ContratoViviendaDetalleSerializer(contrato)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error en DetalleContratoAPIView: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EliminarContratoAPIView(APIView):
    """
    Elimina un contrato (solo administradores)
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            # Verificar que el usuario sea administrador
            if not request.user.groups.filter(name='administrador').exists():
                return Response(
                    {'error': 'No tienes permisos para eliminar contratos'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            contrato = get_object_or_404(contrato_local_vivienda, pk=pk)
            contrato.delete()
            
            return Response(
                {'message': 'Contrato eliminado correctamente'},
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            print(f"Error en EliminarContratoAPIView: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContratoUpdateView(UpdateAPIView):
    """
    Actualiza un contrato existente (solo campos permitidos)
    """
    queryset = contrato_local_vivienda.objects.all()
    serializer_class = ContratoViviendaUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            return contrato_local_vivienda.objects.get(id=self.kwargs['id'])
        except contrato_local_vivienda.DoesNotExist:
            raise Http404("Contrato no encontrado")

    def perform_update(self, serializer):
        instance = serializer.save()
        print(f"✅ Contrato #{instance.id} actualizado correctamente")
        return instance


class ContratoDetalleView(APIView):
    """
    Obtiene detalles del contrato para el frontend
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            contrato = get_object_or_404(contrato_local_vivienda, pk=pk)
            serializer = ContratoDetalleSerializer(contrato)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error en ContratoDetalleView: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContratosInconformesView(ListAPIView):
    """
    Lista contratos con inconformidades pendientes
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ContratoInconformeSerializer

    def get_queryset(self):
        return contrato_local_vivienda.objects.filter(
            reporteinconformidad__estaInconforme=True,
            reporteinconformidad__inconformidadSolucionada=False,
        )
