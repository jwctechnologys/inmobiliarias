from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import Group
from .models import *
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
from django.views.decorators.http import require_GET
from django.contrib.auth.hashers import make_password
from rest_framework import viewsets
from inicio.models import *
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import UpdateAPIView, ListAPIView
from django.contrib.auth.models import User
from django.http import Http404
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.decorators import login_required
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from contratos.models import *
from inicio.api.serializadores.serializers import *
from rest_framework.exceptions import ValidationError, NotFound
import json
from django.contrib.auth import authenticate, login
from django.utils.timezone import now
from django.utils.decorators import method_decorator
import traceback
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from django.db import transaction
from django.db.models import F


from django.middleware.csrf import get_token 

@require_GET
@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)  # ← Genera/obtiene el token CSRF
    return JsonResponse({'csrfToken': token})


def home_view(request):
    return render(request, "profiles/home.html")

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def obtener_mis_solicitudes(request):
    """
    Endpoint para que los arrendatarios vean sus propias solicitudes
    """
    usuario_id = request.query_params.get('usuario_id')
    
    if not usuario_id:
        return Response(
            {'error': 'Se requiere usuario_id'}, 
            status=400
        )
    
    try:
        usuario_id = int(usuario_id)
    except ValueError:
        return Response({'error': 'usuario_id inválido'}, status=400)
    
    try:
        # Obtener solicitudes del usuario
        solicitudes = Solicitud.objects.filter(usuario_id=usuario_id)
        
        data = []
        for s in solicitudes:
            try:
                # Datos básicos de la solicitud
                solicitud_data = {
                    'id': s.id,
                    'estado': s.estado,
                    'solicitudRevisada': s.solicitudRevisada,
                    'solicitudContratada': s.solicitudContratada,
                    'solicitudAtendida': s.solicitudAtendida,
                    'comentario_estado': s.comentario_estado or '',
                    'fecha_solicitud': str(s.fecha) if s.fecha else '',
                    'duracionContrato': s.duracionContrato,
                    'mascotas': s.mascotas,
                    'tipoMascotas': s.tipoMascotas or '',
                    'numMascotas': s.numMascotas,
                    'seguroArrendamiento': s.seguroArrendamiento,
                    'depositoVoluntario': s.depositoVoluntario,
                    'valorDepositoVoluntario': s.valorDepositoVoluntario or '',
                    'otraGarantiaAcrodada': s.otraGarantiaAcrodada,
                    'especificacionOtraGarantiaAcordada': s.especificacionOtraGarantiaAcordada or '',
                    'nombreArrendadorAnterior': getattr(s, 'nombreArrendadorAnterior', '') or '',
                    'telefonoArrendadorAnterior': getattr(s, 'telefonoArrendadorAnterior', '') or '',
                    'direccionArrendadorAnterior': getattr(s, 'direccionArrendadorAnterior', '') or '',
                    'motivoRetiro': getattr(s, 'motivoRetiro', '') or '',
                    'aceptaTratamientodeDatos': s.aceptaTratamientodeDatos,
                }
                
                # Función para obtener URL de documento
                def get_document_url(field):
                    try:
                        if field and hasattr(field, 'url'):
                            return field.url
                        return None
                    except:
                        return None
                
                # Documentos
                solicitud_data['cedulaArrendatario'] = get_document_url(s.cedulaArrendatario)
                solicitud_data['cedulaCodeudor'] = get_document_url(s.cedulaCodeudor)
                solicitud_data['cedulasHabitantes'] = get_document_url(s.cedulasHabitantes)
                solicitud_data['certificado_laboral_arrendatario'] = get_document_url(s.certificado_laboral_arrendatario)
                solicitud_data['certificado_laboral_codeudor'] = get_document_url(s.certificado_laboral_codeudor)
                solicitud_data['desprendible_nomina_arrendatario'] = get_document_url(s.desprendible_nomina_arrendatario)
                solicitud_data['desprendible_nomina_codeudor'] = get_document_url(s.desprendible_nomina_codeudor)
                solicitud_data['declaracion_renta_arrendatario'] = get_document_url(s.declaracion_renta_arrendatario)
                solicitud_data['declaracion_renta_codeudor'] = get_document_url(s.declaracion_renta_codeudor)
                solicitud_data['camara_comercio_arrendatario'] = get_document_url(s.camara_comercio_arrendatario)
                solicitud_data['camara_comercio_codeudor'] = get_document_url(s.camara_comercio_codeudor)
                
                # ==============================================
                # 1. DATOS DEL ARRENDATARIO (usuario)
                # ==============================================
                try:
                    if s.usuario:
                        usuario_obj = s.usuario
                        # Obtener el usuario relacionado (si existe)
                        user_obj = getattr(usuario_obj, 'user', None)
                        
                        solicitud_data['nombres_arrendatario'] = getattr(user_obj, 'first_name', '') or getattr(usuario_obj, 'nombres', '') or ''
                        solicitud_data['apellidos_arrendatario'] = getattr(user_obj, 'last_name', '') or getattr(usuario_obj, 'apellidos', '') or ''
                        solicitud_data['arrendatario'] = {
                            'id': usuario_obj.id,
                            'first_name': getattr(user_obj, 'first_name', '') or getattr(usuario_obj, 'nombres', '') or '',
                            'last_name': getattr(user_obj, 'last_name', '') or getattr(usuario_obj, 'apellidos', '') or '',
                            'doc_identificacion': getattr(usuario_obj, 'doc_identificacion', '') or '',
                            'lugarExpCedula': getattr(usuario_obj, 'lugarExpCedula', '') or '',
                            'email': getattr(user_obj, 'email', '') or getattr(usuario_obj, 'email', '') or '',
                            'celular': getattr(usuario_obj, 'celular', '') or '',
                            'estadoCivil': getattr(usuario_obj, 'estadoCivil', '') or '',
                            'empresa': getattr(usuario_obj, 'empresa', '') or '',
                            'ocupacion': getattr(usuario_obj, 'ocupacion', '') or '',
                        }
                    else:
                        solicitud_data['nombres_arrendatario'] = ''
                        solicitud_data['apellidos_arrendatario'] = ''
                        solicitud_data['arrendatario'] = {}
                except Exception as e:
                    print(f"Error al obtener arrendatario: {e}")
                    solicitud_data['nombres_arrendatario'] = ''
                    solicitud_data['apellidos_arrendatario'] = ''
                    solicitud_data['arrendatario'] = {}
                
                # ==============================================
                # 2. DATOS DE LA CASA
                # ==============================================
                try:
                    if s.casa:
                        casa_obj = s.casa
                        solicitud_data['direccion'] = getattr(casa_obj, 'direccion', '') or ''
                        solicitud_data['casa'] = {
                            'id': casa_obj.id,
                            'direccion': getattr(casa_obj, 'direccion', '') or '',
                            'barrio': getattr(casa_obj, 'barrio', '') or '',
                            'ciudad': getattr(casa_obj, 'ciudad', '') or '',
                            'tipoInmueble': getattr(casa_obj, 'tipoInmueble', '') or '',
                            'usoInmueble': getattr(casa_obj, 'usoInmueble', '') or '',
                            'canonmensual': str(getattr(casa_obj, 'canonmensual', 0)) or '0',
                            'disponible': getattr(casa_obj, 'disponible', True),
                            'casa_arrendada': getattr(casa_obj, 'casa_arrendada', False),
                        }
                        solicitud_data['canonmensual'] = str(getattr(casa_obj, 'canonmensual', 0)) or '0'
                        solicitud_data['ciudad'] = getattr(casa_obj, 'ciudad', '') or ''
                        solicitud_data['tipoInmueble'] = getattr(casa_obj, 'tipoInmueble', '') or ''
                        solicitud_data['usoInmueble'] = getattr(casa_obj, 'usoInmueble', '') or ''
                    else:
                        solicitud_data['direccion'] = ''
                        solicitud_data['casa'] = {}
                        solicitud_data['canonmensual'] = '0'
                        solicitud_data['ciudad'] = ''
                        solicitud_data['tipoInmueble'] = ''
                        solicitud_data['usoInmueble'] = ''
                except Exception as e:
                    print(f"Error al obtener casa: {e}")
                    solicitud_data['direccion'] = ''
                    solicitud_data['casa'] = {}
                    solicitud_data['canonmensual'] = '0'
                    solicitud_data['ciudad'] = ''
                    solicitud_data['tipoInmueble'] = ''
                    solicitud_data['usoInmueble'] = ''
                
                # ==============================================
                # 3. DATOS DEL COARRENDATARIO (por ID)
                # ==============================================
                try:
                    if s.idCoarrendatario:
                        from .models import coarrendatario  # Importa tu modelo de coarrendatario
                        co = coarrendatario.objects.get(id=s.idCoarrendatario)
                        solicitud_data['coarrendatario'] = {
                            'id': co.id,
                            'first_name': getattr(co, 'first_name', '') or getattr(co, 'nombres', '') or '',
                            'last_name': getattr(co, 'last_name', '') or getattr(co, 'apellidos', '') or '',
                            'tipo_documento': getattr(co, 'tipo_documento', '') or '',
                            'doc_identificacion': getattr(co, 'doc_identificacion', '') or '',
                            'lugarExpCedula': getattr(co, 'lugarExpCedula', '') or '',
                            'email': getattr(co, 'email', '') or '',
                            'celular': getattr(co, 'celular', '') or '',
                            'parentezco': getattr(co, 'parentezco', '') or '',
                            'direccion': getattr(co, 'direccion', '') or '',
                            'barrio': getattr(co, 'barrio', '') or '',
                            'ciudad': getattr(co, 'ciudad', '') or '',
                            'empresa': getattr(co, 'empresa', '') or '',
                            'ocupacion': getattr(co, 'ocupacion', '') or '',
                            'ingresosMensualesTotales': str(getattr(co, 'ingresosMensualesTotales', 0)) or '0',
                            'declaraRenta': getattr(co, 'declaraRenta', False),
                        }
                    else:
                        solicitud_data['coarrendatario'] = {}
                except Exception as e:
                    print(f"Error al obtener coarrendatario (id={s.idCoarrendatario}): {e}")
                    solicitud_data['coarrendatario'] = {}
                
                # ==============================================
                # 4. DECLARACIÓN DE INGRESOS (por ID)
                # ==============================================
                try:
                    if s.idDeclaracionIngresos:
                        from .models import declaracion_ingresos  # Importa tu modelo
                        di = declaracion_ingresos.objects.get(id=s.idDeclaracionIngresos)
                        solicitud_data['declaracion_ingresos'] = {
                            'id': di.id,
                            'tipoContrato': getattr(di, 'tipoContrato', '') or '',
                            'jefeInmediato': getattr(di, 'jefeInmediato', '') or '',
                            'tiempoLaboral': getattr(di, 'tiempoLaboral', '') or '',
                            'salarioBasicoMensual': str(getattr(di, 'salarioBasicoMensual', 0)) or '0',
                            'otrosIngresos': str(getattr(di, 'otrosIngresos', 0)) or '0',
                            'empresa': getattr(di, 'empresa', '') or '',
                            'ocupacion': getattr(di, 'ocupacion', '') or '',
                            'telefonoEmpresa': getattr(di, 'telefonoEmpresa', '') or '',
                            'direccion_laboral': getattr(di, 'direccion_laboral', '') or '',
                            'declaraRenta': getattr(di, 'declaraRenta', False),
                        }
                    else:
                        solicitud_data['declaracion_ingresos'] = {}
                except Exception as e:
                    print(f"Error al obtener declaración ingresos (id={s.idDeclaracionIngresos}): {e}")
                    solicitud_data['declaracion_ingresos'] = {}
                
                # ==============================================
                # 5. DEPENDIENTES (lista de IDs)
                # ==============================================
                try:
                    dependientes_data = []
                    if s.idsDependientes:
                        from .models import dependiente  # Importa tu modelo
                        for dep_id in s.idsDependientes:
                            try:
                                dep = dependiente.objects.get(id=dep_id)
                                dependientes_data.append({
                                    'id': dep.id,
                                    'first_name': getattr(dep, 'first_name', '') or getattr(dep, 'nombres', '') or '',
                                    'last_name': getattr(dep, 'last_name', '') or getattr(dep, 'apellidos', '') or '',
                                    'edad': getattr(dep, 'edad', '') or '',
                                    'tipo_documento': getattr(dep, 'tipo_documento', '') or '',
                                    'doc_identificacion': getattr(dep, 'doc_identificacion', '') or '',
                                    'lugarExpCedula': getattr(dep, 'lugarExpCedula', '') or '',
                                    'ocupacion': getattr(dep, 'ocupacion', '') or '',
                                    'parentezco': getattr(dep, 'parentezco', '') or '',
                                })
                            except Exception as e:
                                print(f"Error al obtener dependiente {dep_id}: {e}")
                    solicitud_data['dependientes'] = dependientes_data
                except Exception as e:
                    print(f"Error al obtener dependientes: {e}")
                    solicitud_data['dependientes'] = []
                
                # ==============================================
                # 6. REFERENCIAS (lista de IDs)
                # ==============================================
                try:
                    referencias_data = []
                    if s.idsReferencias:
                        from .models import referencia  # Importa tu modelo
                        for ref_id in s.idsReferencias:
                            try:
                                ref = referencia.objects.get(id=ref_id)
                                referencias_data.append({
                                    'id': ref.id,
                                    'first_name': getattr(ref, 'first_name', '') or getattr(ref, 'nombres', '') or '',
                                    'last_name': getattr(ref, 'last_name', '') or getattr(ref, 'apellidos', '') or '',
                                    'parentezco': getattr(ref, 'parentezco', '') or '',
                                    'celular': getattr(ref, 'celular', '') or '',
                                    'dir_residencia': getattr(ref, 'dir_residencia', '') or '',
                                    'ocupacion': getattr(ref, 'ocupacion', '') or '',
                                })
                            except Exception as e:
                                print(f"Error al obtener referencia {ref_id}: {e}")
                    solicitud_data['referencias'] = referencias_data
                except Exception as e:
                    print(f"Error al obtener referencias: {e}")
                    solicitud_data['referencias'] = []
                
                data.append(solicitud_data)
                
            except Exception as e:
                print(f"Error al procesar solicitud {s.id}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        return Response(data, status=200)
        
    except Exception as e:
        import traceback
        print(f"Error en obtener_mis_solicitudes: {e}")
        traceback.print_exc()
        return Response({
            'error': str(e),
            'detalle': 'Error interno del servidor'
        }, status=500)

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
                            estadoCivil=estadoCivil, 
                            barrio=barrio,
                            ciudad=ciudad,
                            celular=celular,
                            celularDos=celularDos,
                            ocupacion=data.get("ocupacion"),
                            empresa=data.get("empresa"),
                            CodClasificaIndustrialIU=data.get("CodClasificaIndustrialIU"),
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
                    CodClasificaIndustrialIU=data.get("CodClasificaIndustrialIU"),
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


# Vista para Arrendador
class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = administrador.objects.all()
    serializer_class = administradorSerializer


# Vista para Arrendatario
class ArrendatarioViewSet(viewsets.ModelViewSet):
    queryset = arrendatario.objects.all()
    serializer_class = ArrendatarioSerializer


# Vista para Inmueble
class InmuebleViewSet(viewsets.ModelViewSet):
    queryset = arrendar.objects.all()
    serializer_class = InmuebleSerializer


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
def listar_inmuebles(request):
    try:
        inmuebles = arrendar.objects.all()
        data = []
        
        for inmueble in inmuebles:
            data.append({
                "id": inmueble.id,
                "propietario_id": inmueble.propietario_id,  # Solo el ID del propietario
                "matriculaInmobiliaria": inmueble.matriculaInmobiliaria,
                "tipoInmueble": inmueble.tipoInmueble,
                "usoInmueble": inmueble.usoInmueble,
                "direccion": inmueble.direccion,
                "barrio": inmueble.barrio,
                "ciudad": inmueble.ciudad,
                "descripcion": inmueble.descripcion,
                "condiciones": inmueble.condiciones,
                "con_administracion": inmueble.con_administracion,
                "fotoPrincipal": inmueble.fotoPrincipal.url if inmueble.fotoPrincipal else None,
                "publicar": inmueble.publicar,
                "conCodeudor": inmueble.conCodeudor,
                "arrendada": inmueble.arrendada,
                "canonmensual": inmueble.canonmensual,
                "observacion_canonmensual": inmueble.observacion_canonmensual,
                "deposito": inmueble.deposito,
                "observacion_deposito": inmueble.observacion_deposito,
                "sala": inmueble.sala,
                "observacion_sala": inmueble.observacion_sala,
                "comedor": inmueble.comedor,
                "observacion_comedor": inmueble.observacion_comedor,
                "cocina": inmueble.cocina,
                "observacion_cocina": inmueble.observacion_cocina,
                "habitaciones": inmueble.habitaciones,
                "observacion_habitaciones": inmueble.observacion_habitaciones,
                "baños": inmueble.baños,
                "observacion_baños": inmueble.observacion_baños,
                "patio": inmueble.patio,
                "observacion_patio": inmueble.observacion_patio,
                "garage": inmueble.garage,
                "observacion_garage": inmueble.observacion_garage,
                "tanquesubterraneo": inmueble.tanquesubterraneo,
                "observacion_tanquesubterraneo": inmueble.observacion_tanquesubterraneo,
                "ser_agua": inmueble.ser_agua,
                "observacion_ser_agua": inmueble.observacion_ser_agua,
                "ser_energia": inmueble.ser_energia,
                "observacion_ser_energia": inmueble.observacion_ser_energia,
                "ser_gas_domiciliario": inmueble.ser_gas_domiciliario,
                "observacion_ser_gas_domiciliario": inmueble.observacion_ser_gas_domiciliario,
                "ser_bioagricola": inmueble.ser_bioagricola,
                "observacion_ser_bioagricola": inmueble.observacion_ser_bioagricola,
                "otros": inmueble.otros,
            })
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error en listar_inmuebles: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


@api_view(["GET"])
def listar_arrendatarios(request):
    arrendatarios = arrendatario.objects.all()
    serializer = ArrendatarioSerializer(arrendatarios, many=True)
    return Response(serializer.data)


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


class PDFUploadOtrosiView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        contrato_id = request.data.get("contratoId")
        otrosis = request.FILES.get("pdf_firmado")  # Archivo PDF

        # Depuración inicial
        print(f"Contrato ID recibido: {contrato_id}")
        if otrosis:
            print(f"Archivo recibido: {otrosis.name}, tamaño: {otrosis.size} bytes")
        else:
            print("Archivo no recibido correctamente en 'otrosi'")

        if not contrato_id or not otrosis:
            return Response(
                {"error": "Contrato ID o archivo no proporcionado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            contrato = otroSi.objects.get(id=contrato_id)
            print(f"Contrato OtroSi encontrado: ID={contrato.id}")

            # Cambiar 'inventario' por 'pdf_inventario'
            contrato.pdf_firmado = otrosis  # Asigna el archivo PDF
            print(f"Archivo antes de guardar: {contrato.pdf_firmado}")

            contrato.save()  # Guarda el contrato junto con el archivo
            print(f"Contrato después de guardar: {contrato}")
        except contrato_local_vivienda.DoesNotExist:
            print(f"No se encontró el contrato con ID={contrato_id}")
            return Response(
                {"error": "Contrato no encontrado"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error inesperado: {e}")
            return Response(
                {"error": f"Error inesperado: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "PDF subido exitosamente"}, status=status.HTTP_200_OK
        )



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


class ReporteNovedadesCreateView(APIView):

    def post(self, request):
        serializer = ReporteNovedadesSerializer(data=request.data)
        print(serializer)
        if serializer.is_valid():
            reporte = serializer.save()

            # Manejar imágenes
            imagenes = request.FILES.getlist("imagenes")
            for imagen in imagenes:
                imagenReporteNovedades.objects.create(
                    reporteNovedad=reporte, imagen=imagen
                )

            # Manejar videos
            videos = request.FILES.getlist("videos")
            for video in videos:
                videoReporteNovedades.objects.create(
                    reporteNovedad=reporte, video_archivo=video
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReporteNovedadesListView(APIView):
    def get(self, request, *args, **kwargs):
        arrendatario_id = request.query_params.get(
            "arrendatario_id"
        )  # Obtener el ID del arrendatario de los parámetros de consulta

        if arrendatario_id:
            # Filtrar reportes por arrendatario a través de la relación con contratoNum y userArrendatario
            reportes = reporteNovedades.objects.filter(
                contratoNum__userArrendatario__id=arrendatario_id
            )
            if not reportes.exists():
                raise NotFound("No se encontraron reportes para este arrendatario.")
        else:
            # Obtener todos los reportes si no se envía el parámetro
            reportes = reporteNovedades.objects.all()

        serializer = ReporteNovedadesSerializer(reportes, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = ReporteNovedadesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnviarReporteView(APIView):
    def patch(self, request, reporte_id):
        try:
            reporte = reporteNovedades.objects.get(id=reporte_id)
            autorizacion = request.data.get("autorizacion")
            comentario = request.data.get("comentario")
            estaResuelto = request.data.get("estaResuelto")
            estaResueltoArrendatario = request.data.get("estaResueltoArrendatario")

            if autorizacion is not None:
                reporte.estaHabilitado = autorizacion
            if comentario:
                reporte.textoAdministrador = comentario
            if estaResuelto:
                reporte.estaResuelto = estaResuelto
            if estaResueltoArrendatario:
                reporte.estaResueltoArrendatario = estaResueltoArrendatario

            reporte.save()
            return Response(
                {"message": "Reporte actualizado exitosamente."},
                status=status.HTTP_200_OK,
            )

        except reporteNovedades.DoesNotExist:
            return Response(
                {"error": "Reporte no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )



class ReportePagoRecibosView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        print("esto es user", user)
        # Verificar si el usuario es arrendatario
        if not user.groups.filter(name="arrendatario").exists():
            return Response(
                {"error": "No tiene permisos para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Identificar el tipo de recibo enviado
        recibo_tipo = request.data.get("reciboTipo")
        archivo = request.FILES.get(recibo_tipo)

        if not recibo_tipo or not archivo:
            return Response(
                {
                    "error": "Debe especificar el tipo de recibo y proporcionar un archivo."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Crear datos dinámicamente para el serializador
        data = {
            "reportePagoReciboContrato": request.data.get("reportePagoReciboContrato"),
            recibo_tipo: archivo,
        }

        serializer = ReportePagoRecibosSerializer(data=data)

        if serializer.is_valid():
            reporte = serializer.save()
            return Response(
                {
                    "message": f"El recibo de {recibo_tipo} se subió con éxito.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerPagosServiciosView(APIView):

    def get(self, request, arrendatario_id):
        # Obtener los contratos del arrendatario
        contratos = contrato_local_vivienda.objects.filter(
            userArrendatario_id=arrendatario_id
        )

        # Si no hay contratos, retornar un mensaje adecuado
        if not contratos.exists():
            return Response(
                {"message": "Este arrendatario no tiene contratos registrados."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Obtener los pagos asociados a los contratos de este arrendatario
        pagos = ReportePagoRecibos.objects.filter(
            reportePagoReciboContrato__in=contratos
        )

        # Si no hay pagos asociados, retornar un mensaje adecuado
        if not pagos.exists():
            return Response(
                {
                    "message": "No se han encontrado pagos de servicios para este arrendatario."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serializar los pagos
        serializer = ReportePagoRecibosSerializer(pagos, many=True)
        print(serializer.data)

        return Response(serializer.data)

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


class ReporteIndonformidadCreateView(APIView):
    def post(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)

        # Crear el serializer con los datos del request
        serializer = ReporteInconformidadSerializer(data=request.data)

        # Validar los datos
        if serializer.is_valid():
            try:
                # Guardar el reporte de inconformidad
                reporte = serializer.save()

                # Actualizar el estado del contrato relacionado
                contrato_id = reporte.reporteinconformidad.id
                contrato = get_object_or_404(contrato_local_vivienda, id=contrato_id)

                # Marcar que el contrato ya no está firmado
                contrato.estaFirmado = False
                contrato.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print("Error al guardar o actualizar los datos:", str(e))
                return Response(
                    {"detail": f"Error interno: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            # Mostrar errores específicos del serializer
            print("Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        # Obtener el ID del reporte de inconformidad desde la URL
        reporte_id = kwargs.get("pk")
        print(f"ID recibido en la URL: {reporte_id}")  # Control: Mostrar ID recibido

        # Buscar el reporte de inconformidad usando el ID
        try:
            reporte = get_object_or_404(ReporteInconformidad, id=reporte_id)
            print(
                f"Reporte encontrado: {reporte}"
            )  # Control: Mostrar objeto reporte encontrado
        except Exception as e:
            print(
                f"Error al obtener el reporte: {e}"
            )  # Control: Error al obtener reporte
            return Response(
                {"detail": "Reporte de inconformidad no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Actualizar el estado de la inconformidad como solucionada
        reporte.inconformidadSolucionada = True
        print(
            f"Estado de inconformidad antes de guardar: {reporte.inconformidadSolucionada}"
        )  # Control: Verificar estado antes de guardar

        # Guardar el reporte
        reporte.save()
        print(
            f"Estado de inconformidad después de guardar: {reporte.inconformidadSolucionada}"
        )  # Control: Verificar estado después de guardar

        # Responder con el mensaje de éxito
        return Response(
            {"detail": "Inconformidad marcada como solucionada"},
            status=status.HTTP_200_OK,
        )


class OtroSiViewSet(viewsets.ModelViewSet):

    queryset = otroSi.objects.all()
    serializer_class = OtroSiSerializer



class CasaCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)
        print("Archivos recibidos:", request.FILES)

        serializer = CasaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("Errores de validación:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CasaViewSet(viewsets.ModelViewSet):
    queryset = arrendar.objects.all()
    serializer_class = CasaSerializer

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError as e:
            print(e.detail)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ImagenCasaArrendarViewSet(viewsets.ModelViewSet):
    queryset = Imagen_casa_arrendar.objects.all()
    serializer_class = ImagenCasaArrendarSerializer

    def create(self, request, *args, **kwargs):
        print(
            "Datos recibidos:", request.data
        )  # Imprime los datos recibidos en la consola
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Verifica la validez del serializer
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        queryset = super().get_queryset()
        arrendar_id = self.request.query_params.get('arrendar')
        if arrendar_id:
            queryset = queryset.filter(arrendar_id=arrendar_id)
        return queryset
    
class VideoCasaViewSet(viewsets.ModelViewSet):
    queryset = Video_Casa.objects.all()
    serializer_class = VideoCasaSerializer

    def create(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)  # Imprime datos recibidos
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        queryset = super().get_queryset()
        arrendar_id = self.request.query_params.get('arrendar')
        if arrendar_id:
            queryset = queryset.filter(arrendar_id=arrendar_id)
        return queryset
    
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

@api_view(["POST"])
def solicitud_completa(request):
    """Vista para recibir la solicitud completa con todos los datos y documentos"""
    # Declarar todas las variables al inicio
    solicitud = None
    idDeclaracionIngresos = None
    idCoarrendatario = None
    idsDependientes = []
    idsReferencias = []
    
    try:
        # Imprimir todos los datos recibidos para depuración
        print("=== DATOS RECIBIDOS ===")
        print("POST data:", request.POST)
        print("FILES data:", request.FILES)
        print("POST keys:", list(request.POST.keys()))
        print("FILES keys:", list(request.FILES.keys()))
        
        # Validar campos requeridos
        required_fields = ['casa_id', 'arrendatario_id', 'duracionContrato']
        for field in required_fields:
            if not request.POST.get(field):
                return Response({
                    'error': f'Campo requerido faltante: {field}',
                    'details': f'El campo {field} es obligatorio'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Obtener casa y arrendatario
            try:
                casa = arrendar.objects.get(id=request.POST.get('casa_id'))
                arrendatario_obj = arrendatario.objects.get(id=request.POST.get('arrendatario_id'))
            except arrendar.DoesNotExist:
                return Response({'error': 'La casa no existe'}, status=status.HTTP_400_BAD_REQUEST)
            except arrendatario.DoesNotExist:
                return Response({'error': 'El arrendatario no existe'}, status=status.HTTP_400_BAD_REQUEST)
            
            # ==================== 1. MANEJAR DECLARACIÓN DE INGRESOS ====================
            idDeclaracionIngresos = request.POST.get('idDeclaracionIngresos')
            
            print(f"idDeclaracionIngresos recibido: {idDeclaracionIngresos}")
            
            # Si no hay ID o está vacío, crear una nueva declaración
            if not idDeclaracionIngresos or idDeclaracionIngresos == '':
                # Verificar si hay datos para crear una nueva declaración
                tipoContrato = request.POST.get('declaracion_ingresos[tipoContrato]')
                print(f"tipoContrato recibido: {tipoContrato}")
                
                if tipoContrato:
                    try:
                        decl_ingresos_data = {
                            'usuario': arrendatario_obj,
                            'tipoContrato': tipoContrato or '',
                            'jefeInmediato': request.POST.get('declaracion_ingresos[jefeInmediato]') or '',
                            'tiempoLaboral': request.POST.get('declaracion_ingresos[tiempoLaboral]') or '',
                            'salarioBasicoMensual': request.POST.get('declaracion_ingresos[salarioBasicoMensual]') or '',
                            'otrosIngresos': request.POST.get('declaracion_ingresos[otrosIngresos]') or '',
                            'telefonoEmpresa': request.POST.get('declaracion_ingresos[telefonoEmpresa]') or '',
                            'direccion_laboral': request.POST.get('declaracion_ingresos[direccion_laboral]') or '',
                            'declaraRenta': request.POST.get('declaracion_ingresos[declaraRenta]') == 'true'
                        }
                        
                        print(f"Creando nueva declaración con datos: {decl_ingresos_data}")
                        nueva_declaracion = declaracion_ingresos.objects.create(**decl_ingresos_data)
                        idDeclaracionIngresos = nueva_declaracion.id
                        print(f"Nueva declaración de ingresos creada con ID: {idDeclaracionIngresos}")
                        
                    except Exception as e:
                        print(f"Error al crear declaración de ingresos: {e}")
                        return Response({
                            'error': 'Error al crear declaración de ingresos',
                            'details': str(e)
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    print("No hay datos para crear declaración de ingresos")
            else:
                # Verificar que la declaración existe
                try:
                    declaracion_existente = declaracion_ingresos.objects.get(id=idDeclaracionIngresos)
                    print(f"Usando declaración existente ID: {idDeclaracionIngresos}")
                    
                    # ACTUALIZAR la declaración existente con los datos del formulario
                    tipoContrato = request.POST.get('declaracion_ingresos[tipoContrato]')
                    if tipoContrato:
                        declaracion_existente.tipoContrato = tipoContrato
                        declaracion_existente.jefeInmediato = request.POST.get('declaracion_ingresos[jefeInmediato]') or ''
                        declaracion_existente.tiempoLaboral = request.POST.get('declaracion_ingresos[tiempoLaboral]') or ''
                        declaracion_existente.salarioBasicoMensual = request.POST.get('declaracion_ingresos[salarioBasicoMensual]') or ''
                        declaracion_existente.otrosIngresos = request.POST.get('declaracion_ingresos[otrosIngresos]') or ''
                        declaracion_existente.telefonoEmpresa = request.POST.get('declaracion_ingresos[telefonoEmpresa]') or ''
                        declaracion_existente.direccion_laboral = request.POST.get('declaracion_ingresos[direccion_laboral]') or ''
                        declaracion_existente.declaraRenta = request.POST.get('declaracion_ingresos[declaraRenta]') == 'true'
                        declaracion_existente.save()
                        print(f"Declaración actualizada ID: {idDeclaracionIngresos}")
                except declaracion_ingresos.DoesNotExist:
                    print(f"Declaración ID {idDeclaracionIngresos} no existe, se creará una nueva")
                    idDeclaracionIngresos = None
                    # Intentar crear una nueva
                    tipoContrato = request.POST.get('declaracion_ingresos[tipoContrato]')
                    if tipoContrato:
                        try:
                            decl_ingresos_data = {
                                'usuario': arrendatario_obj,
                                'tipoContrato': tipoContrato or '',
                                'jefeInmediato': request.POST.get('declaracion_ingresos[jefeInmediato]') or '',
                                'tiempoLaboral': request.POST.get('declaracion_ingresos[tiempoLaboral]') or '',
                                'salarioBasicoMensual': request.POST.get('declaracion_ingresos[salarioBasicoMensual]') or '',
                                'otrosIngresos': request.POST.get('declaracion_ingresos[otrosIngresos]') or '',
                                'telefonoEmpresa': request.POST.get('declaracion_ingresos[telefonoEmpresa]') or '',
                                'direccion_laboral': request.POST.get('declaracion_ingresos[direccion_laboral]') or '',
                                'declaraRenta': request.POST.get('declaracion_ingresos[declaraRenta]') == 'true'
                            }
                            nueva_declaracion = declaracion_ingresos.objects.create(**decl_ingresos_data)
                            idDeclaracionIngresos = nueva_declaracion.id
                            print(f"Nueva declaración creada ID: {idDeclaracionIngresos}")
                        except Exception as e:
                            print(f"Error creando declaración: {e}")
            
            # ==================== 2. MANEJAR COARRENDATARIO ====================
            tiene_coarrendatario = request.POST.get('tieneCoarrendatario') == 'true'
            
            if tiene_coarrendatario:
                idCoarrendatario = request.POST.get('idCoarrendatario')
                
                # Si no hay ID pero se enviaron datos, crear nuevo coarrendatario
                if (not idCoarrendatario or idCoarrendatario == '') and request.POST.get('coarrendatario[first_name]'):
                    try:
                        coarrendatario_data = {
                            'arrendatario': arrendatario_obj,
                            'first_name': request.POST.get('coarrendatario[first_name]'),
                            'last_name': request.POST.get('coarrendatario[last_name]'),
                            'tipo_documento': request.POST.get('coarrendatario[tipo_documento]'),
                            'doc_identificacion': request.POST.get('coarrendatario[doc_identificacion]'),
                            'lugarExpCedula': request.POST.get('coarrendatario[lugarExpCedula]') or None,
                            'parentezco': request.POST.get('coarrendatario[parentezco]') or None,
                            'celular': request.POST.get('coarrendatario[celular]'),
                            'email': request.POST.get('coarrendatario[email]'),
                            'direccion': request.POST.get('coarrendatario[direccion]') or None,
                            'barrio': request.POST.get('coarrendatario[barrio]') or None,
                            'ciudad': request.POST.get('coarrendatario[ciudad]') or None,
                            'empresa': request.POST.get('coarrendatario[empresa]'),
                            'ocupacion': request.POST.get('coarrendatario[ocupacion]'),
                            'ingresosMensualesTotales': request.POST.get('coarrendatario[ingresosMensualesTotales]') or None,
                            'declaraRenta': request.POST.get('coarrendatario[declaraRenta]') == 'true',
                            'genero': request.POST.get('coarrendatario[genero]') or None
                        }
                        
                        nuevo_coarrendatario = coarrendatario.objects.create(**coarrendatario_data)
                        idCoarrendatario = nuevo_coarrendatario.id
                        print(f"Nuevo coarrendatario creado con ID: {idCoarrendatario}")
                        
                    except Exception as e:
                        return Response({
                            'error': 'Error al crear coarrendatario',
                            'details': str(e)
                        }, status=status.HTTP_400_BAD_REQUEST)
            
            # ==================== 3. MANEJAR DEPENDIENTES ====================
            idsDependientes_json = request.POST.get('idsDependientes', '[]')
            try:
                if idsDependientes_json and idsDependientes_json != '[]':
                    idsDependientes = json.loads(idsDependientes_json)
                else:
                    idsDependientes = []
            except json.JSONDecodeError:
                idsDependientes = []
            
            # Crear dependientes nuevos si vienen en la solicitud
            dependientes_nuevos_json = request.POST.get('dependientes_nuevos', '[]')
            try:
                if dependientes_nuevos_json and dependientes_nuevos_json != '[]':
                    dependientes_nuevos = json.loads(dependientes_nuevos_json)
                    for dep in dependientes_nuevos:
                        if dep.get('first_name'):
                            nuevo_dep = dependientes.objects.create(
                                arrendatario=arrendatario_obj,
                                first_name=dep.get('first_name', ''),
                                last_name=dep.get('last_name', ''),
                                edad=dep.get('edad', '') if dep.get('edad') else None,
                                tipo_documento=dep.get('tipo_documento', ''),
                                doc_identificacion=dep.get('doc_identificacion', '') if dep.get('doc_identificacion') else None,
                                lugarExpCedula=dep.get('lugarExpCedula', ''),
                                ocupacion=dep.get('ocupacion', ''),
                                parentezco=dep.get('parentezco', '')
                            )
                            idsDependientes.append(nuevo_dep.id)
                    print(f"Dependientes nuevos creados: {len(dependientes_nuevos)}")
            except Exception as e:
                return Response({
                    'error': 'Error al crear dependientes',
                    'details': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # ==================== 4. MANEJAR REFERENCIAS ====================
            idsReferencias_json = request.POST.get('idsReferencias', '[]')
            try:
                if idsReferencias_json and idsReferencias_json != '[]':
                    idsReferencias = json.loads(idsReferencias_json)
                else:
                    idsReferencias = []
            except json.JSONDecodeError:
                idsReferencias = []
            
            # Crear referencias nuevas si vienen en la solicitud
            referencias_nuevas_json = request.POST.get('referencias_nuevas', '[]')
            try:
                if referencias_nuevas_json and referencias_nuevas_json != '[]':
                    referencias_nuevas = json.loads(referencias_nuevas_json)
                    for ref in referencias_nuevas:
                        if ref.get('first_name'):
                            nueva_ref = referencias.objects.create(
                                arrendatario=arrendatario_obj,
                                first_name=ref.get('first_name', ''),
                                last_name=ref.get('last_name', ''),
                                parentezco=ref.get('parentezco', ''),
                                celular=ref.get('celular', '') if ref.get('celular') else None,
                                dir_residencia=ref.get('dir_residencia', ''),
                                ocupacion=ref.get('ocupacion', '')
                            )
                            idsReferencias.append(nueva_ref.id)
                    print(f"Referencias nuevas creadas: {len(referencias_nuevas)}")
            except Exception as e:
                return Response({
                    'error': 'Error al crear referencias',
                    'details': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # ==================== 5. CREAR SOLICITUD ====================
            try:
                # Datos básicos de la solicitud
                solicitud_data = {
                    'casa': casa,
                    'usuario': arrendatario_obj,
                    'idCoarrendatario': int(idCoarrendatario) if idCoarrendatario and idCoarrendatario != '' else None,
                    'idsDependientes': idsDependientes if idsDependientes else [],
                    'idsReferencias': idsReferencias if idsReferencias else [],
                    'idDeclaracionIngresos': int(idDeclaracionIngresos) if idDeclaracionIngresos and idDeclaracionIngresos != '' else None,
                    'duracionContrato': int(request.POST.get('duracionContrato')),
                    'seguroArrendamiento': request.POST.get('solicitud[seguroArrendamiento]') == 'true',
                    'depositoVoluntario': request.POST.get('solicitud[depositoVoluntario]') == 'true',
                    'valorDepositoVoluntario': request.POST.get('solicitud[valorDepositoVoluntario]') or None,
                    'otraGarantiaAcrodada': request.POST.get('solicitud[otraGarantiaAcordada]') == 'true',
                    'especificacionOtraGarantiaAcordada': request.POST.get('solicitud[especificacionOtraGarantiaAcordada]') or None,
                    'mascotas': request.POST.get('solicitud[mascotas]') == 'true',
                    'numMascotas': int(request.POST.get('solicitud[numMascotas]')) if request.POST.get('solicitud[numMascotas]') else None,
                    'tipoMascotas': request.POST.get('solicitud[tipoMascotas]') or None,
                    'aceptaTratamientodeDatos': request.POST.get('solicitud[aceptaTratamientodeDatos]') == 'true',
                }
                
                # ==================== MANEJAR DOCUMENTOS CON REFERENCIA ====================
                # Mapeo de campos: (campo_file, campo_existente)
                documentos_map = [
                    ('cedulaArrendatario', 'cedulaArrendatario_existente'),
                    ('cedulaCodeudor', 'cedulaCodeudor_existente'),
                    ('cedulasHabitantes', 'cedulasHabitantes_existente'),
                    ('certificado_laboral_arrendatario', 'certificado_laboral_arrendatario_existente'),
                    ('certificado_laboral_codeudor', 'certificado_laboral_codeudor_existente'),
                    ('desprendible_nomina_arrendatario', 'desprendible_nomina_arrendatario_existente'),
                    ('desprendible_nomina_codeudor', 'desprendible_nomina_codeudor_existente'),
                    ('declaracion_renta_arrendatario', 'declaracion_renta_arrendatario_existente'),
                    ('declaracion_renta_codeudor', 'declaracion_renta_codeudor_existente'),
                    ('camara_comercio_arrendatario', 'camara_comercio_arrendatario_existente'),
                    ('camara_comercio_codeudor', 'camara_comercio_codeudor_existente'),
                ]
                
                for campo, campo_existente in documentos_map:
                    # Primero verificar si se subió un archivo nuevo
                    archivo_nuevo = request.FILES.get(campo)
                    if archivo_nuevo:
                        solicitud_data[campo] = archivo_nuevo
                        print(f"📄 Archivo nuevo para {campo}: {archivo_nuevo.name}")
                    else:
                        # Si no hay archivo nuevo, verificar si se envió un documento existente
                        ruta_existente = request.POST.get(campo_existente)
                        if ruta_existente:
                            # Guardar la referencia (ruta) del documento existente
                            # Esto NO copia el archivo físicamente, solo guarda la ruta
                            solicitud_data[campo] = ruta_existente
                            print(f"📁 Usando documento existente para {campo}: {ruta_existente}")
                        # Si no hay ni nuevo ni existente, el campo queda como None (null)
                
                # Crear la solicitud
                solicitud = Solicitud.objects.create(**solicitud_data)
                print(f"✅ Solicitud creada exitosamente con ID: {solicitud.id}")
                print(f"  - idDeclaracionIngresos: {solicitud.idDeclaracionIngresos}")
                print(f"  - idCoarrendatario: {solicitud.idCoarrendatario}")
                print(f"  - idsDependientes: {solicitud.idsDependientes}")
                print(f"  - idsReferencias: {solicitud.idsReferencias}")
                
                # Imprimir los documentos guardados
                print("📄 Documentos guardados en la solicitud:")
                for campo, _ in documentos_map:
                    valor = getattr(solicitud, campo, None)
                    if valor:
                        print(f"  - {campo}: {valor}")
                
            except Exception as e:
                print(f"❌ Error detallado al crear solicitud: {str(e)}")
                print(traceback.format_exc())
                return Response({
                    'error': 'Error al crear solicitud',
                    'details': str(e),
                    'traceback': traceback.format_exc()
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Retornar respuesta exitosa
        return Response({
            'message': '✅ Solicitud enviada exitosamente',
            'solicitud_id': solicitud.id if solicitud else None,
            'casa_id': casa.id,
            'arrendatario_id': arrendatario_obj.id,
            'idDeclaracionIngresos': idDeclaracionIngresos,
            'idCoarrendatario': idCoarrendatario,
            'idsDependientes': idsDependientes,
            'idsReferencias': idsReferencias
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("❌ Error general:", str(e))
        print(traceback.format_exc())
        return Response({
            'error': 'Error general',
            'details': str(e),
            'traceback': traceback.format_exc()
        }, status=status.HTTP_400_BAD_REQUEST)

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


# En inicio/views.py - Versión más robusta
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

@api_view(['GET'])
@permission_classes([AllowAny])
def obtener_solicitud_publica(request, solicitud_id):
    """
    Vista pública para obtener detalles de una solicitud por ID.
    Obtiene todos los datos relacionados: coarrendatario, dependientes, referencias, declaración de ingresos
    """
    try:
        print(f"=== obtener_solicitud_publica - ID: {solicitud_id} ===")
        
        # Obtener la solicitud con todas las relaciones necesarias
        solicitud = Solicitud.objects.select_related('usuario', 'casa__propietario__user').get(id=solicitud_id)
        
        print(f"Solicitud encontrada: ID {solicitud.id}, Estado: {solicitud.estado}")
        
        # === ELIMINAR LA RESTRICCIÓN DE ESTADO PARA DEPURACIÓN ===
        # Ahora permite cualquier estado (pendiente, aceptada, etc.)
        # Solo verificamos que exista la solicitud
        
        # Obtener datos del propietario
        propietario_obj = solicitud.casa.propietario if solicitud.casa else None
        propietario_user = propietario_obj.user if propietario_obj else None
        
        # Obtener datos del arrendatario
        arrendatario_obj = solicitud.usuario
        arrendatario_user = arrendatario_obj.user if arrendatario_obj else None
        
        print(f"Arrendatario ID: {arrendatario_obj.id if arrendatario_obj else 'None'}")
        
        # ==================== OBTENER COARRENDATARIO ====================
        coarrendatario_data = None
        if solicitud.idCoarrendatario:
            try:
                print(f"Buscando coarrendatario con ID: {solicitud.idCoarrendatario}")
                coarrendatario_obj = coarrendatario.objects.get(id=solicitud.idCoarrendatario)
                coarrendatario_data = {
                    'id': coarrendatario_obj.id,
                    'first_name': coarrendatario_obj.first_name or '',
                    'last_name': coarrendatario_obj.last_name or '',
                    'tipo_documento': coarrendatario_obj.tipo_documento or '',
                    'doc_identificacion': coarrendatario_obj.doc_identificacion or '',
                    'lugarExpCedula': coarrendatario_obj.lugarExpCedula or '',
                    'parentezco': coarrendatario_obj.parentezco or '',
                    'celular': coarrendatario_obj.celular or '',
                    'email': coarrendatario_obj.email or '',
                    'direccion': coarrendatario_obj.direccion or '',
                    'barrio': coarrendatario_obj.barrio or '',
                    'ciudad': coarrendatario_obj.ciudad or '',
                    'empresa': coarrendatario_obj.empresa or '',
                    'ocupacion': coarrendatario_obj.ocupacion or '',
                    'ingresosMensualesTotales': coarrendatario_obj.ingresosMensualesTotales or '',
                    'declaraRenta': coarrendatario_obj.declaraRenta or False,
                    'genero': coarrendatario_obj.genero or '',
                }
                print(f"Coarrendatario encontrado: {coarrendatario_data['first_name']} {coarrendatario_data['last_name']}")
            except coarrendatario.DoesNotExist:
                print(f"Coarrendatario con ID {solicitud.idCoarrendatario} no encontrado")
            except Exception as e:
                print(f"Error obteniendo coarrendatario: {e}")
        
        # ==================== OBTENER DEPENDIENTES ====================
        dependientes_data = []
        if solicitud.idsDependientes and len(solicitud.idsDependientes) > 0:
            try:
                print(f"Buscando {len(solicitud.idsDependientes)} dependientes")
                dependientes_list = dependientes.objects.filter(id__in=solicitud.idsDependientes)
                for dep in dependientes_list:
                    dependientes_data.append({
                        'id': dep.id,
                        'first_name': dep.first_name or '',
                        'last_name': dep.last_name or '',
                        'edad': dep.edad or '',
                        'tipo_documento': dep.tipo_documento or '',
                        'doc_identificacion': dep.doc_identificacion or '',
                        'lugarExpCedula': dep.lugarExpCedula or '',
                        'ocupacion': dep.ocupacion or '',
                        'parentezco': dep.parentezco or '',
                    })
                print(f"Se encontraron {len(dependientes_data)} dependientes")
            except Exception as e:
                print(f"Error obteniendo dependientes: {e}")
        
        # ==================== OBTENER REFERENCIAS ====================
        referencias_data = []
        if solicitud.idsReferencias and len(solicitud.idsReferencias) > 0:
            try:
                print(f"Buscando {len(solicitud.idsReferencias)} referencias")
                referencias_list = referencias.objects.filter(id__in=solicitud.idsReferencias)
                for ref in referencias_list:
                    referencias_data.append({
                        'id': ref.id,
                        'first_name': ref.first_name or '',
                        'last_name': ref.last_name or '',
                        'parentezco': ref.parentezco or '',
                        'celular': ref.celular or '',
                        'dir_residencia': ref.dir_residencia or '',
                        'ocupacion': ref.ocupacion or '',
                    })
                print(f"Se encontraron {len(referencias_data)} referencias")
            except Exception as e:
                print(f"Error obteniendo referencias: {e}")
        
        # ==================== OBTENER DECLARACIÓN DE INGRESOS ====================
        declaracion_data = None
        if solicitud.idDeclaracionIngresos:
            try:
                print(f"Buscando declaración de ingresos con ID: {solicitud.idDeclaracionIngresos}")
                declaracion_obj = declaracion_ingresos.objects.get(id=solicitud.idDeclaracionIngresos)
                declaracion_data = {
                    'id': declaracion_obj.id,
                    'tipoContrato': declaracion_obj.tipoContrato or '',
                    'jefeInmediato': declaracion_obj.jefeInmediato or '',
                    'tiempoLaboral': declaracion_obj.tiempoLaboral or '',
                    'salarioBasicoMensual': declaracion_obj.salarioBasicoMensual or '',
                    'otrosIngresos': declaracion_obj.otrosIngresos or '',
                    'telefonoEmpresa': declaracion_obj.telefonoEmpresa or '',
                    'direccion_laboral': declaracion_obj.direccion_laboral or '',
                    'declaraRenta': declaracion_obj.declaraRenta or False,
                    'fecha_creacion': declaracion_obj.fecha_creacion.strftime('%Y-%m-%d') if declaracion_obj.fecha_creacion else '',
                }
                print("Declaración de ingresos encontrada")
            except declaracion_ingresos.DoesNotExist:
                print(f"Declaración de ingresos con ID {solicitud.idDeclaracionIngresos} no encontrada")
            except Exception as e:
                print(f"Error obteniendo declaración: {e}")
        
        # ==================== DATOS DE LA CASA ====================
        casa = solicitud.casa
        casa_data = {
            'id': casa.id if casa else None,
            'propietario_id': casa.propietario.id if casa and casa.propietario else None,
            'matriculaInmobiliaria': getattr(casa, 'matriculaInmobiliaria', ''),
            'tipoInmueble': getattr(casa, 'tipoInmueble', ''),
            'usoInmueble': getattr(casa, 'usoInmueble', ''),
            'direccion': getattr(casa, 'direccion', ''),
            'barrio': getattr(casa, 'barrio', ''),
            'ciudad': getattr(casa, 'ciudad', ''),
            'descripcion': getattr(casa, 'descripcion', ''),
            'condiciones': getattr(casa, 'condiciones', ''),
            'con_administracion': getattr(casa, 'con_administracion', False),
            'publicar': getattr(casa, 'publicar', False),
            'conCodeudor': getattr(casa, 'conCodeudor', True),
            'arrendada': getattr(casa, 'arrendada', False),
            'canonmensual': str(casa.canonmensual) if casa and hasattr(casa, 'canonmensual') else None,
            'observacion_canonmensual': getattr(casa, 'observacion_canonmensual', ''),
            'deposito': getattr(casa, 'deposito', 0),
            'observacion_deposito': getattr(casa, 'observacion_deposito', ''),
            'sala': getattr(casa, 'sala', False),
            'observacion_sala': getattr(casa, 'observacion_sala', ''),
            'comedor': getattr(casa, 'comedor', False),
            'observacion_comedor': getattr(casa, 'observacion_comedor', ''),
            'cocina': getattr(casa, 'cocina', False),
            'observacion_cocina': getattr(casa, 'observacion_cocina', ''),
            'habitaciones': getattr(casa, 'habitaciones', False),
            'observacion_habitaciones': getattr(casa, 'observacion_habitaciones', ''),
            'baños': getattr(casa, 'baños', False),
            'observacion_baños': getattr(casa, 'observacion_baños', ''),
            'patio': getattr(casa, 'patio', False),
            'observacion_patio': getattr(casa, 'observacion_patio', ''),
            'garage': getattr(casa, 'garage', False),
            'observacion_garage': getattr(casa, 'observacion_garage', ''),
            'tanquesubterraneo': getattr(casa, 'tanquesubterraneo', False),
            'observacion_tanquesubterraneo': getattr(casa, 'observacion_tanquesubterraneo', ''),
            'ser_agua': getattr(casa, 'ser_agua', False),
            'observacion_ser_agua': getattr(casa, 'observacion_ser_agua', ''),
            'ser_energia': getattr(casa, 'ser_energia', False),
            'observacion_ser_energia': getattr(casa, 'observacion_ser_energia', ''),
            'ser_gas_domiciliario': getattr(casa, 'ser_gas_domiciliario', False),
            'observacion_ser_gas_domiciliario': getattr(casa, 'observacion_ser_gas_domiciliario', ''),
            'ser_bioagricola': getattr(casa, 'ser_bioagricola', False),
            'observacion_ser_bioagricola': getattr(casa, 'observacion_ser_bioagricola', ''),
            'otros': getattr(casa, 'otros', ''),
            'propietario_nombres': f"{propietario_user.first_name} {propietario_user.last_name}" if propietario_user else None,
            'propietario_cedula': getattr(propietario_obj, 'doc_identificacion', ''),
            'propietario_celular': getattr(propietario_obj, 'celular', ''),
            'propietario_email': propietario_user.email if propietario_user else None,
            'propietario_genero': getattr(propietario_obj, 'genero', 'M'),
        }
        
        # ==================== DATOS DEL ARRENDATARIO ====================
        arrendatario_data = {
            'id': arrendatario_obj.id if arrendatario_obj else None,
            'first_name': arrendatario_user.first_name if arrendatario_user else '',
            'last_name': arrendatario_user.last_name if arrendatario_user else '',
            'doc_identificacion': getattr(arrendatario_obj, 'doc_identificacion', ''),
            'lugarExpCedula': getattr(arrendatario_obj, 'lugarExpCedula', ''),
            'celular': getattr(arrendatario_obj, 'celular', ''),
            'email': arrendatario_user.email if arrendatario_user else '',
            'direccion': getattr(arrendatario_obj, 'direccion', ''),
            'barrio': getattr(arrendatario_obj, 'barrio', ''),
            'ciudad': getattr(arrendatario_obj, 'ciudad', ''),
            'genero': getattr(arrendatario_obj, 'genero', 'M'),
            'estadoCivil': getattr(arrendatario_obj, 'estadoCivil', ''),
            'direccionCorrespondencia': getattr(arrendatario_obj, 'direccionCorrespondencia', ''),
            'barrioCorrespondencia': getattr(arrendatario_obj, 'barrioCorrespondencia', ''),
            'ciudadCorrespondencia': getattr(arrendatario_obj, 'ciudadCorrespondencia', ''),
            'ocupacion': getattr(arrendatario_obj, 'ocupacion', ''),
            'empresa': getattr(arrendatario_obj, 'empresa', ''),
        }
        
        # ==================== CONSTRUIR RESPUESTA COMPLETA ====================
        data = {
            # Datos de la solicitud
            'id': solicitud.id,
            'estado': solicitud.estado,
            'fecha_solicitud': solicitud.fecha.strftime('%Y-%m-%d %H:%M:%S') if solicitud.fecha else '',
            'duracionContrato': solicitud.duracionContrato,
            'solicitudRevisada': solicitud.solicitudRevisada,
            'solicitudAtendida': solicitud.solicitudAtendida,
            'solicitudContratada': solicitud.solicitudContratada,
            'comentario_estado': solicitud.comentario_estado or '',
            
            # Garantías
            'seguroArrendamiento': solicitud.seguroArrendamiento,
            'depositoVoluntario': solicitud.depositoVoluntario,
            'valorDepositoVoluntario': solicitud.valorDepositoVoluntario or '',
            'otraGarantiaAcordada': solicitud.otraGarantiaAcrodada,
            'especificacionOtraGarantiaAcordada': solicitud.especificacionOtraGarantiaAcordada or '',
            
            # Mascotas
            'mascotas': solicitud.mascotas,
            'numMascotas': solicitud.numMascotas,
            'tipoMascotas': solicitud.tipoMascotas or '',
            
            # Aceptación
            'aceptaTratamientodeDatos': solicitud.aceptaTratamientodeDatos,
            
            # Documentos (solo nombres de archivo)
            'cedulaArrendatario': solicitud.cedulaArrendatario.url if solicitud.cedulaArrendatario else None,
            'cedulaCodeudor': solicitud.cedulaCodeudor.url if solicitud.cedulaCodeudor else None,
            'cedulasHabitantes': solicitud.cedulasHabitantes.url if solicitud.cedulasHabitantes else None,
            'certificado_laboral_arrendatario': solicitud.certificado_laboral_arrendatario.url if solicitud.certificado_laboral_arrendatario else None,
            'certificado_laboral_codeudor': solicitud.certificado_laboral_codeudor.url if solicitud.certificado_laboral_codeudor else None,
            'desprendible_nomina_arrendatario': solicitud.desprendible_nomina_arrendatario.url if solicitud.desprendible_nomina_arrendatario else None,
            'desprendible_nomina_codeudor': solicitud.desprendible_nomina_codeudor.url if solicitud.desprendible_nomina_codeudor else None,
            'declaracion_renta_arrendatario': solicitud.declaracion_renta_arrendatario.url if solicitud.declaracion_renta_arrendatario else None,
            'declaracion_renta_codeudor': solicitud.declaracion_renta_codeudor.url if solicitud.declaracion_renta_codeudor else None,
            'camara_comercio_arrendatario': solicitud.camara_comercio_arrendatario.url if solicitud.camara_comercio_arrendatario else None,
            'camara_comercio_codeudor': solicitud.camara_comercio_codeudor.url if solicitud.camara_comercio_codeudor else None,
                    
            # Datos relacionados (completos)
            'casa': casa_data,
            'arrendatario': arrendatario_data,
            'coarrendatario': coarrendatario_data,
            'dependientes': dependientes_data,
            'referencias': referencias_data,
            'declaracion_ingresos': declaracion_data,
            
            # Campos adicionales para compatibilidad con VistaPrevia
            'nombres_arrendatario': arrendatario_user.first_name if arrendatario_user else '',
            'apellidos_arrendatario': arrendatario_user.last_name if arrendatario_user else '',
            'doc_identificacion_arrendatario': getattr(arrendatario_obj, 'doc_identificacion', ''),
            'email_arrendatario': arrendatario_user.email if arrendatario_user else '',
            'celular_arrendatario': getattr(arrendatario_obj, 'celular', ''),
            'estado_civil_arrendatario': getattr(arrendatario_obj, 'estadoCivil', ''),
            'direccion': casa_data.get('direccion', ''),
            'ciudad': casa_data.get('ciudad', ''),
            'tipoInmueble': casa_data.get('tipoInmueble', ''),
            'canonmensual': casa_data.get('canonmensual', ''),
        }
        
        print("=== Respuesta construida exitosamente ===")
        return Response(data, status=status.HTTP_200_OK)
        
    except Solicitud.DoesNotExist:
        print(f"Solicitud con ID {solicitud_id} no encontrada")
        return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en obtener_solicitud_publica: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            print(f"=== CREANDO CONTRATO DE VIVIENDA ===")
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


# ============================================================
# VISTAS PARA LISTAR CONTRATOS POR ARRENDATARIO
# ============================================================

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


# ============================================================
# VISTAS PARA CONTRATOS ACTIVOS (GENERAL)
# ============================================================

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


# ============================================================
# VISTA PARA DETALLE DE CONTRATO
# ============================================================

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


# ============================================================
# VISTA PARA ELIMINAR CONTRATO
# ============================================================

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


# ============================================================
# VISTA PARA ACTUALIZAR CONTRATO
# ============================================================

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


# ============================================================
# VISTA PARA SUBIR PDF DE INVENTARIO
# ============================================================

class PDFUploadView(APIView):
    """
    Sube el PDF de inventario para un contrato
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        contrato_id = request.data.get("contratoId")
        inventario = request.FILES.get("inventario")

        if not contrato_id or not inventario:
            return Response(
                {"error": "Contrato ID o archivo no proporcionado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            contrato = contrato_local_vivienda.objects.get(id=contrato_id)
            contrato.pdf_inventario = inventario
            contrato.save()
            
            return Response(
                {"message": "PDF subido exitosamente"},
                status=status.HTTP_200_OK
            )
            
        except contrato_local_vivienda.DoesNotExist:
            return Response(
                {"error": "Contrato no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error en PDFUploadView: {e}")
            return Response(
                {"error": f"Error inesperado: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# VISTA PARA SUBIR PDF DE CONTRATO FIRMADO
# ============================================================

class PDFUploadContratoView(APIView):
    """
    Sube el PDF del contrato firmado
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        contrato_id = request.data.get("contratoId")
        pdf_firmado = request.FILES.get("pdf_firmado")

        if not contrato_id or not pdf_firmado:
            return Response(
                {"error": "Contrato ID o archivo no proporcionado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            contrato = contrato_local_vivienda.objects.get(id=contrato_id)
            contrato.pdf_firmado = pdf_firmado
            contrato.save()
            
            return Response(
                {"message": "PDF subido exitosamente"},
                status=status.HTTP_200_OK
            )
            
        except contrato_local_vivienda.DoesNotExist:
            return Response(
                {"error": "Contrato no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error en PDFUploadContratoView: {e}")
            return Response(
                {"error": f"Error inesperado: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# VISTA PARA FECHAS DE PAGO
# ============================================================

class FechaPagoView(APIView):
    """
    Registra una fecha de pago para un contrato
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, contrato_id):
        try:
            fecha_pago = request.data.get("fecha_pago")
            fechadeMesaPagar = request.data.get("fechadeMesaPagar")
            
            if not fecha_pago:
                return Response(
                    {"error": "fecha_pago es requerido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            contrato = get_object_or_404(contrato_local_vivienda, id=contrato_id)
            
            nueva_fecha_pago = FechaPago.objects.create(
                contrato=contrato,
                fecha_pago=fecha_pago,
                fechadeMesaPagar=fechadeMesaPagar,
                estado_pago="REALIZADO",
            )
            
            return Response(
                {"mensaje": "Fecha de pago registrada correctamente"},
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            print(f"Error en FechaPagoView: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# VISTAS PARA CONTRATOS INCONFORMES
# ============================================================

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


class ReporteInconformidadCreateView(APIView):
    """
    Crea o actualiza un reporte de inconformidad
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)

        try:
            serializer = ReporteInconformidadSerializer(data=request.data)
            
            if serializer.is_valid():
                reporte = serializer.save()

                # Actualizar el estado del contrato
                contrato_id = reporte.reporteinconformidad.id
                contrato = get_object_or_404(contrato_local_vivienda, id=contrato_id)
                contrato.estaFirmado = False
                contrato.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print("Errores de validación:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Error en ReporteInconformidadCreateView: {e}")
            return Response(
                {"detail": f"Error interno: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, *args, **kwargs):
        reporte_id = kwargs.get("pk")
        
        try:
            reporte = get_object_or_404(ReporteInconformidad, id=reporte_id)
            reporte.inconformidadSolucionada = True
            reporte.save()
            
            return Response(
                {"detail": "Inconformidad marcada como solucionada"},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            print(f"Error en ReporteInconformidadCreateView.patch: {e}")
            return Response(
                {"detail": f"Error interno: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# VISTA PARA CONTRATO DETALLE (COMPATIBILIDAD)
# ============================================================

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


# ============================================================
# VISTAS PARA CONTRATOS POR ARRENDATARIO (OTROSÍ)
# ============================================================

class ContratosArrendatariosOtrosi(APIView):
    """
    Obtiene contratos de un arrendatario que requieren firmar otrosí
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, arrendatario_id):
        try:
            # Buscar contratos donde el arrendatario no ha firmado el otrosí
            # Nota: Esto depende de tu modelo otroSi
            existe_contrato = otroSi.objects.filter(
                contrato__arrendatario_id_original=arrendatario_id,
                aceptaOtroSiArrendatario=False,
                aceptaOtroSi=True,
            ).exists()

            return Response({"existe_contrato": existe_contrato}, status=200)
            
        except Exception as e:
            print(f"Error en ContratosArrendatariosOtrosi: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContraArrendatariosOtrosi(APIView):
    """
    Obtiene lista de contratos que requieren otrosí
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, arrendatario_id):
        try:
            contratos = otroSi.objects.filter(
                contrato__arrendatario_id_original=arrendatario_id,
                aceptaOtroSiArrendatario=False,
                aceptaOtroSi=True,
            )

            if contratos.exists():
                serializer = OtroSiSerializer(contratos, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"message": "No se encontraron contratos que cumplan las condiciones."},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            print(f"Error en ContraArrendatariosOtrosi: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContraArrendatariosOtrosiFirmados(APIView):
    """
    Obtiene lista de contratos con otrosí ya firmados
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, arrendatario_id):
        try:
            contratos = otroSi.objects.filter(
                contrato__arrendatario_id_original=arrendatario_id,
                aceptaOtroSiArrendatario=True,
                aceptaOtroSi=True,
            )

            if contratos.exists():
                serializer = OtroSiSerializer(contratos, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"message": "No se encontraron contratos que cumplan las condiciones."},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            print(f"Error en ContraArrendatariosOtrosiFirmados: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContratosActivosOtrosi(APIView):
    """
    Verifica si hay contratos activos que requieren otrosí
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            hoy = date.today()
            
            existe_contrato = contrato_local_vivienda.objects.filter(
                contrato_Activo=True,
                otrosiGenerado=False,
                fechafinOtrosi__lte=hoy + timedelta(days=15),
            ).exists()

            return Response({"existe_contrato": existe_contrato})
            
        except Exception as e:
            print(f"Error en ContratosActivosOtrosi: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# VISTA PARA SOLICITUDES ACEPTADAS NO ATENDIDAS
# ============================================================

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

