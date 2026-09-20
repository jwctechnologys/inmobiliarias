"""Aplicar, listar, aceptar y rechazar solicitudes."""

from django.db.models import F
from django.views.decorators.csrf import csrf_exempt
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from inmuebles.models import arrendar
from solicitudes.models import Solicitud
from solicitudes.serializers import SolicitudSerializer
from usuarios.models import arrendatario


@api_view(["POST"])
def aplicar_a_casa(request, casa_id):
    print("Datos del usuario autenticado:", request.user)  # Ver el usuario autenticado
    print("Datos de la solicitud:", request.data)  # Ver los datos de la solicitud
    # Verificar que el usuario esté autenticado
    if not request.user.is_authenticated:
        return Response({"error": "No autenticado."}, status=401)

    try:
        casa = arrendar.objects.get(id=casa_id)
    except arrendar.DoesNotExist:
        return Response({"error": "Casa no encontrada."}, status=404)

    # Verificar si la casa ya está arrendada
    if casa.arrendada:
        return Response({"error": "La casa ya está arrendada."}, status=400)

    # Verificar si hay menos de 4 solicitudes
   # if casa.solicitudes.count() >= 4:
    #    return Response({"error": "Ya hay 4 solicitudes para esta casa."}, status=400)

    # Verificar que el usuario sea un arrendatario
    try:
        usuario = arrendatario.objects.get(user=request.user)
    except arrendatario.DoesNotExist:
        return Response({"error": "El usuario no es un arrendatario."}, status=400)

    # Crear la solicitud
    solicitud, created = Solicitud.objects.get_or_create(casa=casa, usuario=usuario)

    if not created:
        return Response({"message": "Ya has aplicado para esta casa."})

    return Response({"message": "Tu solicitud ha sido registrada exitosamente. Pronto te contactaremos."})


@api_view(["GET"])
def contar_solicitudes_pendientes(request):
    # Contar las solicitudes con estado 'pendiente'
    solicitudes_pendientes = Solicitud.objects.filter(estado="pendiente").count()
    return Response({"solicitudes_pendientes": solicitudes_pendientes})


@api_view(['GET'])
def obtener_solicitudes_pendientes(request):
    # Obtener todas las solicitudes pendientes
    solicitudes = Solicitud.objects.filter(estado='pendiente')  # Suponiendo que 'estado' es un campo que indica el estado de la solicitud
    solicitudes_serializer = SolicitudSerializer(solicitudes, many=True)

    return Response(solicitudes_serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def aceptar_solicitud(request, solicitud_id):
    try:
        solicitud = Solicitud.objects.get(id=solicitud_id)
    except Solicitud.DoesNotExist:
        return Response({"error": "Solicitud no encontrada."}, status=404)

    solicitud.estado = "aceptada"
    solicitud.save()
    return Response({"success": True, "message": "Solicitud aceptada."})


@api_view(["POST"])
def rechazar_solicitud(request, solicitud_id):
    try:
        solicitud = Solicitud.objects.get(id=solicitud_id)
    except Solicitud.DoesNotExist:
        return Response({"error": "Solicitud no encontrada."}, status=404)

    solicitud.estado = "rechazada"
    solicitud.save()
    return Response({"success": True, "message": "Solicitud rechazada."})


@api_view(["GET"])
@permission_classes([AllowAny])
def obtener_solicitudes_aceptadas(request):
    solicitudes_aceptadas = Solicitud.objects.filter(estado="aceptada")  # O según el campo que uses para indicar aceptación
    serializer = SolicitudSerializer(solicitudes_aceptadas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def solicitudes_aceptadas_no_atendidas(request):
    """
    Retorna el número de solicitudes aceptadas que no han sido atendidas
    """
    try:
        count = Solicitud.objects.filter(
            estado='aceptada',
            solicitudAtendida=True,
            solicitudContratada=False
        ).count()
        
        return Response({
            'total': count,
            'mensaje': f'Hay {count} solicitud(es) aceptada(s) pendiente(s) de crear contrato'
        })
        
    except Exception as e:
        print(f"Error en solicitudes_aceptadas_no_atendidas: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def obtener_solicitudes_pendientes_arrendatario(request, arrendatario_id):
    """Obtiene el número de solicitudes pendientes de un arrendatario específico"""
    try:
                
        print(f"=== Buscando solicitudes para arrendatario_id: {arrendatario_id} ===")
        
        # Verificar si el arrendatario existe
        try:
            arrendatario_obj = arrendatario.objects.get(id=arrendatario_id)
            print(f"Arrendatario encontrado: {arrendatario_obj.user.username}")
        except arrendatario.DoesNotExist:
            print(f"Arrendatario con ID {arrendatario_id} no existe")
            return Response({
                'solicitudes_pendientes': 0,
                'mensaje': 'Arrendatario no encontrado'
            }, status=status.HTTP_200_OK)
        
        # Contar solicitudes pendientes
        count = Solicitud.objects.filter(
            usuario_id=arrendatario_id,  # usuario es la FK al modelo arrendatario
            estado='pendiente'
        ).count()
        
        print(f"Solicitudes pendientes encontradas: {count}")
        
        return Response({
            'solicitudes_pendientes': count,
            'mensaje': f'Tienes {count} solicitud(es) pendiente(s)'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error detallado: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e),
            'solicitudes_pendientes': 0
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def verificar_solicitud(request):
    """
    Verifica si un usuario ya ha hecho solicitudes para una casa específica
    Retorna todas las solicitudes activas (no rechazadas)
    """
    casa_id = request.query_params.get('casa')
    usuario_id = request.query_params.get('usuario')
    
    if not casa_id or not usuario_id:
        return Response(
            {'error': 'Parámetros incompletos. Se requiere casa y usuario.'}, 
            status=400
        )
    
    try:
        # Obtener todas las solicitudes para esta casa y usuario (excluyendo rechazadas)
        solicitudes = Solicitud.objects.filter(
            casa_id=casa_id,
            usuario_id=usuario_id
        ).exclude(estado='rechazada')
        
        # Verificar si existe alguna solicitud pendiente o aceptada
        tiene_pendiente = solicitudes.filter(estado='pendiente').exists()
        tiene_aceptada = solicitudes.filter(estado='aceptada').exists()
        tiene_cancelada = solicitudes.filter(estado='cancelada').exists()
        
        # Obtener la solicitud pendiente o aceptada si existe (prioridad: pendiente > aceptada)
        solicitud_activa = None
        if tiene_pendiente:
            solicitud_activa = solicitudes.filter(estado='pendiente').first()
        elif tiene_aceptada:
            solicitud_activa = solicitudes.filter(estado='aceptada').first()
        
        # Serializar todas las solicitudes
        solicitudes_data = []
        for solicitud in solicitudes:
            solicitudes_data.append({
                'id': solicitud.id,
                'estado': solicitud.estado,
                'solicitudRevisada': solicitud.solicitudRevisada,  # Asegúrate que el campo existe
                'fecha_creacion': solicitud.fecha.isoformat() if solicitud.fecha else None
            })
        
        return Response({
            'existe': solicitudes.exists(),
            'tiene_pendiente': tiene_pendiente,
            'tiene_aceptada': tiene_aceptada,
            'tiene_cancelada': tiene_cancelada,
            'solicitudes': solicitudes_data,
            'solicitud_activa': {
                'id': solicitud_activa.id if solicitud_activa else None,
                'estado': solicitud_activa.estado if solicitud_activa else None
            } if solicitud_activa else None
        })
    except Exception as e:
        print(f"Error en verificar_solicitud: {str(e)}")  # Para debugging
        return Response(
            {'error': f'Error al verificar solicitudes: {str(e)}'}, 
            status=500
        )


class SolicitudListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario_id = request.GET.get('usuario')
        casa_id = request.GET.get('casa')

        solicitudes = Solicitud.objects.select_related('usuario', 'casa').all()

        # Filtros dinámicos
        if usuario_id:
            solicitudes = solicitudes.filter(usuario_id=usuario_id)

        if casa_id:
            solicitudes = solicitudes.filter(casa_id=casa_id)

        # Serialización manual (para control total)
        data = solicitudes.annotate(
            usuario_nombre=F('usuario__username'),
            casa_nombre=F('casa__nombre')
        ).values(
            'id',
            'titulo',
            'descripcion',
            'estado',
            'fecha_creacion',
            'usuario_nombre',
            'casa_nombre'
        )

        return Response(list(data))


class SolicitudViewSet(ModelViewSet):
    queryset = Solicitud.objects.select_related('usuario', 'casa').all()
    serializer_class = SolicitudSerializer
   # permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['usuario', 'casa', 'estado']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # ⚠️ Opcional: filtrar por rol SIN romper tu sistema actual
        if user.groups.filter(name='arrendatario').exists():
            return queryset.filter(usuario__user=user)

        elif user.groups.filter(name='propietario').exists():
            return queryset.filter(casa__propietario__user=user)

        # admin ve todo
        return queryset
    @action(detail=True, methods=['put'])
    def cambiar_estado(self, request, pk=None):
        try:
            # Obtener la solicitud por ID
            solicitud = self.get_object()
            
            # Verificar que la solicitud existe
            print(f"Solicitud encontrada: ID {solicitud.id}")
            print(f"Casa asociada: {solicitud.casa}")  # Esto debería mostrar la casa
            print(f"ID de la casa: {solicitud.casa.id}")
            
            nuevo_estado = request.data.get('estado')
            comentario = request.data.get('comentario', '')
            
            print(f"Nuevo estado: {nuevo_estado}")
            print(f"Comentario: {comentario}")
            
            if nuevo_estado not in ['aceptada', 'rechazada', 'cancelada']:
                return Response({'error': 'Estado inválido'}, status=400)
            
            # Si se acepta la solicitud
            if nuevo_estado == 'aceptada':
                # Obtener la casa a través de la solicitud
                casa = solicitud.casa
                
                print(f"Casa antes de actualizar - solicitudAceptada: {casa.solicitudAceptada}, publicar: {casa.publicar}")
                
                # Actualizar los campos de la casa
                casa.solicitudAceptada = True
                casa.publicar = False
                casa.save()
                
                print(f"Casa después de actualizar - solicitudAceptada: {casa.solicitudAceptada}, publicar: {casa.publicar}")
            
            # Actualizar solicitud
            solicitud.estado = nuevo_estado
            solicitud.comentario_estado = comentario
            solicitud.solicitudAtendida = True
            solicitud.save()
            
            print("Solicitud actualizada correctamente")
            
            return Response({
                'mensaje': 'Estado actualizado correctamente',
                'solicitud_id': solicitud.id,
                'nuevo_estado': nuevo_estado
            })
        
        except Exception as e:
            import traceback
            print(f"Error detallado: {traceback.format_exc()}")
            return Response(
                {'error': str(e), 'detalle': traceback.format_exc()},
                status=500
            )
