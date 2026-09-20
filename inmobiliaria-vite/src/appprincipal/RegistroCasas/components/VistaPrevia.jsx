// components/VistaPrevia.jsx
import React from 'react';

const VistaPrevia = ({ 
    casaInfo, 
    perfilArrendatario, 
    formData, 
    datosExistentes, 
    aceptado, 
    loading, 
    errorSubmit,
    detallesError,
    onClose, 
    onSubmit, 
    onPrint,
    renderError
}) => {
    console.log("perfil", perfilArrendatario);
    
    // Función para obtener datos del coarrendatario
    const getCoarrendatarioData = () => {
        // Si está creando un nuevo coarrendatario y tiene nombre
        if (formData.crearNuevoCoarrendatario && formData.coarrendatarioNuevo.first_name) {
            return formData.coarrendatarioNuevo;
        }
        // Si hay un coarrendatario seleccionado
        if (formData.coarrendatarioSeleccionado) {
            // Buscar primero en datosEditados (que contiene los cambios en tiempo real)
            const co = datosExistentes.coarrendatarios.find(c => c.id === formData.coarrendatarioSeleccionado);
            if (co) {
                // Si existe en datosEditados, usar esos datos (pueden ser más recientes que formData.coarrendatarioNuevo)
                return co;
            }
            // Si no está en datosEditados, buscar en datosExistentes originales
            const coOriginal = datosExistentes.coarrendatarios.find(c => c.id === formData.coarrendatarioSeleccionado);
            return coOriginal || {};
        }
        return {};
    };

    // Función para obtener todos los dependientes (seleccionados + nuevos)
    const getTodosDependientes = () => {
        const todos = [];
        
        // Agregar dependientes seleccionados (usar datosEditados si están disponibles)
        if (formData.dependientesSeleccionados) {
            formData.dependientesSeleccionados.forEach(id => {
                // Buscar primero en datosEditados
                let dep = datosExistentes.dependientes.find(d => d.id === id);
                if (!dep) {
                    // Si no está en datosEditados, buscar en datosExistentes originales
                    dep = datosExistentes.dependientes.find(d => d.id === id);
                }
                if (dep) todos.push(dep);
            });
        }
        
        // Agregar dependientes nuevos
        if (formData.dependientesNuevos) {
            formData.dependientesNuevos.forEach(dep => {
                if (dep.first_name) {
                    todos.push({
                        ...dep,
                        id: dep.id,
                        first_name: dep.first_name,
                        last_name: dep.last_name,
                        edad: dep.edad,
                        tipo_documento: dep.tipo_documento,
                        doc_identificacion: dep.doc_identificacion,
                        lugarExpCedula: dep.lugarExpCedula,
                        ocupacion: dep.ocupacion,
                        parentezco: dep.parentezco
                    });
                }
            });
        }
        
        return todos;
    };

    // Función para obtener todas las referencias (seleccionadas + nuevas)
    const getTodasReferencias = () => {
        const todas = [];
        
        // Agregar referencias seleccionadas
        if (formData.referenciasSeleccionadas) {
            formData.referenciasSeleccionadas.forEach(id => {
                // Buscar primero en datosEditados
                let ref = datosExistentes.referencias.find(r => r.id === id);
                if (!ref) {
                    // Si no está en datosEditados, buscar en datosExistentes originales
                    ref = datosExistentes.referencias.find(r => r.id === id);
                }
                if (ref) todas.push(ref);
            });
        }
        
        // Agregar referencias nuevas
        if (formData.referenciasNuevas) {
            formData.referenciasNuevas.forEach(ref => {
                if (ref.first_name) {
                    todas.push(ref);
                }
            });
        }
        
        return todas;
    };

    const coarrendatarioData = getCoarrendatarioData();
    const todosDependientes = getTodosDependientes();
    const todasReferencias = getTodasReferencias();

    // Función para formatear número con puntos
    const formatNumber = (num) => {
        if (!num) return '0';
        return new Intl.NumberFormat('es-CO').format(num);
    };

    // Función para obtener el texto del parentezco
    const getParentezcoTexto = (parentezco) => {
        if (!parentezco) return '_________________';
        const map = {
            'conyuge': 'Cónyuge',
            'codeudor_familiar': 'Codeudor (Familiar)',
            'codeudor_amigo': 'Codeudor (Amigo)',
            'otro': 'Otro',
            'hermano': 'Hermano/a',
            'padre': 'Padre/Madre',
            'hijo': 'Hijo/a',
            'familiar': 'Familiar',
            'amigo': 'Amigo/a',
            'vecino': 'Vecino/a',
            'compañero': 'Compañero/a'
        };
        return map[parentezco] || parentezco;
    };

    // Función para obtener el texto del tipo de contrato
    const getTipoContratoTexto = (tipo) => {
        if (!tipo) return '_________________';
        const map = {
            'indefinido': 'Indefinido',
            'termino_fijo': 'Término fijo',
            'prestacion_servicios': 'Prestación de servicios',
            'Independiente': 'Independiente',
            'obra_labor': 'Obra o labor',
            'aprendizaje': 'Aprendizaje'
        };
        return map[tipo] || tipo;
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-purple-600 px-6 py-4 flex justify-between items-center no-print">
                        <div>
                            <h1 className="text-2xl font-bold text-white">FORMATO DE SOLICITUD Y ESTUDIO DE SEGURIDAD PARA ARRENDAMIENTO</h1>
                            <p className="text-purple-100 mt-1">Vista previa - Verifique la información</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-white hover:text-purple-200"
                            disabled={loading}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-8" id="solicitud-pdf">
                        <style>
                            {`
                            #solicitud-pdf, #solicitud-pdf * {
                                font-family: Arial, sans-serif !important;
                            }
                            #solicitud-pdf {
                                font-size: 12pt !important;
                                line-height: 1.2 !important;
                            }
                            #solicitud-pdf h1 {
                                font-size: 14pt !important;
                                font-weight: bold !important;
                                margin: 0 0 6px 0 !important;
                                padding: 0 !important;
                            }
                            #solicitud-pdf h2 {
                                font-size: 12pt !important;
                                font-weight: bold !important;
                                border-bottom: 1px solid #9ca3af !important;
                                margin: 0 0 4px 0 !important;
                                padding: 0 !important;
                            }
                            #solicitud-pdf p, #solicitud-pdf .text-justify {
                                text-align: justify !important;
                                font-size: 12pt !important;
                                margin: 0 0 2px 0 !important;
                            }
                            #solicitud-pdf .garantia-texto {
                                text-align: justify !important;
                                font-size: 12pt !important;
                            }
                            #solicitud-pdf table {
                                border-collapse: collapse !important;
                                width: 100% !important;
                            }
                            #solicitud-pdf th, #solicitud-pdf td {
                                border: 1px solid #9ca3af !important;
                                padding: 2px 6px !important;
                                line-height: 1.2 !important;
                            }
                            @media print {
                                @page {
                                    margin: 1.8cm 1.5cm 1.5cm 1.5cm !important;
                                    size: auto;
                                }
                                #solicitud-pdf {
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    box-shadow: none !important;
                                    background: white !important;
                                }
                                .no-print {
                                    display: none !important;
                                }
                                .print-break {
                                    page-break-after: always !important;
                                }
                            }
                            `}
                        </style>

                        {/* Mostrar errores del submit */}
                        {errorSubmit && renderError && renderError(errorSubmit, detallesError)}

                        {/* Título principal */}
                        <div className="text-center mb-3">
                            <h1>FORMATO DE SOLICITUD Y ESTUDIO DE SEGURIDAD PARA ARRENDAMIENTO</h1>
                        </div>

                        {/* 1. INFORMACIÓN GENERAL DEL INMUEBLE */}
                        <div className="mb-3">
                            <h2>1. INFORMACIÓN GENERAL DEL INMUEBLE</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                                <div><span style={{ fontWeight: 'bold' }}>Ciudad:</span> {casaInfo?.ciudad || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Fecha:</span> {new Date().toISOString().split('T')[0]}</div>
                                <div className="col-span-2"><span style={{ fontWeight: 'bold' }}>Dirección del inmueble:</span> {casaInfo?.direccion || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Tipo de inmueble:</span> {casaInfo?.tipoInmueble || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Uso del inmueble:</span> {casaInfo?.usoInmueble || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Canon de arrendamiento:</span> ${formatNumber(casaInfo?.canonmensual || 0)}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Duración del contrato:</span> {formData.duracionContrato} meses</div>
                            </div>
                        </div>

                        {/* 2. DATOS DEL ARRENDATARIO */}
                        <div className="mb-3">
                            <h2>2. DATOS DEL ARRENDATARIO</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                                <div className="col-span-2"><span style={{ fontWeight: 'bold' }}>Nombres y apellidos completos:</span> {perfilArrendatario?.first_name} {perfilArrendatario?.last_name}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Cédula de ciudadanía:</span> {perfilArrendatario?.doc_identificacion || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Estado civil:</span> {perfilArrendatario?.estadoCivil || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>E-mail:</span> {perfilArrendatario?.email || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Número de celular:</span> {perfilArrendatario?.celular || '_________________'}</div>
                            </div>
                        </div>

                        {/* 3. INFORMACIÓN LABORAL */}
                        <div className="mb-3">
                            <h2>3. INFORMACIÓN LABORAL Y DECLARACIÓN DE INGRESOS</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                                <div className="col-span-2"><span style={{ fontWeight: 'bold' }}>Entidad / Empresa donde labora:</span> {formData?.empresa_laboral || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Cargo:</span> {perfilArrendatario?.ocupacion || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Tipo de contrato:</span> {getTipoContratoTexto(formData.tipoContrato)}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Jefe inmediato:</span> {formData.jefeInmediato || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Tiempo laboral:</span> {formData.tiempoLaboral || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Salario básico mensual:</span> ${formatNumber(formData.salarioBasicoMensual || 0)}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Otros ingresos:</span> ${formatNumber(formData.otrosIngresos || 0)}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Teléfono empresa:</span> {formData.telefonoEmpresa || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Dirección:</span> {formData.direccion_laboral || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Declara Renta:</span> {formData.declaraRenta ? 'Sí' : 'No'}</div>
                            </div>
                        </div>

                        {/* 4. COARRENDATARIO */}
                        <div className="mb-3">
                            <h2>4. COARRENDATARIO / CÓNYUGE</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                                <div className="col-span-2"><span style={{ fontWeight: 'bold' }}>Nombre completo:</span> {coarrendatarioData.first_name || ''} {coarrendatarioData.last_name || ''}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Tipo de documento:</span> {coarrendatarioData.tipo_documento || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Nro:</span> {coarrendatarioData.doc_identificacion || coarrendatarioData.n_cedula || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Lugar de expedición:</span> {coarrendatarioData.lugarExpCedula || '_________________'}</div>
                                <div className="col-span-2"><span style={{ fontWeight: 'bold' }}>Parentesco / vínculo:</span> {getParentezcoTexto(coarrendatarioData.parentezco)}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Celular:</span> {coarrendatarioData.celular || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Correo electrónico:</span> {coarrendatarioData.email || '_________________'}</div>
                                <div className="col-span-2"><span style={{ fontWeight: 'bold' }}>Dirección de Residencia:</span> {coarrendatarioData.direccion || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Barrio:</span> {coarrendatarioData.barrio || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Ciudad:</span> {coarrendatarioData.ciudad || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Entidad donde labora:</span> {coarrendatarioData.empresa || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Cargo:</span> {coarrendatarioData.ocupacion || '_________________'}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Ingresos mensuales Totales:</span> ${formatNumber(coarrendatarioData.ingresosMensualesTotales || 0)}</div>
                                <div><span style={{ fontWeight: 'bold' }}>Declara Renta:</span> {coarrendatarioData.declaraRenta ? 'Sí' : 'No'}</div>
                            </div>
                        </div>

                        {/* 4A. GARANTÍAS */}
                        <div className="mb-3">
                            <h2>4A. GARANTÍAS OFRECIDAS POR EL INTERESADO (OBLIGATORIO)</h2>
                            <p style={{ marginBottom: '2px', textAlign: 'justify' }}>El interesado en el arrendamiento manifiesta que, además del codeudor, se compromete a seleccionar y cumplir al menos una (1) de las siguientes garantías adicionales, las cuales estarán sujetas a estudio y aprobación por parte del ARRENDADOR:</p>
                            <div>
                                <div className="flex items-start" style={{ marginBottom: '2px' }}>
                                    <span style={{ marginRight: '0.5rem' }}>{formData.seguroArrendamiento ? '☒' : '☐'}</span>
                                    <span className="garantia-texto">Aplicar y ser aprobado en Seguro de Arrendamiento (la Aseguradora será Seleccionada por el Arrendador). en caso de que EL ARRENDATARIO opte por constituir como garantía un seguro de arrendamiento y resulte aprobado por la entidad aseguradora, este asumirá el pago del cincuenta por ciento (50 %) del valor total del seguro, como condición para la suscripción y vigencia del contrato, aceptando expresamente dicho porcentaje.</span>
                                </div>
                                <div className="flex items-start" style={{ marginBottom: '2px' }}>
                                    <span style={{ marginRight: '0.5rem' }}>{formData.depositoVoluntario ? '☒' : '☐'}</span>
                                    <span className="garantia-texto">Depósito voluntario propuesto por el interesado como garantía, equivalente a ${formatNumber(formData.valorDepositoVoluntario || 0)}. "El interesado manifiesta que, en caso de optar por un depósito voluntario como garantía adicional, este será de carácter reembolsable, sujeto al cumplimiento total de las obligaciones contractuales al momento de la terminación del contrato, conforme a las condiciones que se establecerán de manera definitiva en el contrato de arrendamiento".</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ marginRight: '0.5rem' }}>{formData.otraGarantiaAcordada ? '☒' : '☐'}</span>
                                    <span className="garantia-texto">Otra garantía acordada: {formData.especificacionOtraGarantiaAcordada || '___________________________'}. El interesado entiende que la no aprobación o no constitución efectiva de la garantía seleccionada dará lugar a la no continuidad del proceso de arrendamiento, sin que ello genere obligación alguna para el ARRENDADOR.</span>
                                </div>
                            </div>
                        </div>

                        {/* 5. PERSONAS QUE HABITARÁN EL INMUEBLE */}
                        <div className="mb-3">
                            <h2>5. PERSONAS QUE HABITARÁN EL INMUEBLE</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Nombre completo</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Edad</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Documento</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Nº Identificación</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Lugar expedición</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Ocupación</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Parentesco</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todosDependientes.length > 0 ? (
                                        todosDependientes.map((dep, idx) => (
                                            <tr key={idx}>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{dep.first_name} {dep.last_name}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{dep.edad || ''}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{dep.tipo_documento || ''}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{dep.doc_identificacion || ''}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{dep.lugarExpCedula || ''}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{dep.ocupacion || ''}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{dep.parentezco || ''}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        [...Array(4)].map((_, idx) => (
                                            <tr key={idx}>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '2px' }}>
                                <span style={{ fontWeight: 'bold' }}>¿Habitarán mascotas?</span> {formData.mascotas ? 'Sí' : 'No'}
                                {formData.mascotas && (
                                    <span> Tipo: {formData.tipoMascotas || '______'} Cantidad: {formData.numMascotas || '______'}</span>
                                )}
                            </div>
                        </div>

                        {/* 6. REFERENCIAS */}
                        <div className="mb-3">
                            <h2>6. REFERENCIAS</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Nombre completo</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Parentesco</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Teléfono</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Dirección Residencia</th>
                                        <th style={{ border: '1px solid #9ca3af', padding: '2px 6px', textAlign: 'left', fontWeight: 'bold' }}>Ocupación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todasReferencias.length > 0 ? (
                                        todasReferencias.map((ref, idx) => (
                                            <tr key={idx}>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{ref.first_name} {ref.last_name}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{getParentezcoTexto(ref.parentezco)}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{ref.celular || ''}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{ref.dir_residencia || ''}</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>{ref.ocupacion || ''}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        [...Array(3)].map((_, idx) => (
                                            <tr key={idx}>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                                <td style={{ border: '1px solid #9ca3af', padding: '2px 6px' }}>&nbsp;</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '2px' }}>
                                <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '2px' }}>Referencia de arrendador anterior (si aplica)</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                                    <div><span style={{ fontWeight: 'bold' }}>Nombre:</span> {formData.nombreArrendadorAnterior || '___________________________'}</div>
                                    <div><span style={{ fontWeight: 'bold' }}>Teléfono:</span> {formData.telefonoArrendadorAnterior || '___________________________'}</div>
                                    <div className="col-span-2"><span style={{ fontWeight: 'bold' }}>Dirección inmueble:</span> {formData.direccionArrendadorAnterior || '___________________________'}</div>
                                    <div className="col-span-2"><span style={{ fontWeight: 'bold' }}>Motivo de retiro:</span> {formData.motivoRetiro || '___________________________'}</div>
                                </div>
                            </div>
                        </div>

                        {/* 7. DOCUMENTOS ANEXOS */}
                        <div className="mb-3">
                            <h2>7. DOCUMENTOS ANEXOS (MARQUE CON X)</h2>
                            <div>
                                <div>{formData.documentos.cedulaArrendatario && formData.documentos.cedulaCodeudor ? '☒' : '☐'} Copias cédulas (del arrendatario, codeudor, y las personas mayores de edad que van habitar el inmueble).</div>
                                <div>{(formData.documentos.certificado_laboral_arrendatario || formData.documentos.certificado_laboral_codeudor) ? '☒' : '☐'} Certificado laboral (del arrendatario y codeudor)</div>
                                <div>{(formData.documentos.desprendible_nomina_arrendatario || formData.documentos.desprendible_nomina_codeudor) ? '☒' : '☐'} Desprendibles de nómina (del arrendatario y codeudor)</div>
                                <div>{((formData.declaraRenta && formData.documentos.declaracion_renta_arrendatario) || (coarrendatarioData.declaraRenta && formData.documentos.declaracion_renta_codeudor)) ? '☒' : '☐'} Declaración de renta (si aplica) del arrendatario y codeudor</div>
                                <div>{(formData.documentos.camara_comercio_arrendatario || formData.documentos.camara_comercio_codeudor) ? '☒' : '☐'} Cámara de comercio (independientes) del arrendatario y codeudor</div>
                            </div>
                        </div>

                        {/* 8. AUTORIZACIÓN Y TRATAMIENTO DE DATOS */}
                        <div className="mb-3">
                            <h2>8. AUTORIZACIÓN Y TRATAMIENTO DE DATOS</h2>
                            <p style={{ margin: 0, textAlign: 'justify' }}>
                                Autorizo de manera libre, previa y voluntaria al ARRENDADOR o a quien represente sus intereses, para
                                verificar, consultar y reportar la información suministrada en este formulario, incluyendo consultas en
                                centrales de riesgo crediticio, bases de datos públicas y privadas, verificación laboral, de contacto,
                                judicial y comercial, conforme a la Ley 1581 de 2012 y normas concordantes.
                                <br /><br />
                                Declaro que la información suministrada es veraz y entiendo que la diligencia de este formulario no
                                implica obligación alguna de celebrar contrato de arrendamiento.
                            </p>
                        </div>

                        {/* Firmas */}
                        <div style={{ borderTop: '1px solid #9ca3af', marginTop: '8px', paddingTop: '8px' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
                                {/* Arrendatario */}
                                <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '2px' }}>Arrendatario</p>
                                            <div>
                                                <p style={{ margin: 0, whiteSpace: 'nowrap' }}>
                                                    Firma: ___________________
                                                </p>
                                                <p style={{ margin: 0, marginTop: '2px', whiteSpace: 'nowrap' }}>
                                                    C.C. {perfilArrendatario?.doc_identificacion || '_________________'}
                                                </p>
                                                <p style={{ margin: 0, marginTop: '2px', fontSize: '10pt', color: '#6b7280' }}>
                                                    {perfilArrendatario?.first_name} {perfilArrendatario?.last_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ width: '60px', height: '75px', border: '1px solid #9ca3af', borderRadius: '4px', marginTop: '2px', flexShrink: 0 }}></div>
                                    </div>
                                </div>

                                {/* Codeudor */}
                                <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '2px' }}>Codeudor</p>
                                            <div>
                                                <p style={{ margin: 0, whiteSpace: 'nowrap' }}>
                                                    Firma: ___________________
                                                </p>
                                                <p style={{ margin: 0, marginTop: '2px', whiteSpace: 'nowrap' }}>
                                                    C.C. {coarrendatarioData.doc_identificacion || coarrendatarioData.n_cedula || '_________________'}
                                                </p>
                                                <p style={{ margin: 0, marginTop: '2px', fontSize: '10pt', color: '#6b7280' }}>
                                                    {coarrendatarioData.first_name} {coarrendatarioData.last_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ width: '60px', height: '75px', border: '1px solid #9ca3af', borderRadius: '4px', marginTop: '2px', flexShrink: 0 }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pie de página para impresión */}
                        <div className="text-center text-xs text-gray-400 mt-4 no-print">
                            <p>Documento generado desde el sistema de solicitudes de arrendamiento</p>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="p-6 border-t flex flex-col sm:flex-row gap-3 justify-between no-print">
                        <button 
                            type="button" 
                            onClick={onPrint} 
                            className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50"
                            disabled={loading}
                        >
                            🖨️ Imprimir Solicitud
                        </button>
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                disabled={loading}
                            >
                                Editar
                            </button>
                            <button 
                                type="button" 
                                onClick={onSubmit} 
                                disabled={!aceptado || loading} 
                                className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${
                                    loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    'Confirmar y Enviar'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Barra de progreso cuando está cargando */}
                    {loading && (
                        <div className="px-6 pb-4 no-print">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-purple-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">Enviando solicitud... Por favor espere</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VistaPrevia;