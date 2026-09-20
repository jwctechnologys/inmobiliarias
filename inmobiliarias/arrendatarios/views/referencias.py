"""Referencias del arrendatario."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from arrendatarios.models import referencias
from arrendatarios.serializers import referenciasSerializer
from usuarios.models import arrendatario


@api_view(["POST"])
def create_referencias(request):
    # Obtener el ID del arrendatario desde la solicitud
    arrendatario_id = request.data.get("arrendatario")

    # Validar que el ID esté presente
    if not arrendatario_id:
        return Response(
            {"error": "El campo 'arrendatario' es obligatorio."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Obtener el objeto Arrendatario (usamos el ID recibido)
    arrendatario_obj = get_object_or_404(arrendatario, id=arrendatario_id)

    # Crear una copia de los datos y asignar el objeto arrendatario
    data = request.data.copy()
    data["arrendatario"] = arrendatario_obj.id  # Aquí asignamos el objeto completo
    print("lo que se va a guardar", data)
    # Serializar y guardar
    serializer = referenciasSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Retornar errores de validación
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def listar_referencias(request):
    try:
        # Obtener el parámetro 'arrendatarioID' de la consulta
        arrendatario_id = request.query_params.get("arrendatarioID")
        
        print(f"=== listar_referencias - arrendatarioID recibido: {arrendatario_id} ===")
        
        # Filtrar referencias por arrendatario si se proporciona el parámetro
        if arrendatario_id:
            try:
                arrendatario_id = int(arrendatario_id)
                referencias_qs = referencias.objects.filter(arrendatario_id=arrendatario_id)
            except ValueError:
                return Response({"error": "arrendatarioID debe ser un número válido"}, status=400)
        else:
            referencias_qs = referencias.objects.all()
        
        # Formatear los datos para la respuesta - SOLO CAMPOS QUE EXISTEN
        data = []
        for ref in referencias_qs:
            data.append({
                "id": ref.id,
                "first_name": ref.first_name or "",
                "last_name": ref.last_name or "",
                "parentezco": ref.parentezco or "",
                "celular": ref.celular or "",
                "dir_residencia": ref.dir_residencia or "",
                "ocupacion": ref.ocupacion or "",
                # "empresa" NO existe en el modelo - lo omitimos
                # "barrio" tampoco existe en el modelo - lo omitimos
            })
        
        return Response(data, status=200)
        
    except Exception as e:
        print(f"Error en listar_referencias: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(["PUT"])
def update_referencias(request, pk):
    # Obtener el objeto coarrendatario por su ID

    referencia_obj = get_object_or_404(referencias, id=pk)

    # Crear una copia de los datos de la solicitud
    data = request.data.copy()

    # Si el arrendatario se envía en los datos, validarlo
    arrendatario_id = data.get("arrendatarioId")
    if arrendatario_id:
        arrendatario_obj = get_object_or_404(arrendatario, id=arrendatario_id)
        data["arrendatario"] = arrendatario_obj.id  # Asegurarse de que sea un ID válido

    # Serializar y actualizar el objeto coarrendatario
    serializer = referenciasSerializer(referencia_obj, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        print("Errores del serializer:", serializer.errors)  # Imprimir errores
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
