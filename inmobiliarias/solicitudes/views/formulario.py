"""Envio del formulario completo de solicitud."""
import json
import traceback

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from arrendatarios.models import (
    coarrendatario,
    declaracion_ingresos,
    dependientes,
    referencias,
)
from inmuebles.models import arrendar
from solicitudes.models import Solicitud
from usuarios.models import arrendatario


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
