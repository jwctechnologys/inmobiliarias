"""Perfil del usuario y listados por rol."""
import json

from django.contrib.auth.models import Group
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from arrendatarios.models import coarrendatario
from usuarios.models import User, administrador, arrendatario, propietario, proveedor
from usuarios.serializers import ArrendatarioSerializer, administradorSerializer
from usuarios.views.auth import entero_o_none


@csrf_protect
def user_profile_update_view(request):
    if request.method == "PUT":
        try:
            # Parsear los datos de la solicitud
            data = json.loads(request.body)

            group = data.get("groups")
            group_id = data.get("id")

            if not group or not group_id:
                return JsonResponse(
                    {"error": "Grupo o ID del grupo no proporcionados."}, status=400
                )

            # Buscar el usuario por su ID
            try:
                user_to_update = User.objects.get(id=group_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "Usuario no encontrado."}, status=404)

            # Verificar el grupo y buscar al usuario correspondiente
            if group == "administrador":
                try:
                    perfil_to_update = administrador.objects.get(id=group_id)
                except administrador.DoesNotExist:
                    return JsonResponse(
                        {"error": "Administrador no encontrado."}, status=404
                    )
                
                allowed_fields = {
                    "genero", "tipo_documento", "doc_identificacion", "lugarExpCedula",
                    "direccionCorrespondencia", "barrioCorrespondencia", "ciudadCorrespondencia",
                    "cuentaDaviplata", "cuentaNequi", "CuentaBancolombia",
                    "direccion", "barrio", "ciudad", "celular", "celularDos",
                }

            elif group == "arrendatario":
                try:
                    perfil_to_update = arrendatario.objects.get(id=group_id)
                except arrendatario.DoesNotExist:
                    return JsonResponse(
                        {"error": "Arrendatario no encontrado."}, status=404
                    )
                
                allowed_fields = {
                    "genero", "tipo_documento", "doc_identificacion", "lugarExpCedula",
                    "ocupacion", "estadoCivil", "empresa", "CodClasificaIndustrialIU",
                    "descActividadEconomica", "direccion", "barrio", "ciudad",
                    "direccionCorrespondencia", "barrioCorrespondencia", "ciudadCorrespondencia",
                    "celular", "celularDos", "activo", "arrendatarioAprobado",
                }

            elif group == "propietario":
                try:
                    perfil_to_update = propietario.objects.get(id=group_id)
                except propietario.DoesNotExist:
                    return JsonResponse(
                        {"error": "Propietario no encontrado."}, status=404
                    )
                
                allowed_fields = {
                    "genero", "tipo_documento", "doc_identificacion", "lugarExpCedula",
                    "direccionCorrespondencia", "barrioCorrespondencia", "ciudadCorrespondencia",
                    "direccion", "barrio", "ciudad", "celular", "celularDos",
                    "cuentaDaviplata", "cuentaNequi", "CuentaBancolombia",
                }
            else:
                return JsonResponse({"error": "Grupo no válido."}, status=400)

            # ============================================================
            # IMPORTANTE: SOLO actualizar los campos que vienen en la solicitud
            # NO asignar None a los campos que no se envían
            # ============================================================
            data_to_update = {}
            for field in allowed_fields:
                if field in data:
                    # Si el campo está en la solicitud, tomar su valor
                    value = data.get(field)
                    if field == "CodClasificaIndustrialIU":
                        value = entero_o_none(value)
                    data_to_update[field] = value
                # Si NO está en la solicitud, NO lo actualizamos

            print(f"📝 Campos a actualizar: {data_to_update}")

            # Actualizar los campos permitidos
            for field, value in data_to_update.items():
                setattr(perfil_to_update, field, value)
                print(f"   ✅ {field} = {value}")

            # Guardar los cambios
            perfil_to_update.save()

            return JsonResponse({
                "message": "Perfil actualizado con éxito.",
                "perfil_id": perfil_to_update.id,
                "user_id": user_to_update.id if user_to_update else None,
                "updated_fields": list(data_to_update.keys())
            }, status=200)

        except json.JSONDecodeError as e:
            return JsonResponse({"error": f"Error al parsear JSON: {str(e)}"}, status=400)
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse(
                {"error": f"Error al actualizar el perfil: {str(e)}"}, status=500
            )

    return JsonResponse({"error": "Método no permitido."}, status=405)


class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = administrador.objects.all()
    serializer_class = administradorSerializer


class ArrendatarioViewSet(viewsets.ModelViewSet):
    queryset = arrendatario.objects.all()
    serializer_class = ArrendatarioSerializer


@api_view(["GET"])
def listar_usuarios_por_grupo(request, grupo_nombre, id=None):
    try:
        # Obtiene el grupo correspondiente
        grupo = Group.objects.get(name=grupo_nombre)

        # Filtra los usuarios en función del grupo
        if grupo_nombre == "administrador":
            usuarios = administrador.objects.select_related("user").all()
        elif grupo_nombre == "arrendatario":
            usuarios = arrendatario.objects.select_related("user").all()
        elif grupo_nombre == "propietario":
            usuarios = propietario.objects.select_related("user").all()
        elif grupo_nombre == "proveedor":
            usuarios = proveedor.objects.select_related("user").all()
        elif grupo_nombre == "coarrendatario":
            usuarios = coarrendatario.objects.select_related("user").all()
        else:
            return Response({"error": "Grupo no reconocido"}, status=400)

        # Filtrar por ID si se proporciona
        if id:
            usuarios = usuarios.filter(id=id)

        # Construir la respuesta con el ID específico del modelo
        data = [
            {
                "id": usuario.id,  # Aquí obtienes el ID del modelo específico
                "first_name": usuario.user.first_name,
                "last_name": usuario.user.last_name,
                "genero": usuario.genero,
                "tipo_documento": usuario.tipo_documento,
                "doc_identificacion": usuario.doc_identificacion,
                "lugarExpCedula": usuario.lugarExpCedula,
                "CodClasificaIndustrialIU": usuario.CodClasificaIndustrialIU,
                "descActividadEconomica": usuario.descActividadEconomica,
                "activo": usuario.activo,
                "direccionCorrespondencia": usuario.direccionCorrespondencia,
                "barrioCorrespondencia": usuario.barrioCorrespondencia,
                "ciudadCorrespondencia": usuario.ciudadCorrespondencia,
                "email": usuario.user.email,
                "estadoCivil": getattr(usuario, "estadoCivil", None),
                "cuentaDaviplata": (
                    getattr(usuario, "cuentaDaviplata", None)
                    if grupo_nombre in ["administrador", "propietario"]
                    else None
                ),
                "cuentaNequi": (
                    getattr(usuario, "cuentaNequi", None)
                    if grupo_nombre in ["administrador", "propietario"]
                    else None
                ),
                "CuentaBancolombia": (
                    getattr(usuario, "CuentaBancolombia", None)
                    if grupo_nombre in ["administrador", "propietario"]
                    else None
                ),
                "llave": (
                    getattr(usuario, "llave", None)
                    if grupo_nombre in ["administrador", "propietario"]
                    else None
                ),
                "celularDos": (
                    getattr(usuario, "celularDos", None)
                    if grupo_nombre in ["administrador", "propietario"]
                    else None
                ),
                "direccion": getattr(usuario, "direccion", None),
                "barrio": getattr(usuario, "barrio", None),
                "ciudad": getattr(usuario, "ciudad", None),
                "ocupacion": getattr(usuario, "ocupacion", None),
                "celular": getattr(usuario, "celular", None),
                "empresa": getattr(usuario, "empresa", None),
                "is_active": usuario.user.is_active,  # Agregar el estado de activación
            }
            for usuario in usuarios
        ]

        return Response(data)

    except Group.DoesNotExist:
        return Response({"error": "Grupo no encontrado"}, status=404)
    except Exception as e:
        print("Error:", e)
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def listar_arrendatarios(request):
    arrendatarios = arrendatario.objects.all()
    serializer = ArrendatarioSerializer(arrendatarios, many=True)
    return Response(serializer.data)
