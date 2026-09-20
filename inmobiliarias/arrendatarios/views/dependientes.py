"""Personas dependientes del arrendatario."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from arrendatarios.models import dependientes
from arrendatarios.serializers import dependientesSerializer
from usuarios.models import arrendatario


@api_view(["POST"])
def create_dependientes(request):
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
    # Extraer y asignar las variables del request
    data["first_name"] = request.data.get("first_name", "")
    data["last_name"] = request.data.get("last_name", "")
    data["edad"] = request.data.get("edad", None)
    data["ocupacion"] = request.data.get("ocupacion", "")
    data["empresa"] = request.data.get("empresa", "")
    data["parentezco"] = request.data.get("parentezco", "")
    data["tipo_documento"] = request.data.get("tipo_documento", "")

    # Validar y asignar doc_identificacion como entero
    try:
        data["doc_identificacion"] = int(request.data.get("doc_identificacion", None))
    except (TypeError, ValueError):
        data["doc_identificacion"] = None

    data["lugarExpCedula"] = request.data.get("lugarExpCedula", "")
    data["genero"] = request.data.get("genero", "")

    print("lo que se va a guardar", data)
    # Serializar y guardar
    serializer = dependientesSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print("Errores de validación:", serializer.errors)
    # Retornar errores de validación
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_dependientes_por_arrendatario(request, arrendatario_id):
    dependientes_data = dependientes.objects.filter(arrendatario_id=arrendatario_id)
    resultado = []

    for dependiente in dependientes_data:
        descripcion = ""
        # Formatear el número de identificación con puntos
        numero_id_formateado = f"{dependiente.doc_identificacion:,}".replace(",", ".")
        # Incluir el nombre en negritas
        nombre_negrita = (
            f"<strong>{dependiente.first_name} {dependiente.last_name}</strong>"
        )

        # Verificar si el dependiente es mayor o menor de edad
        if dependiente.edad and dependiente.edad < 18:
            descripcion += f"y su {dependiente.parentezco} {nombre_negrita} de {dependiente.edad} años de edad"
            if dependiente.ocupacion:
                descripcion += f", quien es {dependiente.ocupacion}"
        else:
            descripcion += f"y su {dependiente.parentezco} {nombre_negrita} identificado con <strong>{dependiente.tipo_documento}</strong> Nro <strong>{numero_id_formateado}</strong> expedida en {dependiente.lugarExpCedula}"
            if dependiente.ocupacion and dependiente.empresa:
                descripcion += (
                    f", y de ocupación {dependiente.ocupacion} ({dependiente.empresa})"
                )

        resultado.append(descripcion)

    # Unir las descripciones con una coma y espacio, pero sin coma final
    descripcion_final = ", ".join(resultado)

    return Response({"descripcion": descripcion_final})


@api_view(["PUT"])
def update_dependiente(request, pk):
    # Obtener el objeto coarrendatario por su ID

    dependiente_obj = get_object_or_404(dependientes, id=pk)

    # Crear una copia de los datos de la solicitud
    data = request.data.copy()

    # Si el arrendatario se envía en los datos, validarlo
    arrendatario_id = data.get("arrendatarioId")
    if arrendatario_id:
        arrendatario_obj = get_object_or_404(arrendatario, id=arrendatario_id)
        data["arrendatario"] = arrendatario_obj.id  # Asegurarse de que sea un ID válido

    # Serializar y actualizar el objeto coarrendatario
    serializer = dependientesSerializer(dependiente_obj, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        print("Errores del serializer:", serializer.errors)  # Imprimir errores
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def listar_dependientes(request):
    try:
        # Obtener el parámetro 'arrendatarioID' de la consulta
        arrendatario_id = request.query_params.get("arrendatarioID")
        
        print(f"=== listar_dependientes - arrendatarioID recibido: {arrendatario_id} ===")
        
        # Filtrar dependientes por arrendatario si se proporciona el parámetro
        if arrendatario_id:
            try:
                arrendatario_id = int(arrendatario_id)
                dependientes_qs = dependientes.objects.filter(arrendatario_id=arrendatario_id)
            except ValueError:
                return Response({"error": "arrendatarioID debe ser un número válido"}, status=400)
        else:
            dependientes_qs = dependientes.objects.all()
        
        # Formatear los datos para la respuesta - SOLO CAMPOS QUE EXISTEN EN EL MODELO
        data = []
        for dep in dependientes_qs:
            data.append({
                "id": dep.id,
                "first_name": dep.first_name or "",
                "last_name": dep.last_name or "",
                "edad": dep.edad or "",
                "tipo_documento": dep.tipo_documento or "",
                "doc_identificacion": dep.doc_identificacion or "",
                "lugarExpCedula": dep.lugarExpCedula or "",
                "ocupacion": dep.ocupacion or "",
                "parentezco": dep.parentezco or "",
            })
        
        return Response(data, status=200)
        
    except Exception as e:
        print(f"Error en listar_dependientes: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
