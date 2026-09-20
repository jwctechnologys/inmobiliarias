"""Consultas de solicitudes para el arrendatario y para el publico."""

from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from arrendatarios.models import (
    coarrendatario,
    declaracion_ingresos,
    dependientes,
    referencias,
)
from solicitudes.models import Solicitud


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
                        from .models import (
                            coarrendatario,  # Importa tu modelo de coarrendatario
                        )
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
