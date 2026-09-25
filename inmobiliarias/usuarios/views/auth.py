"""Registro, inicio y cierre de sesion."""
import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_GET

from arrendatarios.models import coarrendatario
from usuarios.models import User, administrador, arrendatario, propietario, proveedor


def entero_o_none(valor):
    """Campo numerico opcional: el formulario manda '' cuando se deja vacio, y Django no lo acepta en un IntegerField."""
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        return None
    return valor


@require_GET
@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)  # ← Genera/obtiene el token CSRF
    return JsonResponse({'csrfToken': token})


def crear_perfil_usuario(user, group_name, **kwargs):
    if group_name == "administrador":
        perfil, creado = administrador.objects.get_or_create(user=user, **kwargs)
    elif group_name == "arrendatario":
        perfil, creado = arrendatario.objects.get_or_create(user=user, **kwargs)
    elif group_name == "propietario":
        perfil, creado = propietario.objects.get_or_create(user=user, **kwargs)
    elif group_name == "proveedor":
        perfil, creado = proveedor.objects.get_or_create(user=user, **kwargs)
    elif group_name == "coarrendatario":
        perfil, creado = coarrendatario.objects.get_or_create(user=user, **kwargs)
    else:
        raise ValueError("Grupo no reconocido")

    if not creado:  # Si el perfil ya existe, lo actualizamos
        for field, value in kwargs.items():
            setattr(perfil, field, value)
        perfil.save()

    return perfil, creado


@csrf_protect
def user_create_view(request):
    if request.method == "POST":
        try:
            print("Datos recibidos en la solicitud:", request.body)
            data = json.loads(request.body)
            
            # Campos básicos que siempre vienen
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")
            first_name = data.get("first_name", "")
            last_name = data.get("last_name", "")
            
            # Determinar si es registro básico o completo
            is_basic_registration = data.get("is_basic", False)
            group_name = data.get("group", "arrendatario")  # Por defecto arrendatario
            
            # Validaciones básicas
            if not username or not email or not password:
                return JsonResponse(
                    {"error": "Nombre de usuario, email y contraseña son requeridos."}, 
                    status=400
                )
            
            # Verificar si el usuario ya existe
            if User.objects.filter(username=username).exists():
                return JsonResponse(
                    {"error": "Este nombre de usuario ya está en uso."}, status=400
                )
            if User.objects.filter(email=email).exists():
                return JsonResponse(
                    {"error": "Este correo electrónico ya está en uso."}, status=400
                )
            
            # Crear usuario (siempre se crea igual)
            user = User(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
            )
            user.password = make_password(password)
            user.save()
            
            # Asignar grupo
            try:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
            except Group.DoesNotExist:
                return JsonResponse(
                    {"error": f"El grupo {group_name} no existe."}, status=400
                )
            
            # Si es registro básico, NO creamos el perfil completo aún
            if is_basic_registration:
                return JsonResponse({
                    "message": "Usuario básico creado exitosamente",
                    "user_id": user.id,
                    "needs_profile_completion": True,
                    "group": group_name
                }, status=201)
            
            # Si es registro completo, creamos el perfil con todos los datos
            else:
                # Extraer campos específicos del perfil
                genero = data.get("genero")
                tipo_documento = data.get("tipo_documento")
                doc_identificacion = data.get("doc_identificacion")
                lugarExpCedula = data.get("lugarExpCedula")
                direccion = data.get("direccion")
                barrio = data.get("barrio")
                ciudad = data.get("ciudad")
                direccionCorrespondencia = data.get("direccionCorrespondencia")
                barrioCorrespondencia = data.get("barrioCorrespondencia")
                ciudadCorrespondencia = data.get("ciudadCorrespondencia")
                celular = data.get("celular") or None
                celularDos = data.get("celularDos") or None
                
                # Crear perfil según el grupo
                try:
                    if group_name == "administrador":
                        administrador.objects.create(
                            user=user,
                            genero=genero,
                            tipo_documento=tipo_documento,
                            doc_identificacion=doc_identificacion,
                            lugarExpCedula=lugarExpCedula,
                            direccionCorrespondencia=direccionCorrespondencia,
                            barrioCorrespondencia=barrioCorrespondencia,
                            ciudadCorrespondencia=ciudadCorrespondencia,
                            direccion=direccion,
                            barrio=barrio,
                            ciudad=ciudad,
                            celular=celular,
                            celularDos=celularDos,
                            cuentaDaviplata=data.get("cuentaDaviplata"),
                            cuentaNequi=data.get("cuentaNequi"),
                            CuentaBancolombia=data.get("CuentaBancolombia"),
                        )
                    
                    elif group_name == "propietario":
                        propietario.objects.create(
                            user=user,
                            genero=genero,
                            tipo_documento=tipo_documento,
                            doc_identificacion=doc_identificacion,
                            lugarExpCedula=lugarExpCedula,
                            direccionCorrespondencia=direccionCorrespondencia,
                            barrioCorrespondencia=barrioCorrespondencia,
                            ciudadCorrespondencia=ciudadCorrespondencia,
                            direccion=direccion,
                            barrio=barrio,
                            ciudad=ciudad,
                            celular=celular,
                            celularDos=celularDos,
                            cuentaDaviplata=data.get("cuentaDaviplata"),
                            cuentaNequi=data.get("cuentaNequi"),
                            CuentaBancolombia=data.get("CuentaBancolombia"),
                        )
                    
                    elif group_name == "arrendatario":
                        arrendatario.objects.create(
                            user=user,
                            genero=genero,
                            tipo_documento=tipo_documento,
                            doc_identificacion=doc_identificacion,
                            lugarExpCedula=lugarExpCedula,
                            direccionCorrespondencia=direccionCorrespondencia,
                            barrioCorrespondencia=barrioCorrespondencia,
                            ciudadCorrespondencia=ciudadCorrespondencia,
                            direccion=direccion,
                            estadoCivil=data.get("estadoCivil"),
                            barrio=barrio,
                            ciudad=ciudad,
                            celular=celular,
                            celularDos=celularDos,
                            ocupacion=data.get("ocupacion"),
                            empresa=data.get("empresa"),
                            CodClasificaIndustrialIU=entero_o_none(data.get("CodClasificaIndustrialIU")),
                            descActividadEconomica=data.get("descActividadEconomica"),
                        )
                    
                    elif group_name == "proveedor":
                        proveedor.objects.create(
                            user=user,
                            genero=genero,
                            tipo_documento=tipo_documento,
                            doc_identificacion=doc_identificacion,
                            lugarExpCedula=lugarExpCedula,
                            direccionCorrespondencia=direccionCorrespondencia,
                            barrioCorrespondencia=barrioCorrespondencia,
                            ciudadCorrespondencia=ciudadCorrespondencia,
                            direccion=direccion,
                            barrio=barrio,
                            ciudad=ciudad,
                            celular=celular,
                            celularDos=celularDos,
                        )
                    
                    else:
                        return JsonResponse(
                            {"error": f"El grupo {group_name} no es válido para creación de perfil."}, 
                            status=400
                        )
                    
                    return JsonResponse({
                        "message": f"Usuario y perfil de {group_name} creados con éxito",
                        "user_id": user.id
                    }, status=201)
                    
                except Exception as e:
                    # Si hay error creando el perfil, eliminamos el usuario para mantener consistencia
                    user.delete()
                    return JsonResponse(
                        {"error": f"Error creando perfil: {str(e)}"}, 
                        status=500
                    )
        
        except json.JSONDecodeError:
            return JsonResponse({"error": "Error al procesar los datos JSON."}, status=400)
        except Exception as e:
            return JsonResponse(
                {"error": f"Error en el procesamiento de la solicitud: {str(e)}"},
                status=500,
            )
    
    return JsonResponse({"error": "Método no permitido."}, status=405)


@csrf_protect
def completar_perfil_view(request):
    """Vista para completar el perfil después del registro básico"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            group_name = data.get("group")
            
            if not user_id or not group_name:
                return JsonResponse(
                    {"error": "user_id y group son requeridos."}, 
                    status=400
                )
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "Usuario no encontrado."}, status=404)
            
            if group_name == "arrendatario":
                # Verificar si ya existe
                if hasattr(user, 'arrendatario') and user.arrendatario:
                    return JsonResponse(
                        {"error": "Este usuario ya tiene un perfil de arrendatario."}, 
                        status=400
                    )
                
                # Crear perfil de arrendatario
                arrendatario_obj = arrendatario.objects.create(
                    user=user,
                    genero=data.get("genero"),
                    tipo_documento=data.get("tipo_documento"),
                    doc_identificacion=data.get("doc_identificacion"),
                    lugarExpCedula=data.get("lugarExpCedula"),
                    ocupacion=data.get("ocupacion"),
                    empresa=data.get("empresa"),
                    CodClasificaIndustrialIU=entero_o_none(data.get("CodClasificaIndustrialIU")),
                    descActividadEconomica=data.get("descActividadEconomica"),
                    direccion=data.get("direccion"),
                    estadoCivil=data.get("estadoCivil"),
                    barrio=data.get("barrio"),
                    ciudad=data.get("ciudad"),
                    direccionCorrespondencia=data.get("direccionCorrespondencia"),
                    barrioCorrespondencia=data.get("barrioCorrespondencia"),
                    ciudadCorrespondencia=data.get("ciudadCorrespondencia"),
                    celular=data.get("celular"),
                    celularDos=data.get("celularDos"),
                )
                
                # Guardar y verificar que se creó
                arrendatario_obj.save()
                
                # Asegurarse que tiene un ID
                print(f"✅ Arrendatario creado con ID: {arrendatario_obj.id}")
                print(f"✅ User ID asociado: {arrendatario_obj.user.id}")
                
                # Devolver explícitamente el ID
                return JsonResponse({
                    "success": True,
                    "message": "Perfil de arrendatario completado exitosamente",
                    "arrendatario_id": arrendatario_obj.id,  # ID del arrendatario
                    "user_id": user.id,  # También enviamos el user_id por si acaso
                    "activo": arrendatario_obj.activo,  # 👈 Agregar
                    "arrendatarioAprobado": arrendatario_obj.arrendatarioAprobado,
                }, status=201)
            
            else:
                return JsonResponse(
                    {"error": f"Grupo {group_name} no soportado."}, 
                    status=400
                )
        
        except Exception as e:
            import traceback
            print("❌ Error detallado:")
            traceback.print_exc()
            return JsonResponse(
                {"error": f"Error al completar perfil: {str(e)}"}, 
                status=500
            )
    
    return JsonResponse({"error": "Método no permitido."}, status=405)


def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # Procesa el cuerpo como JSON
            username = data.get("username")
            password = data.get("password")

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)

                # Obtener el grupo del usuario
                groups = list(user.groups.values_list("name", flat=True))

                # Inicializar user_data
                user_data = {
                    "user_id": user.id,
                    "id": user.id,                    
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "groups": groups,
                }

                # Agregar información adicional según el grupo
                if "administrador" in groups:
                    admin_data = administrador.objects.filter(user=user).first()
                    if admin_data:
                        user_data.update(
                            {
                                "id": admin_data.id,
                                "activo": admin_data.activo,
                                
                            }
                        )
                elif "arrendatario" in groups:
                    arr_data = arrendatario.objects.filter(user=user).first()
                    if arr_data:
                        user_data.update(
                            {
                                "id": arr_data.id,
                                "activo": arr_data.activo,
                                "arrendatarioAprobado": arr_data.arrendatarioAprobado,
                                "estadoCivil": arr_data.estadoCivil,
                            }
                        )
                elif "propietario" in groups:
                    prop_data = propietario.objects.filter(user=user).first()
                    if prop_data:
                        user_data.update(
                            {
                                "id": prop_data.id,
                                "activo": prop_data.activo,
                            }
                        )
                elif "proveedor" in groups:
                    prov_data = proveedor.objects.filter(user=user).first()
                    if prov_data:
                        user_data.update(
                            {
                                "id": prov_data.id,
                                "activo": prov_data.activo,
                            }
                        )

                return JsonResponse(
                    {"message": "Inicio de sesión exitoso.", "user": user_data},
                    status=200,
                )
            else:
                return JsonResponse(
                    {"message": "Nombre de usuario o contraseña incorrectos."},
                    status=401,
                )
        except json.JSONDecodeError:
            return JsonResponse({"message": "Error al procesar los datos."}, status=400)
    return JsonResponse({"message": "Método no permitido."}, status=405)


def logout_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Logged out successfully"})
    return JsonResponse({"error": "Invalid request"}, status=400)
