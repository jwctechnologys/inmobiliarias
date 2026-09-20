"""Coarrendatarios (codeudores) del arrendatario."""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from arrendatarios.models import coarrendatario
from arrendatarios.serializers import coarrendatarioSerializer
from usuarios.models import arrendatario


@api_view(["GET"])
def listar_coarrendatarios(request):
    try:
        # Obtener el parámetro 'arrendatario_id' de la consulta
        arrendatario_id = request.query_params.get("arrendatario_id")

        # Filtrar los coarrendatarios por arrendatario si se proporciona el parámetro
        if arrendatario_id:
            coarrendatarios = coarrendatario.objects.filter(
                arrendatario_id=arrendatario_id
            )
        else:
            coarrendatarios = coarrendatario.objects.all()

        # Formatear los datos para la respuesta
        data = [
            {
                "id": coarrendatario.id,
                "first_name": coarrendatario.first_name,
                "last_name": coarrendatario.last_name,
                "direccion": coarrendatario.direccion,
                "barrio": coarrendatario.barrio,
                "ciudad": coarrendatario.ciudad,
                "genero": coarrendatario.genero,
                "parentezco": coarrendatario.parentezco,
                "tipo_documento": coarrendatario.tipo_documento,
                "n_cedula": coarrendatario.doc_identificacion,
                "c_exp": coarrendatario.lugarExpCedula,
                "celular": coarrendatario.celular,
                "direccionCorrespondencia": coarrendatario.direccionCorrespondencia,
                "barrioCorrespondencia": coarrendatario.barrioCorrespondencia,
                "ciudadCorrespondencia": coarrendatario.ciudadCorrespondencia,
                "ingresosMensualesTotales": coarrendatario.ingresosMensualesTotales,
                "email": coarrendatario.email,
                "ocupacion": coarrendatario.ocupacion,
                "empresa": coarrendatario.empresa,
            }
            for coarrendatario in coarrendatarios
        ]
        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def create_coarrendatario(request):
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
    serializer = coarrendatarioSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Retornar errores de validación
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
def update_coarrendatario(request, pk):
    # Obtener el objeto coarrendatario por su ID
    coarrendatario_obj = get_object_or_404(coarrendatario, id=pk)

    # Crear una copia de los datos de la solicitud
    data = request.data.copy()

    # Si el arrendatario se envía en los datos, validarlo
    arrendatario_id = data.get("arrendatarioId")
    if arrendatario_id:
        arrendatario_obj = get_object_or_404(arrendatario, id=arrendatario_id)
        data["arrendatario"] = arrendatario_obj.id  # Asegurarse de que sea un ID válido

    # Serializar y actualizar el objeto coarrendatario
    serializer = coarrendatarioSerializer(coarrendatario_obj, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        print("Errores del serializer:", serializer.errors)  # Imprimir errores
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
