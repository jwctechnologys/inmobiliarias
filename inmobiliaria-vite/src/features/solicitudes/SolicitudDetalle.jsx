// SolicitudDetalle.jsx - Versión con formato original (líneas vacías)
import React, { useState } from 'react';
import DocumentViewer from './DocumentViewer';
import { API_URL } from '../../config';

const SolicitudDetalle = ({ solicitud, casaInfo, onClose }) => {
    const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
    const [nombreDocumento, setNombreDocumento] = useState('');
    const [errorDocumento, setErrorDocumento] = useState(null);

    // ==================== FUNCIONES DE FORMATEO ====================
    const formatNumber = (num) => {
        if (!num) return '0';
        return new Intl.NumberFormat('es-CO').format(num);
    };

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

    const formatFecha = (fechaString) => {
        if (!fechaString) return 'Fecha no disponible';
        try {
            const fecha = new Date(fechaString);
            if (isNaN(fecha.getTime())) return 'Fecha no disponible';
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha no disponible';
        }
    };

    // En SolicitudDetalle.jsx - Función abrirDocumento corregida
    const abrirDocumento = (url, nombre) => {
        if (!url) {
            setErrorDocumento('El documento no está disponible');
            return;
        }

        console.log('URL original del documento:', url);

        // Limpiar la URL de duplicados
        let cleanUrl = url;

        // 1. Eliminar duplicado de 'inmobiliarias'
        if (cleanUrl.includes('/inmobiliarias/inmobiliarias/')) {
            cleanUrl = cleanUrl.replace('/inmobiliarias/inmobiliarias/', '/inmobiliarias/');
        }

        // 2. Eliminar duplicado de 'media/media/'
        if (cleanUrl.includes('/media/media/')) {
            cleanUrl = cleanUrl.replace('/media/media/', '/media/');
        }

        // 3. Si la URL es relativa (empieza con /), agregar el dominio completo
        if (cleanUrl.startsWith('/')) {
            // Usar la URL base de tu backend
            const baseUrl = 'https://qmanda360.com'; // o usa API_URL
            cleanUrl = `${baseUrl}${cleanUrl}`;
        }

        console.log('URL limpiada:', cleanUrl);

        // Abrir en nueva pestaña con _blank
        window.open(cleanUrl, '_blank');
    };
    const tieneDocumento = (url) => {
        return url && url !== null && url !== '' && url !== 'null' && url !== 'undefined';
    };

    // ==================== EXTRACCIÓN DE DATOS ====================
    const data = solicitud;

    const coarrendatario = data.coarrendatario || {};
    const dependientes = data.dependientes || [];
    const referencias = data.referencias || [];
    const declaracion = data.declaracion_ingresos || {};
    const arrendatario = data.arrendatario || {};
    const casa = data.casa || casaInfo || {};

    // CORREGIDO: Usar el nombre correcto del campo
    const tieneSeguro = data.seguroArrendamiento === true;
    const tieneDeposito = data.depositoVoluntario === true;
    const tieneOtraGarantia = data.otraGarantiaAcrodada === true || data.otraGarantiaAcordada === true;

    const tieneDatosCompletos = arrendatario.first_name || arrendatario.last_name || arrendatario.doc_identificacion;

    // ==================== RENDER ====================
    return (
        <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* Encabezado */}
            <div className="bg-purple-600 px-4 py-3 flex justify-between items-center">
                <h4 className="text-white font-semibold text-sm">
                    FORMATO DE SOLICITUD Y ESTUDIO DE SEGURIDAD PARA ARRENDAMIENTO
                </h4>
                <button
                    onClick={onClose}
                    className="text-white hover:text-purple-200 text-lg"
                >
                    ✕
                </button>
            </div>

            <div className="p-4 text-sm">
                {/* 1. INFORMACIÓN GENERAL DEL INMUEBLE */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">1. INFORMACIÓN GENERAL DEL INMUEBLE</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                        <div><span className="font-bold">Ciudad:</span> {casa.ciudad || '_________________'}</div>
                        <div><span className="font-bold">Fecha:</span> {formatFecha(data.fecha_solicitud || data.fecha || new Date().toISOString())}</div>
                        <div className="col-span-2"><span className="font-bold">Dirección del inmueble:</span> {casa.direccion || '_________________'}</div>
                        <div><span className="font-bold">Tipo de inmueble:</span> {casa.tipoInmueble || '_________________'}</div>
                        <div><span className="font-bold">Uso del inmueble:</span> {casa.usoInmueble || '_________________'}</div>
                        <div><span className="font-bold">Canon de arrendamiento:</span> ${formatNumber(casa.canonmensual || 0)}</div>
                        <div><span className="font-bold">Duración del contrato:</span> {data.duracionContrato || 12} meses</div>
                    </div>
                </div>

                {/* 2. DATOS DEL ARRENDATARIO */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">2. DATOS DEL ARRENDATARIO</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                        <div className="col-span-2"><span className="font-bold">Nombres y apellidos completos:</span> {tieneDatosCompletos ? `${arrendatario.first_name || ''} ${arrendatario.last_name || ''}` : '_________________'}</div>
                        <div><span className="font-bold">Cédula de ciudadanía:</span> {arrendatario.doc_identificacion || '_________________'}</div>
                        <div><span className="font-bold">Estado civil:</span> {arrendatario.estadoCivil || '_________________'}</div>
                        <div><span className="font-bold">E-mail:</span> {arrendatario.email || '_________________'}</div>
                        <div><span className="font-bold">Número de celular:</span> {arrendatario.celular || '_________________'}</div>
                    </div>
                </div>

                {/* 3. INFORMACIÓN LABORAL */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">3. INFORMACIÓN LABORAL Y DECLARACIÓN DE INGRESOS</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                        <div className="col-span-2"><span className="font-bold">Entidad / Empresa donde labora:</span> {declaracion.empresa || arrendatario.empresa || '_________________'}</div>
                        <div><span className="font-bold">Cargo:</span> {declaracion.ocupacion || arrendatario.ocupacion || '_________________'}</div>
                        <div><span className="font-bold">Tipo de contrato:</span> {getTipoContratoTexto(declaracion.tipoContrato)}</div>
                        <div><span className="font-bold">Jefe inmediato:</span> {declaracion.jefeInmediato || '_________________'}</div>
                        <div><span className="font-bold">Tiempo laboral:</span> {declaracion.tiempoLaboral || '_________________'}</div>
                        <div><span className="font-bold">Salario básico mensual:</span> ${formatNumber(declaracion.salarioBasicoMensual || 0)}</div>
                        <div><span className="font-bold">Otros ingresos:</span> ${formatNumber(declaracion.otrosIngresos || 0)}</div>
                        <div><span className="font-bold">Teléfono empresa:</span> {declaracion.telefonoEmpresa || '_________________'}</div>
                        <div><span className="font-bold">Dirección:</span> {declaracion.direccion_laboral || '_________________'}</div>
                        <div><span className="font-bold">Declara Renta:</span> {declaracion.declaraRenta ? 'Sí' : 'No'}</div>
                    </div>
                </div>

                {/* 4. COARRENDATARIO */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">4. COARRENDATARIO / CÓNYUGE</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                        <div className="col-span-2"><span className="font-bold">Nombre completo:</span> {coarrendatario.first_name || coarrendatario.nombres || '_________________'} {coarrendatario.last_name || coarrendatario.apellidos || ''}</div>
                        <div><span className="font-bold">Tipo de documento:</span> {coarrendatario.tipo_documento || '_________________'}</div>
                        <div><span className="font-bold">Nro:</span> {coarrendatario.doc_identificacion || '_________________'}</div>
                        <div><span className="font-bold">Lugar de expedición:</span> {coarrendatario.lugarExpCedula || '_________________'}</div>
                        <div className="col-span-2"><span className="font-bold">Parentesco / vínculo:</span> {getParentezcoTexto(coarrendatario.parentezco)}</div>
                        <div><span className="font-bold">Celular:</span> {coarrendatario.celular || '_________________'}</div>
                        <div><span className="font-bold">Correo electrónico:</span> {coarrendatario.email || '_________________'}</div>
                        <div className="col-span-2"><span className="font-bold">Dirección de Residencia:</span> {coarrendatario.direccion || '_________________'}</div>
                        <div><span className="font-bold">Barrio:</span> {coarrendatario.barrio || '_________________'}</div>
                        <div><span className="font-bold">Ciudad:</span> {coarrendatario.ciudad || '_________________'}</div>
                        <div><span className="font-bold">Entidad donde labora:</span> {coarrendatario.empresa || '_________________'}</div>
                        <div><span className="font-bold">Cargo:</span> {coarrendatario.ocupacion || '_________________'}</div>
                        <div><span className="font-bold">Ingresos mensuales Totales:</span> ${formatNumber(coarrendatario.ingresosMensualesTotales || 0)}</div>
                        <div><span className="font-bold">Declara Renta:</span> {coarrendatario.declaraRenta ? 'Sí' : 'No'}</div>
                    </div>
                </div>

                {/* 4A. GARANTÍAS OFRECIDAS - CORREGIDO */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">4A. GARANTÍAS OFRECIDAS POR EL INTERESADO (OBLIGATORIO)</h5>
                    <p className="text-justify mb-1">
                        El interesado en el arrendamiento manifiesta que, además del codeudor, se compromete a seleccionar y cumplir al menos una (1) de las siguientes garantías adicionales, las cuales estarán sujetas a estudio y aprobación por parte del ARRENDADOR:
                    </p>
                    <div>
                        <div className="flex items-start mb-0.5">
                            <span className="mr-2">{tieneSeguro ? '☒' : '☐'}</span>
                            <span className="text-justify">Aplicar y ser aprobado en Seguro de Arrendamiento (la Aseguradora será Seleccionada por el Arrendador). en caso de que EL ARRENDATARIO opte por constituir como garantía un seguro de arrendamiento y resulte aprobado por la entidad aseguradora, este asumirá el pago del cincuenta por ciento (50 %) del valor total del seguro, como condición para la suscripción y vigencia del contrato, aceptando expresamente dicho porcentaje.</span>
                        </div>
                        <div className="flex items-start mb-0.5">
                            <span className="mr-2">{tieneDeposito ? '☒' : '☐'}</span>
                            <span className="text-justify">Depósito voluntario propuesto por el interesado como garantía, equivalente a ${formatNumber(data.valorDepositoVoluntario || 0)}. "El interesado manifiesta que, en caso de optar por un depósito voluntario como garantía adicional, este será de carácter reembolsable, sujeto al cumplimiento total de las obligaciones contractuales al momento de la terminación del contrato, conforme a las condiciones que se establecerán de manera definitiva en el contrato de arrendamiento".</span>
                        </div>
                        <div className="flex items-start">
                            <span className="mr-2">{tieneOtraGarantia ? '☒' : '☐'}</span>
                            <span className="text-justify">Otra garantía acordada: {data.especificacionOtraGarantiaAcordada || '___________________________'}. El interesado entiende que la no aprobación o no constitución efectiva de la garantía seleccionada dará lugar a la no continuidad del proceso de arrendamiento, sin que ello genere obligación alguna para el ARRENDADOR.</span>
                        </div>
                    </div>
                </div>

                {/* 5. PERSONAS QUE HABITARÁN EL INMUEBLE - Formato original con líneas vacías */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">5. PERSONAS QUE HABITARÁN EL INMUEBLE</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Nombre completo</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Edad</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Documento</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Nº Identificación</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Lugar expedición</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Ocupación</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Parentesco</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dependientes && dependientes.length > 0 ? (
                                    dependientes.map((dep, idx) => (
                                        <tr key={idx}>
                                            <td className="border border-gray-300 p-1">{dep.first_name || dep.nombres || ''} {dep.last_name || dep.apellidos || ''}</td>
                                            <td className="border border-gray-300 p-1">{dep.edad || ''}</td>
                                            <td className="border border-gray-300 p-1">{dep.tipo_documento || ''}</td>
                                            <td className="border border-gray-300 p-1">{dep.doc_identificacion || ''}</td>
                                            <td className="border border-gray-300 p-1">{dep.lugarExpCedula || ''}</td>
                                            <td className="border border-gray-300 p-1">{dep.ocupacion || ''}</td>
                                            <td className="border border-gray-300 p-1">{dep.parentezco || ''}</td>
                                        </tr>
                                    ))
                                ) : (
                                    // Formato original: líneas vacías
                                    [...Array(4)].map((_, idx) => (
                                        <tr key={idx}>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-1">
                        <span className="font-bold">¿Habitarán mascotas?</span> {data.mascotas ? 'Sí' : 'No'}
                        {data.mascotas && (
                            <span> Tipo: {data.tipoMascotas || '______'} Cantidad: {data.numMascotas || '______'}</span>
                        )}
                    </div>
                </div>

                {/* 6. REFERENCIAS - Formato original con líneas vacías */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">6. REFERENCIAS</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Nombre completo</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Parentesco</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Teléfono</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Dirección Residencia</th>
                                    <th className="border border-gray-300 p-1 text-left font-bold">Ocupación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referencias && referencias.length > 0 ? (
                                    referencias.map((ref, idx) => (
                                        <tr key={idx}>
                                            <td className="border border-gray-300 p-1">{ref.first_name || ref.nombres || ''} {ref.last_name || ref.apellidos || ''}</td>
                                            <td className="border border-gray-300 p-1">{getParentezcoTexto(ref.parentezco)}</td>
                                            <td className="border border-gray-300 p-1">{ref.celular || ''}</td>
                                            <td className="border border-gray-300 p-1">{ref.dir_residencia || ''}</td>
                                            <td className="border border-gray-300 p-1">{ref.ocupacion || ''}</td>
                                        </tr>
                                    ))
                                ) : (
                                    // Formato original: líneas vacías
                                    [...Array(3)].map((_, idx) => (
                                        <tr key={idx}>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                            <td className="border border-gray-300 p-1">&nbsp;</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-1">
                        <p className="font-bold mb-0.5">Referencia de arrendador anterior (si aplica)</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                            <div><span className="font-bold">Nombre:</span> {data.nombreArrendadorAnterior || '___________________________'}</div>
                            <div><span className="font-bold">Teléfono:</span> {data.telefonoArrendadorAnterior || '___________________________'}</div>
                            <div className="col-span-2"><span className="font-bold">Dirección inmueble:</span> {data.direccionArrendadorAnterior || '___________________________'}</div>
                            <div className="col-span-2"><span className="font-bold">Motivo de retiro:</span> {data.motivoRetiro || '___________________________'}</div>
                        </div>
                    </div>
                </div>

                {/* 7. DOCUMENTOS ANEXOS */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">7. DOCUMENTOS ANEXOS (HAGA CLICK PARA VER)</h5>
                    <div className="space-y-1">
                        {/* Cédula Arrendatario */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.cedulaArrendatario) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.cedulaArrendatario) && abrirDocumento(data.cedulaArrendatario, 'Cédula Arrendatario')}
                        >
                            <span className="mr-2">{tieneDocumento(data.cedulaArrendatario) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.cedulaArrendatario) ? 'underline' : ''}>
                                Copias cédulas (del arrendatario, codeudor, y las personas mayores de edad que van habitar el inmueble)
                                {tieneDocumento(data.cedulaArrendatario) && ' 📎'}
                            </span>
                        </div>

                        {/* Cédula Codeudor */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.cedulaCodeudor) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.cedulaCodeudor) && abrirDocumento(data.cedulaCodeudor, 'Cédula Codeudor')}
                        >
                            <span className="mr-2">{tieneDocumento(data.cedulaCodeudor) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.cedulaCodeudor) ? 'underline' : ''}>
                                Cédula Codeudor
                                {tieneDocumento(data.cedulaCodeudor) && ' 📎'}
                            </span>
                        </div>

                        {/* Cédulas Habitantes */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.cedulasHabitantes) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.cedulasHabitantes) && abrirDocumento(data.cedulasHabitantes, 'Cédulas Habitantes')}
                        >
                            <span className="mr-2">{tieneDocumento(data.cedulasHabitantes) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.cedulasHabitantes) ? 'underline' : ''}>
                                Cédulas de habitantes del inmueble
                                {tieneDocumento(data.cedulasHabitantes) && ' 📎'}
                            </span>
                        </div>

                        {/* Certificado laboral arrendatario */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.certificado_laboral_arrendatario) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.certificado_laboral_arrendatario) && abrirDocumento(data.certificado_laboral_arrendatario, 'Certificado Laboral Arrendatario')}
                        >
                            <span className="mr-2">{tieneDocumento(data.certificado_laboral_arrendatario) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.certificado_laboral_arrendatario) ? 'underline' : ''}>
                                Certificado laboral (arrendatario)
                                {tieneDocumento(data.certificado_laboral_arrendatario) && ' 📎'}
                            </span>
                        </div>

                        {/* Certificado laboral codeudor */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.certificado_laboral_codeudor) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.certificado_laboral_codeudor) && abrirDocumento(data.certificado_laboral_codeudor, 'Certificado Laboral Codeudor')}
                        >
                            <span className="mr-2">{tieneDocumento(data.certificado_laboral_codeudor) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.certificado_laboral_codeudor) ? 'underline' : ''}>
                                Certificado laboral (codeudor)
                                {tieneDocumento(data.certificado_laboral_codeudor) && ' 📎'}
                            </span>
                        </div>

                        {/* Desprendible nómina arrendatario */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.desprendible_nomina_arrendatario) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.desprendible_nomina_arrendatario) && abrirDocumento(data.desprendible_nomina_arrendatario, 'Desprendible Nómina Arrendatario')}
                        >
                            <span className="mr-2">{tieneDocumento(data.desprendible_nomina_arrendatario) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.desprendible_nomina_arrendatario) ? 'underline' : ''}>
                                Desprendibles de nómina (arrendatario)
                                {tieneDocumento(data.desprendible_nomina_arrendatario) && ' 📎'}
                            </span>
                        </div>

                        {/* Desprendible nómina codeudor */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.desprendible_nomina_codeudor) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.desprendible_nomina_codeudor) && abrirDocumento(data.desprendible_nomina_codeudor, 'Desprendible Nómina Codeudor')}
                        >
                            <span className="mr-2">{tieneDocumento(data.desprendible_nomina_codeudor) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.desprendible_nomina_codeudor) ? 'underline' : ''}>
                                Desprendibles de nómina (codeudor)
                                {tieneDocumento(data.desprendible_nomina_codeudor) && ' 📎'}
                            </span>
                        </div>

                        {/* Declaración de renta arrendatario */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.declaracion_renta_arrendatario) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.declaracion_renta_arrendatario) && abrirDocumento(data.declaracion_renta_arrendatario, 'Declaración de Renta Arrendatario')}
                        >
                            <span className="mr-2">{tieneDocumento(data.declaracion_renta_arrendatario) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.declaracion_renta_arrendatario) ? 'underline' : ''}>
                                Declaración de renta (arrendatario)
                                {tieneDocumento(data.declaracion_renta_arrendatario) && ' 📎'}
                            </span>
                        </div>

                        {/* Declaración de renta codeudor */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.declaracion_renta_codeudor) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.declaracion_renta_codeudor) && abrirDocumento(data.declaracion_renta_codeudor, 'Declaración de Renta Codeudor')}
                        >
                            <span className="mr-2">{tieneDocumento(data.declaracion_renta_codeudor) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.declaracion_renta_codeudor) ? 'underline' : ''}>
                                Declaración de renta (codeudor)
                                {tieneDocumento(data.declaracion_renta_codeudor) && ' 📎'}
                            </span>
                        </div>

                        {/* Cámara de comercio arrendatario */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.camara_comercio_arrendatario) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.camara_comercio_arrendatario) && abrirDocumento(data.camara_comercio_arrendatario, 'Cámara de Comercio Arrendatario')}
                        >
                            <span className="mr-2">{tieneDocumento(data.camara_comercio_arrendatario) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.camara_comercio_arrendatario) ? 'underline' : ''}>
                                Cámara de comercio (independientes) arrendatario
                                {tieneDocumento(data.camara_comercio_arrendatario) && ' 📎'}
                            </span>
                        </div>

                        {/* Cámara de comercio codeudor */}
                        <div
                            className={`flex items-start p-1 rounded ${tieneDocumento(data.camara_comercio_codeudor) ? 'cursor-pointer hover:bg-blue-50 text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}
                            onClick={() => tieneDocumento(data.camara_comercio_codeudor) && abrirDocumento(data.camara_comercio_codeudor, 'Cámara de Comercio Codeudor')}
                        >
                            <span className="mr-2">{tieneDocumento(data.camara_comercio_codeudor) ? '☒' : '☐'}</span>
                            <span className={tieneDocumento(data.camara_comercio_codeudor) ? 'underline' : ''}>
                                Cámara de comercio (independientes) codeudor
                                {tieneDocumento(data.camara_comercio_codeudor) && ' 📎'}
                            </span>
                        </div>
                    </div>

                    {errorDocumento && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                            ❌ {errorDocumento}
                        </div>
                    )}
                </div>

                {/* 8. AUTORIZACIÓN Y TRATAMIENTO DE DATOS */}
                <div className="mb-3">
                    <h5 className="font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">8. AUTORIZACIÓN Y TRATAMIENTO DE DATOS</h5>
                    <p className="text-justify">
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
                <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
                        {/* Arrendatario */}
                        <div>
                            <div className="flex items-start gap-2">
                                <div>
                                    <p className="font-bold mb-0.5">Arrendatario</p>
                                    <div>
                                        <p className="mb-0 whitespace-nowrap">Firma: ___________________</p>
                                        <p className="mb-0 mt-0.5 whitespace-nowrap">C.C. {arrendatario.doc_identificacion || '_________________'}</p>
                                        <p className="mb-0 mt-0.5 text-gray-500 text-xs">{arrendatario.first_name || ''} {arrendatario.last_name || ''}</p>
                                    </div>
                                </div>
                                <div className="w-[60px] h-[75px] border border-gray-300 rounded mt-0.5 flex-shrink-0"></div>
                            </div>
                        </div>

                        {/* Codeudor */}
                        <div>
                            <div className="flex items-start gap-2">
                                <div>
                                    <p className="font-bold mb-0.5">Codeudor</p>
                                    <div>
                                        <p className="mb-0 whitespace-nowrap">Firma: ___________________</p>
                                        <p className="mb-0 mt-0.5 whitespace-nowrap">C.C. {coarrendatario.doc_identificacion || '_________________'}</p>
                                        <p className="mb-0 mt-0.5 text-gray-500 text-xs">{coarrendatario.first_name || ''} {coarrendatario.last_name || ''}</p>
                                    </div>
                                </div>
                                <div className="w-[60px] h-[75px] border border-gray-300 rounded mt-0.5 flex-shrink-0"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estado de la solicitud */}
                <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-medium">Estado:</span>
                        <span className={`px-2 py-0.5 rounded text-white text-xs
                            ${data.estado === 'pendiente' && 'bg-yellow-500'}
                            ${data.estado === 'aceptada' && 'bg-green-600'}
                            ${data.estado === 'rechazada' && 'bg-red-600'}
                            ${data.estado === 'cancelada' && 'bg-gray-500'}
                            ${data.estado === 'contratada' && 'bg-blue-600'}
                        `}>
                            {data.estado || 'Desconocido'}
                        </span>
                        {data.solicitudRevisada === false && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                                ⏳ Pendiente de revisión
                            </span>
                        )}
                        {data.solicitudContratada && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                📄 Contrato activo
                            </span>
                        )}
                        {data.comentario_estado && (
                            <span className="text-gray-500">| 💬 {data.comentario_estado}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para visualizar documentos */}
            {documentoSeleccionado && (
                <DocumentViewer
                    documento={documentoSeleccionado}
                    nombre={nombreDocumento}
                    onClose={() => {
                        setDocumentoSeleccionado(null);
                        setNombreDocumento('');
                        setErrorDocumento(null);
                    }}
                />
            )}
        </div>
    );
};

export default SolicitudDetalle;