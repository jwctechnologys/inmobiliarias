"""Declaraciones de ingresos del arrendatario."""

from rest_framework.decorators import api_view
from rest_framework.response import Response

from arrendatarios.models import declaracion_ingresos
from usuarios.models import arrendatario


@api_view(['GET'])
def listar_declaraciones_ingresos(request):
    """Lista las declaraciones de ingresos de un arrendatario"""
    try:
        arrendatario_id = request.query_params.get("arrendatario_id")
        
        print(f"=== listar_declaraciones_ingresos - arrendatario_id: {arrendatario_id} ===")
        
        if not arrendatario_id:
            return Response({"error": "Se requiere arrendatario_id"}, status=400)
        
        try:
            arrendatario_id = int(arrendatario_id)
            declaraciones = declaracion_ingresos.objects.filter(usuario_id=arrendatario_id)
        except ValueError:
            return Response({"error": "arrendatario_id debe ser un número válido"}, status=400)
        
        data = []
        for dec in declaraciones:
            data.append({
                "id": dec.id,
                "tipoContrato": dec.tipoContrato or "",
                "jefeInmediato": dec.jefeInmediato or "",
                "tiempoLaboral": dec.tiempoLaboral or "",
                "salarioBasicoMensual": dec.salarioBasicoMensual or "",
                "otrosIngresos": dec.otrosIngresos or "",
                "telefonoEmpresa": dec.telefonoEmpresa or "",
                "direccion_laboral": dec.direccion_laboral or "",
                "declaraRenta": dec.declaraRenta,
                "empresa": getattr(dec.usuario, 'empresa', '') or "",
                "ocupacion": getattr(dec.usuario, 'ocupacion', '') or "",
                "fecha_creacion": dec.fecha_creacion.strftime('%Y-%m-%d') if dec.fecha_creacion else "",
            })
        
        return Response(data, status=200)
        
    except Exception as e:
        print(f"Error en listar_declaraciones_ingresos: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def crear_declaracion_ingresos(request):
    """Crea una nueva declaración de ingresos"""
    try:
        data = request.data
        
        # Validar campos requeridos
        if not data.get('usuario'):
            return Response({"error": "El campo 'usuario' es obligatorio"}, status=400)
        
        # Obtener el arrendatario
        try:
            usuario = arrendatario.objects.get(id=data.get('usuario'))
        except arrendatario.DoesNotExist:
            return Response({"error": "Arrendatario no encontrado"}, status=404)
        
        # Crear la declaración
        declaracion = declaracion_ingresos.objects.create(
            usuario=usuario,
            tipoContrato=data.get('tipoContrato', ''),
            jefeInmediato=data.get('jefeInmediato', ''),
            tiempoLaboral=data.get('tiempoLaboral', ''),
            salarioBasicoMensual=data.get('salarioBasicoMensual', ''),
            otrosIngresos=data.get('otrosIngresos', ''),
            telefonoEmpresa=data.get('telefonoEmpresa', ''),
            direccion_laboral=data.get('direccion_laboral', ''),
            declaraRenta=data.get('declaraRenta', False)
        )
        
        return Response({
            "id": declaracion.id,
            "tipoContrato": declaracion.tipoContrato or "",
            "jefeInmediato": declaracion.jefeInmediato or "",
            "tiempoLaboral": declaracion.tiempoLaboral or "",
            "salarioBasicoMensual": declaracion.salarioBasicoMensual or "",
            "otrosIngresos": declaracion.otrosIngresos or "",
            "telefonoEmpresa": declaracion.telefonoEmpresa or "",
            "direccion_laboral": declaracion.direccion_laboral or "",
            "declaraRenta": declaracion.declaraRenta,
            "fecha_creacion": declaracion.fecha_creacion.strftime('%Y-%m-%d') if declaracion.fecha_creacion else "",
        }, status=201)
        
    except Exception as e:
        print(f"Error en crear_declaracion_ingresos: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(['PUT'])
def actualizar_declaracion_ingresos(request, pk):
    """Actualiza una declaración de ingresos existente"""
    try:
        # Obtener la declaración
        try:
            declaracion = declaracion_ingresos.objects.get(id=pk)
        except declaracion_ingresos.DoesNotExist:
            return Response({"error": "Declaración de ingresos no encontrada"}, status=404)
        
        data = request.data
        
        # Actualizar campos
        declaracion.tipoContrato = data.get('tipoContrato', declaracion.tipoContrato)
        declaracion.jefeInmediato = data.get('jefeInmediato', declaracion.jefeInmediato)
        declaracion.tiempoLaboral = data.get('tiempoLaboral', declaracion.tiempoLaboral)
        declaracion.salarioBasicoMensual = data.get('salarioBasicoMensual', declaracion.salarioBasicoMensual)
        declaracion.otrosIngresos = data.get('otrosIngresos', declaracion.otrosIngresos)
        declaracion.telefonoEmpresa = data.get('telefonoEmpresa', declaracion.telefonoEmpresa)
        declaracion.direccion_laboral = data.get('direccion_laboral', declaracion.direccion_laboral)
        declaracion.declaraRenta = data.get('declaraRenta', declaracion.declaraRenta)
        
        declaracion.save()
        
        return Response({
            "id": declaracion.id,
            "tipoContrato": declaracion.tipoContrato or "",
            "jefeInmediato": declaracion.jefeInmediato or "",
            "tiempoLaboral": declaracion.tiempoLaboral or "",
            "salarioBasicoMensual": declaracion.salarioBasicoMensual or "",
            "otrosIngresos": declaracion.otrosIngresos or "",
            "telefonoEmpresa": declaracion.telefonoEmpresa or "",
            "direccion_laboral": declaracion.direccion_laboral or "",
            "declaraRenta": declaracion.declaraRenta,
            "fecha_creacion": declaracion.fecha_creacion.strftime('%Y-%m-%d') if declaracion.fecha_creacion else "",
        }, status=200)
        
    except Exception as e:
        print(f"Error en actualizar_declaracion_ingresos: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(['DELETE'])
def eliminar_declaracion_ingresos(request, pk):
    """Elimina una declaración de ingresos"""
    try:
        declaracion = declaracion_ingresos.objects.get(id=pk)
        declaracion.delete()
        return Response({"message": "Declaración eliminada exitosamente"}, status=200)
    except declaracion_ingresos.DoesNotExist:
        return Response({"error": "Declaración de ingresos no encontrada"}, status=404)
    except Exception as e:
        print(f"Error en eliminar_declaracion_ingresos: {e}")
        return Response({"error": str(e)}, status=500)
