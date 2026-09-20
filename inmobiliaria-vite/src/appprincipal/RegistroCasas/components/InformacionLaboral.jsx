// components/InformacionLaboral.jsx
import React, { useState, useEffect } from 'react';

const InformacionLaboral = ({
    formData,
    handleInputChange,
    inputClassName,
    arrendatarioId,
    onDeclaracionChange,
    declaracionesExistentes = [],
    declaracionSeleccionada = null,
    mostrarNuevaDeclaracion: mostrarNuevaDeclaracionProp = false,
    onEditDeclaracion,
    perfilArrendatario, // <-- NUEVO: recibir el perfil del arrendatario
    onUpdatePerfil // <-- NUEVO: callback para actualizar el perfil
}) => {
    const [cargandoDeclaraciones, setCargandoDeclaraciones] = useState(false);
    const [mostrarNuevaDeclaracion, setMostrarNuevaDeclaracion] = useState(mostrarNuevaDeclaracionProp);
    const [seleccionLocal, setSeleccionLocal] = useState(declaracionSeleccionada);
    const [editandoDeclaracion, setEditandoDeclaracion] = useState(false);
    const [declaracionEditada, setDeclaracionEditada] = useState(null);
    const [mostrarInfoCompleta, setMostrarInfoCompleta] = useState(false);

    // Estado local para empresa y ocupacion (perfil arrendatario)
    const [empresaLocal, setEmpresaLocal] = useState(formData.empresa_laboral || '');
    const [ocupacionLocal, setOcupacionLocal] = useState(formData.cargo || '');

    // Actualizar cuando cambien las props
    useEffect(() => {
        setMostrarNuevaDeclaracion(mostrarNuevaDeclaracionProp);
    }, [mostrarNuevaDeclaracionProp]);

    useEffect(() => {
        setSeleccionLocal(declaracionSeleccionada);
        if (declaracionSeleccionada) {
            const encontrada = declaracionesExistentes.find(d => d.id === declaracionSeleccionada);
            if (encontrada) {
                setDeclaracionEditada(encontrada);
                setMostrarInfoCompleta(true);
            }
        } else {
            setDeclaracionEditada(null);
            setMostrarInfoCompleta(false);
        }
    }, [declaracionSeleccionada, declaracionesExistentes]);

    // Sincronizar empresaLocal y ocupacionLocal con formData
    useEffect(() => {
        setEmpresaLocal(formData.empresa_laboral || '');
    }, [formData.empresa_laboral]);

    useEffect(() => {
        setOcupacionLocal(formData.cargo || '');
    }, [formData.cargo]);

    const cargarDatosDeclaracion = (declaracion) => {
        if (!declaracion) return;

        // Estos campos son de declaracion_ingresos
        handleInputChange({ target: { name: 'tipoContrato', value: declaracion.tipoContrato || '' } });
        handleInputChange({ target: { name: 'jefeInmediato', value: declaracion.jefeInmediato || '' } });
        handleInputChange({ target: { name: 'tiempoLaboral', value: declaracion.tiempoLaboral || '' } });
        handleInputChange({ target: { name: 'salarioBasicoMensual', value: declaracion.salarioBasicoMensual || '' } });
        handleInputChange({ target: { name: 'otrosIngresos', value: declaracion.otrosIngresos || '' } });
        handleInputChange({ target: { name: 'telefonoEmpresa', value: declaracion.telefonoEmpresa || '' } });
        handleInputChange({ target: { name: 'direccion_laboral', value: declaracion.direccion_laboral || '' } });
        handleInputChange({ target: { name: 'declaraRenta', value: declaracion.declaraRenta || false } });

        // Estos campos son del arrendatario - usar los que vienen del perfil
        setEmpresaLocal(perfilArrendatario?.empresa || declaracion.empresa || '');
        setOcupacionLocal(perfilArrendatario?.ocupacion || declaracion.ocupacion || '');

        // También actualizar formData con los valores del arrendatario
        handleInputChange({ target: { name: 'empresa_laboral', value: perfilArrendatario?.empresa || declaracion.empresa || '' } });
        handleInputChange({ target: { name: 'cargo', value: perfilArrendatario?.ocupacion || declaracion.ocupacion || '' } });
    };

    // En InformacionLaboral.jsx - handleEmpresaChange
    const handleEmpresaChange = (e) => {
        const value = e.target.value;
        //console.log('🔄 handleEmpresaChange - valor:', value);
        setEmpresaLocal(value);
        handleInputChange({ target: { name: 'empresa_laboral', value } });

        // Notificar al padre para actualizar el perfil
        if (onUpdatePerfil) {
            //console.log('📤 Llamando a onUpdatePerfil con empresa:', value);
            onUpdatePerfil('empresa', value);
        }
    };

    // En InformacionLaboral.jsx - handleOcupacionChange
    const handleOcupacionChange = (e) => {
        const value = e.target.value;
        //console.log('🔄 handleOcupacionChange - valor:', value);
        setOcupacionLocal(value);
        handleInputChange({ target: { name: 'cargo', value } });

        // Notificar al padre para actualizar el perfil
        if (onUpdatePerfil) {
            //console.log('📤 Llamando a onUpdatePerfil con ocupacion:', value);
            onUpdatePerfil('ocupacion', value);
        }
    };

    const handleEditDeclaracionChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setDeclaracionEditada(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Actualizar formData en tiempo real
        handleInputChange({ target: { name, value: newValue } });

        // Notificar al padre
        if (onEditDeclaracion) {
            onEditDeclaracion(seleccionLocal, {
                ...declaracionEditada,
                [name]: newValue
            });
        }
    };

    const handleSeleccionarDeclaracion = (e) => {
        const id = parseInt(e.target.value);
        setSeleccionLocal(id);
        const declaracion = declaracionesExistentes.find(d => d.id === id);
        if (declaracion) {
            setDeclaracionEditada(declaracion);
            cargarDatosDeclaracion(declaracion);
            onDeclaracionChange(id, declaracion);
            setEditandoDeclaracion(false);
            setMostrarInfoCompleta(true);
        }
        setMostrarNuevaDeclaracion(false);
    };

    const handleNuevaDeclaracion = () => {
        setMostrarNuevaDeclaracion(true);
        setSeleccionLocal(null);
        setDeclaracionEditada(null);
        setEditandoDeclaracion(false);
        setMostrarInfoCompleta(false);
        onDeclaracionChange(null, null);

        // Limpiar solo los campos de declaracion_ingresos
        handleInputChange({ target: { name: 'tipoContrato', value: '' } });
        handleInputChange({ target: { name: 'jefeInmediato', value: '' } });
        handleInputChange({ target: { name: 'tiempoLaboral', value: '' } });
        handleInputChange({ target: { name: 'salarioBasicoMensual', value: '' } });
        handleInputChange({ target: { name: 'otrosIngresos', value: '' } });
        handleInputChange({ target: { name: 'telefonoEmpresa', value: '' } });
        handleInputChange({ target: { name: 'direccion_laboral', value: '' } });
        handleInputChange({ target: { name: 'declaraRenta', value: false } });

        // NO limpiar empresa_laboral y cargo porque son del perfil
    };

    const volverSeleccionExistente = () => {
        setMostrarNuevaDeclaracion(false);
        if (declaracionesExistentes.length > 0) {
            const ultimaDeclaracion = declaracionesExistentes[declaracionesExistentes.length - 1];
            setSeleccionLocal(ultimaDeclaracion.id);
            setDeclaracionEditada(ultimaDeclaracion);
            cargarDatosDeclaracion(ultimaDeclaracion);
            onDeclaracionChange(ultimaDeclaracion.id, ultimaDeclaracion);
            setMostrarInfoCompleta(true);
        }
    };

    // Renderizar vista resumida de la declaración
    const renderDeclaracionResumida = (declaracion) => {
        if (!declaracion) return null;

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                <div>
                    <span className="font-medium text-gray-600">Empresa:</span>
                    <span className="ml-1 text-gray-800">{perfilArrendatario?.empresa || empresaLocal || 'N/A'}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Cargo:</span>
                    <span className="ml-1 text-gray-800">{perfilArrendatario?.ocupacion || ocupacionLocal || 'N/A'}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Contrato:</span>
                    <span className="ml-1 text-gray-800">
                        {declaracion.tipoContrato === 'indefinido' ? 'Indefinido' :
                            declaracion.tipoContrato === 'termino_fijo' ? 'Término fijo' :
                                declaracion.tipoContrato === 'prestacion_servicios' ? 'Prestación de servicios' :
                                    declaracion.tipoContrato === 'Independiente' ? 'Independiente' :
                                        declaracion.tipoContrato || 'N/A'}
                    </span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Salario:</span>
                    <span className="ml-1 text-gray-800">${(declaracion.salarioBasicoMensual || 0).toLocaleString()}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Otros ingresos:</span>
                    <span className="ml-1 text-gray-800">${(declaracion.otrosIngresos || 0).toLocaleString()}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Declara renta:</span>
                    <span className="ml-1 text-gray-800">{declaracion.declaraRenta ? '✅ Sí' : '❌ No'}</span>
                </div>
            </div>
        );
    };

    // Renderizar vista completa de la declaración
    const renderDeclaracionCompleta = (declaracion, editando) => {
        if (!declaracion) return null;

        if (editando) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* EMPRESA - campo del arrendatario, NO de declaracion_ingresos */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Entidad / Empresa donde labora <span className="text-red-500">*</span>
                            <span className="text-gray-400 text-xs ml-2 font-normal">(Se actualiza en tu perfil)</span>
                        </label>
                        <input
                            type="text"
                            name="empresa_laboral"
                            value={empresaLocal}
                            onChange={handleEmpresaChange}
                            className={inputClassName}
                            placeholder="Nombre de la empresa"
                        />
                    </div>

                    {/* CARGO - campo del arrendatario, NO de declaracion_ingresos */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Cargo <span className="text-red-500">*</span>
                            <span className="text-gray-400 text-xs ml-2 font-normal">(Se actualiza en tu perfil)</span>
                        </label>
                        <input
                            type="text"
                            name="cargo"
                            value={ocupacionLocal}
                            onChange={handleOcupacionChange}
                            className={inputClassName}
                            placeholder="Cargo actual"
                        />
                    </div>

                    {/* Los siguientes campos son de declaracion_ingresos */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Tipo de contrato <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="tipoContrato"
                            value={declaracion.tipoContrato || ''}
                            onChange={handleEditDeclaracionChange}
                            className={inputClassName}
                        >
                            <option value="">Seleccione</option>
                            <option value="indefinido">Indefinido</option>
                            <option value="termino_fijo">Término fijo</option>
                            <option value="prestacion_servicios">Prestación de servicios</option>
                            <option value="Independiente">Independiente</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Jefe inmediato
                        </label>
                        <input
                            type="text"
                            name="jefeInmediato"
                            value={declaracion.jefeInmediato || ''}
                            onChange={handleEditDeclaracionChange}
                            className={inputClassName}
                            placeholder="Nombre del jefe inmediato"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Tiempo laboral
                        </label>
                        <input
                            type="text"
                            name="tiempoLaboral"
                            value={declaracion.tiempoLaboral || ''}
                            onChange={handleEditDeclaracionChange}
                            className={inputClassName}
                            placeholder="Ej: 2 años, 6 meses"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Salario básico mensual <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="salarioBasicoMensual"
                            value={declaracion.salarioBasicoMensual || ''}
                            onChange={handleEditDeclaracionChange}
                            className={inputClassName}
                            placeholder="$"
                            onWheel={(e) => e.target.blur()}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Otros ingresos
                        </label>
                        <input
                            type="number"
                            name="otrosIngresos"
                            value={declaracion.otrosIngresos || ''}
                            onChange={handleEditDeclaracionChange}
                            className={inputClassName}
                            placeholder="$ (Comisiones, bonos, etc.)"
                            onWheel={(e) => e.target.blur()}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Teléfono empresa
                        </label>
                        <input
                            type="text"
                            name="telefonoEmpresa"
                            value={declaracion.telefonoEmpresa || ''}
                            onChange={handleEditDeclaracionChange}
                            className={inputClassName}
                            placeholder="Teléfono de contacto"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Dirección empresa
                        </label>
                        <input
                            type="text"
                            name="direccion_laboral"
                            value={declaracion.direccion_laboral || ''}
                            onChange={handleEditDeclaracionChange}
                            className={inputClassName}
                            placeholder="Dirección completa de la empresa"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="declaraRenta"
                            checked={declaracion.declaraRenta || false}
                            onChange={handleEditDeclaracionChange}
                            className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                            Declara renta
                        </label>
                    </div>
                </div>
            );
        }

        // Vista no editable - información completa
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Empresa:</span>
                    <p className="text-gray-800">{perfilArrendatario?.empresa || empresaLocal || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Cargo:</span>
                    <p className="text-gray-800">{perfilArrendatario?.ocupacion || ocupacionLocal || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Tipo de contrato:</span>
                    <p className="text-gray-800">
                        {declaracion.tipoContrato === 'indefinido' ? 'Indefinido' :
                            declaracion.tipoContrato === 'termino_fijo' ? 'Término fijo' :
                                declaracion.tipoContrato === 'prestacion_servicios' ? 'Prestación de servicios' :
                                    declaracion.tipoContrato === 'Independiente' ? 'Independiente' :
                                        declaracion.tipoContrato || 'N/A'}
                    </p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Jefe inmediato:</span>
                    <p className="text-gray-800">{declaracion.jefeInmediato || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Tiempo laboral:</span>
                    <p className="text-gray-800">{declaracion.tiempoLaboral || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Salario mensual:</span>
                    <p className="text-gray-800">${(declaracion.salarioBasicoMensual || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Otros ingresos:</span>
                    <p className="text-gray-800">${(declaracion.otrosIngresos || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Teléfono empresa:</span>
                    <p className="text-gray-800">{declaracion.telefonoEmpresa || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-600">Declara renta:</span>
                    <p className="text-gray-800">{declaracion.declaraRenta ? '✅ Sí' : '❌ No'}</p>
                </div>
                {declaracion.direccion_laboral && (
                    <div className="bg-gray-50 p-2 rounded col-span-2 md:col-span-3">
                        <span className="font-medium text-gray-600">Dirección empresa:</span>
                        <p className="text-gray-800">{declaracion.direccion_laboral}</p>
                    </div>
                )}
            </div>
        );
    };

    // Renderizar nueva declaración
    const renderNuevaDeclaracion = () => (
        <div className={mostrarNuevaDeclaracion ? "border-t pt-4" : ""}>
            {mostrarNuevaDeclaracion && (
                <h3 className="font-semibold text-gray-700 mb-3">📝 Nueva Declaración de Ingresos</h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* EMPRESA - campo del arrendatario */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entidad / Empresa donde labora <span className="text-red-500">*</span>
                        <span className="text-gray-400 text-xs ml-2 font-normal">(Se actualiza en tu perfil)</span>
                    </label>
                    <input
                        type="text"
                        name="empresa_laboral"
                        value={empresaLocal}
                        onChange={handleEmpresaChange}
                        required
                        className={inputClassName}
                        placeholder="Nombre de la empresa"
                    />
                </div>

                {/* CARGO - campo del arrendatario */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo <span className="text-red-500">*</span>
                        <span className="text-gray-400 text-xs ml-2 font-normal">(Se actualiza en tu perfil)</span>
                    </label>
                    <input
                        type="text"
                        name="cargo"
                        value={ocupacionLocal}
                        onChange={handleOcupacionChange}
                        required
                        className={inputClassName}
                        placeholder="Cargo actual"
                    />
                </div>

                {/* Los siguientes campos son de declaracion_ingresos */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de contrato <span className="text-red-500">*</span>
                        <span className="text-gray-400 text-xs ml-2 font-normal">(Indefinido, Término fijo, Prestación de servicios, Independiente)</span>
                    </label>
                    <select
                        name="tipoContrato"
                        value={formData.tipoContrato}
                        onChange={handleInputChange}
                        required
                        className={inputClassName}
                    >
                        <option value="">Seleccione</option>
                        <option value="indefinido">Indefinido</option>
                        <option value="termino_fijo">Término fijo</option>
                        <option value="prestacion_servicios">Prestación de servicios</option>
                        <option value="Independiente">Independiente</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jefe inmediato
                    </label>
                    <input
                        type="text"
                        name="jefeInmediato"
                        value={formData.jefeInmediato}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="Nombre del jefe inmediato"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo laboral
                        <span className="text-gray-400 text-xs ml-2 font-normal">(Ej: 2 años, 6 meses)</span>
                    </label>
                    <input
                        type="text"
                        name="tiempoLaboral"
                        placeholder="Ej: 2 años"
                        value={formData.tiempoLaboral}
                        onChange={handleInputChange}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salario básico mensual <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="salarioBasicoMensual"
                        placeholder="$"
                        value={formData.salarioBasicoMensual}
                        onChange={handleInputChange}
                        required
                        className={inputClassName}
                        onWheel={(e) => e.target.blur()}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Otros ingresos
                        <span className="text-gray-400 text-xs ml-2 font-normal">(Comisiones, bonos, etc.)</span>
                    </label>
                    <input
                        type="number"
                        name="otrosIngresos"
                        placeholder="$"
                        value={formData.otrosIngresos}
                        onChange={handleInputChange}
                        className={inputClassName}
                        onWheel={(e) => e.target.blur()}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono empresa
                    </label>
                    <input
                        type="text"
                        name="telefonoEmpresa"
                        value={formData.telefonoEmpresa}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="Teléfono de contacto"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección empresa
                    </label>
                    <input
                        type="text"
                        name="direccion_laboral"
                        value={formData.direccion_laboral}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="Dirección completa de la empresa"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="declaraRenta"
                        checked={formData.declaraRenta}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                        Declara renta
                    </label>
                </div>
            </div>

            {/* Mostrar resumen de la nueva declaración */}
            {(empresaLocal || ocupacionLocal || formData.salarioBasicoMensual) && (
                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-xs text-green-700">
                        ✅ Datos ingresados: {empresaLocal || 'N/A'} - {ocupacionLocal || 'N/A'}
                        {formData.salarioBasicoMensual && ` - $${parseInt(formData.salarioBasicoMensual).toLocaleString()}`}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">
                3. INFORMACIÓN LABORAL Y DECLARACIÓN DE INGRESOS
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
                {/* Selección de declaración existente */}
                {declaracionesExistentes.length > 0 && !mostrarNuevaDeclaracion && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Declaración de ingresos existente
                                <span className="text-gray-400 text-xs ml-2 font-normal">
                                    ({declaracionesExistentes.length} disponibles)
                                </span>
                            </label>
                            {seleccionLocal && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarInfoCompleta(!mostrarInfoCompleta)}
                                        className="text-blue-600 hover:text-blue-700 text-xs"
                                        title={mostrarInfoCompleta ? "Ver resumen" : "Ver información completa"}
                                    >
                                        {mostrarInfoCompleta ? '📋 Resumen' : '📄 Detalle completo'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditandoDeclaracion(!editandoDeclaracion)}
                                        className="text-purple-600 hover:text-purple-700 text-xs"
                                        title={editandoDeclaracion ? "Cerrar edición" : "Editar información"}
                                    >
                                        {editandoDeclaracion ? '✕ Cerrar' : '✏️ Editar'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <select
                            value={seleccionLocal || ''}
                            onChange={handleSeleccionarDeclaracion}
                            className={inputClassName}
                        >
                            <option value="">-- Seleccione una declaración --</option>
                            {declaracionesExistentes.map(dec => (
                                <option key={dec.id} value={dec.id}>
                                    {`Declaración #${dec.id} - ${dec.tipoContrato || 'Sin tipo'} - $${(dec.salarioBasicoMensual || 0).toLocaleString()}`}
                                </option>
                            ))}
                        </select>

                        {/* Mostrar información de la declaración seleccionada */}
                        {seleccionLocal && declaracionEditada && (
                            <div className="mt-3 p-3 bg-white rounded-lg">
                                {editandoDeclaracion ? (
                                    renderDeclaracionCompleta(declaracionEditada, true)
                                ) : (
                                    mostrarInfoCompleta ?
                                        renderDeclaracionCompleta(declaracionEditada, false) :
                                        renderDeclaracionResumida(declaracionEditada)
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleNuevaDeclaracion}
                            className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium block"
                        >
                            + Crear nueva declaración de ingresos
                        </button>
                    </div>
                )}

                {/* Botón para nueva declaración cuando no hay existentes */}
                {declaracionesExistentes.length === 0 && !mostrarNuevaDeclaracion && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-600 mb-2">ℹ️ No tiene declaraciones de ingresos registradas</p>
                        <button
                            type="button"
                            onClick={handleNuevaDeclaracion}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                            + Crear nueva declaración de ingresos
                        </button>
                    </div>
                )}

                {/* Botón para volver a seleccionar existente cuando está en nueva */}
                {mostrarNuevaDeclaracion && declaracionesExistentes.length > 0 && (
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={volverSeleccionExistente}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                            ← Volver a seleccionar declaración existente
                        </button>
                    </div>
                )}

                {/* Formulario de nueva declaración */}
                {(mostrarNuevaDeclaracion || declaracionesExistentes.length === 0) &&
                    renderNuevaDeclaracion()
                }

                {cargandoDeclaraciones && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-sm text-gray-500">Cargando declaraciones...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InformacionLaboral;