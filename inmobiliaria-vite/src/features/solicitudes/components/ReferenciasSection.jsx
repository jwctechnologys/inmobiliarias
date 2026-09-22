// components/ReferenciasSection.jsx
import React, { useState, useEffect } from 'react';

const ReferenciasSection = ({
    referencias = [],
    seleccionadas = [],
    onSelect,
    onEditReferencia,
    nuevasReferencias = [],
    onAgregarNuevo,
    onEliminarNuevo,
    onActualizarNuevo,
    formData,
    handleInputChange,
    inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
}) => {
    const [referenciasEditando, setReferenciasEditando] = useState({});
    const [mostrarInfoCompleta, setMostrarInfoCompleta] = useState({});
    const [referenciasSeleccionadasData, setReferenciasSeleccionadasData] = useState({});

    // Cargar datos de referencias seleccionadas
    useEffect(() => {
        const nuevosDatos = {};
        seleccionadas.forEach(id => {
            const encontrado = referencias.find(r => r.id === id);
            if (encontrado) {
                nuevosDatos[id] = encontrado;
            }
        });
        setReferenciasSeleccionadasData(nuevosDatos);
    }, [seleccionadas, referencias]);

    const toggleEditReferencia = (id) => {
        setReferenciasEditando(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
        // Activar vista completa al editar
        if (!referenciasEditando[id]) {
            setMostrarInfoCompleta(prev => ({
                ...prev,
                [id]: true
            }));
        }
    };

    const toggleMostrarInfoCompleta = (id) => {
        setMostrarInfoCompleta(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleEditReferenciaChange = (id, e) => {
        const { name, value } = e.target;
        const referencia = referenciasSeleccionadasData[id];
        if (referencia && onEditReferencia) {
            const updatedReferencia = { ...referencia, [name]: value };
            setReferenciasSeleccionadasData(prev => ({
                ...prev,
                [id]: updatedReferencia
            }));
            onEditReferencia(id, updatedReferencia);
        }
    };

    const handleNuevaReferenciaChange = (id, e) => {
        const { name, value } = e.target;
        onActualizarNuevo(id, name, value);
    };

    const eliminarNuevaReferencia = (id) => {
        if (window.confirm('¿Está seguro de eliminar esta referencia?')) {
            onEliminarNuevo(id);
        }
    };

    // Renderizar vista completa de una referencia existente
    const renderReferenciaCompleta = (ref) => {
        if (!ref) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="first_name"
                        value={ref.first_name || ''}
                        onChange={(e) => handleEditReferenciaChange(ref.id, e)}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Apellidos <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="last_name"
                        value={ref.last_name || ''}
                        onChange={(e) => handleEditReferenciaChange(ref.id, e)}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Parentesco <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="parentezco"
                        value={ref.parentezco || ''}
                        onChange={(e) => handleEditReferenciaChange(ref.id, e)}
                        className={inputClassName}
                    >
                        <option value="">Seleccione parentesco</option>
                        <option value="Familiar">Familiar</option>
                        <option value="Amigo">Amigo</option>
                        <option value="Compañero de trabajo">Compañero de trabajo</option>
                        <option value="Vecino">Vecino</option>
                        <option value="Conocido">Conocido</option>
                        <option value="Jefe">Jefe</option>
                        <option value="Cliente">Cliente</option>
                        <option value="Proveedor">Proveedor</option>
                        <option value="otro">Otro</option>
                    </select>
                    {ref.parentezco === 'otro' && (
                        <input
                            type="text"
                            name="parentezco_otro"
                            value={ref.parentezco_otro || ''}
                            onChange={(e) => handleEditReferenciaChange(ref.id, {
                                target: { name: 'parentezco', value: e.target.value }
                            })}
                            placeholder="Especifique parentesco"
                            className={`${inputClassName} mt-2`}
                        />
                    )}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="celular"
                        value={ref.celular || ''}
                        onChange={(e) => handleEditReferenciaChange(ref.id, e)}
                        className={inputClassName}
                        placeholder="Ej: 3001234567"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Dirección residencia
                    </label>
                    <input
                        type="text"
                        name="dir_residencia"
                        value={ref.dir_residencia || ''}
                        onChange={(e) => handleEditReferenciaChange(ref.id, e)}
                        className={inputClassName}
                        placeholder="Dirección completa de residencia"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Ocupación
                    </label>
                    <input
                        type="text"
                        name="ocupacion"
                        value={ref.ocupacion || ''}
                        onChange={(e) => handleEditReferenciaChange(ref.id, e)}
                        className={inputClassName}
                        placeholder="Ej: Ingeniero, Docente, Empresario"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email (opcional)
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={ref.email || ''}
                        onChange={(e) => handleEditReferenciaChange(ref.id, e)}
                        className={inputClassName}
                        placeholder="correo@ejemplo.com"
                    />
                </div>
            </div>
        );
    };

    // Renderizar vista resumida de una referencia existente
    const renderReferenciaResumida = (ref) => {
        if (!ref) return null;

        return (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                <div>
                    <span className="font-medium text-gray-600">Parentesco:</span>
                    <span className="ml-1 text-gray-800">{ref.parentezco || 'N/A'}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Teléfono:</span>
                    <span className="ml-1 text-gray-800">{ref.celular || 'N/A'}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Ocupación:</span>
                    <span className="ml-1 text-gray-800">{ref.ocupacion || 'N/A'}</span>
                </div>
                {ref.dir_residencia && (
                    <div className="col-span-2 md:col-span-3">
                        <span className="font-medium text-gray-600">Dirección:</span>
                        <span className="ml-1 text-gray-800">{ref.dir_residencia}</span>
                    </div>
                )}
                {ref.email && (
                    <div className="col-span-2 md:col-span-3">
                        <span className="font-medium text-gray-600">Email:</span>
                        <span className="ml-1 text-gray-800">{ref.email}</span>
                    </div>
                )}
            </div>
        );
    };

    // Renderizar una referencia existente
    const renderReferenciaExistente = (ref) => {
        const estaSeleccionada = seleccionadas.includes(ref.id);
        const estaEditando = referenciasEditando[ref.id] || false;
        const mostrarCompleto = mostrarInfoCompleta[ref.id] || false;

        return (
            <div key={ref.id} className={`border rounded-lg p-3 transition-all ${estaSeleccionada ? 'border-purple-300 bg-purple-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <label className="flex items-center flex-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={estaSeleccionada}
                            onChange={() => onSelect(ref.id)}
                            className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            <span className="font-medium">{ref.first_name} {ref.last_name}</span>
                            {ref.parentezco && <span className="text-gray-500 ml-2">- {ref.parentezco}</span>}
                            {ref.celular && <span className="text-gray-400 ml-2">📞 {ref.celular}</span>}
                        </span>
                    </label>
                    
                    {estaSeleccionada && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => toggleMostrarInfoCompleta(ref.id)}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                                title={mostrarCompleto ? "Ver resumen" : "Ver información completa"}
                            >
                                {mostrarCompleto ? '📋 Resumen' : '📄 Detalle'}
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleEditReferencia(ref.id)}
                                className="text-purple-600 hover:text-purple-700 text-xs"
                                title={estaEditando ? "Cerrar edición" : "Editar información"}
                            >
                                {estaEditando ? '✕ Cerrar' : '✏️ Editar'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Mostrar información de la referencia si está seleccionada */}
                {estaSeleccionada && (
                    estaEditando ? (
                        // Modo edición - mostrar todos los campos editables
                        renderReferenciaCompleta(ref)
                    ) : (
                        // Modo vista
                        mostrarCompleto ? (
                            // Vista completa - muestra toda la información
                            <div className="mt-3 pt-3 border-t">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Nombre completo:</span>
                                        <p className="text-gray-800">{ref.first_name} {ref.last_name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Parentesco:</span>
                                        <p className="text-gray-800">{ref.parentezco || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Teléfono:</span>
                                        <p className="text-gray-800">{ref.celular || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Ocupación:</span>
                                        <p className="text-gray-800">{ref.ocupacion || 'N/A'}</p>
                                    </div>
                                    {ref.dir_residencia && (
                                        <div className="col-span-2 md:col-span-3">
                                            <span className="font-medium text-gray-600">Dirección:</span>
                                            <p className="text-gray-800">{ref.dir_residencia}</p>
                                        </div>
                                    )}
                                    {ref.email && (
                                        <div className="col-span-2 md:col-span-3">
                                            <span className="font-medium text-gray-600">Email:</span>
                                            <p className="text-gray-800">{ref.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Vista resumida
                            renderReferenciaResumida(ref)
                        )
                    )
                )}
            </div>
        );
    };

    // Renderizar una nueva referencia (en creación)
    const renderNuevaReferencia = (ref, idx) => {
        return (
            <div key={ref.id} className="border border-purple-300 bg-purple-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-purple-700">
                        ✨ Nueva Referencia {idx + 1}
                    </h4>
                    <button
                        type="button"
                        onClick={() => eliminarNuevaReferencia(ref.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                        🗑️ Eliminar
                    </button>
                </div>
                <p className="text-xs text-gray-500">* Campos obligatorios</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nombres <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Nombres"
                            value={ref.first_name || ''}
                            onChange={(e) => handleNuevaReferenciaChange(ref.id, e)}
                            name="first_name"
                            className={inputClassName}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Apellidos <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Apellidos"
                            value={ref.last_name || ''}
                            onChange={(e) => handleNuevaReferenciaChange(ref.id, e)}
                            name="last_name"
                            className={inputClassName}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Parentesco <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={ref.parentezco || ''}
                            onChange={(e) => handleNuevaReferenciaChange(ref.id, e)}
                            name="parentezco"
                            className={inputClassName}
                            required
                        >
                            <option value="">Seleccione parentesco</option>
                            <option value="Familiar">Familiar</option>
                            <option value="Amigo">Amigo</option>
                            <option value="Compañero de trabajo">Compañero de trabajo</option>
                            <option value="Vecino">Vecino</option>
                            <option value="Conocido">Conocido</option>
                            <option value="Jefe">Jefe</option>
                            <option value="Cliente">Cliente</option>
                            <option value="Proveedor">Proveedor</option>
                            <option value="otro">Otro</option>
                        </select>
                        {ref.parentezco === 'otro' && (
                            <input
                                type="text"
                                name="parentezco_otro"
                                placeholder="Especifique parentesco"
                                onChange={(e) => handleNuevaReferenciaChange(ref.id, {
                                    target: { name: 'parentezco', value: e.target.value }
                                })}
                                className={`${inputClassName} mt-2`}
                                required
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Teléfono"
                            value={ref.celular || ''}
                            onChange={(e) => handleNuevaReferenciaChange(ref.id, e)}
                            name="celular"
                            className={inputClassName}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Dirección residencia
                        </label>
                        <input
                            type="text"
                            placeholder="Dirección completa de residencia"
                            value={ref.dir_residencia || ''}
                            onChange={(e) => handleNuevaReferenciaChange(ref.id, e)}
                            name="dir_residencia"
                            className={inputClassName}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Ocupación
                        </label>
                        <input
                            type="text"
                            placeholder="Ocupación"
                            value={ref.ocupacion || ''}
                            onChange={(e) => handleNuevaReferenciaChange(ref.id, e)}
                            name="ocupacion"
                            className={inputClassName}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Email (opcional)
                        </label>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={ref.email || ''}
                            onChange={(e) => handleNuevaReferenciaChange(ref.id, e)}
                            name="email"
                            className={inputClassName}
                        />
                    </div>
                </div>
                
                {/* Mostrar resumen de los datos ingresados */}
                {ref.first_name && ref.last_name && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs text-green-700">
                            ✅ Datos completos: {ref.first_name} {ref.last_name}
                            {ref.parentezco && ref.parentezco !== 'otro' && ` - ${ref.parentezco}`}
                            {ref.celular && ` - 📞 ${ref.celular}`}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">
                6. REFERENCIAS
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
                {/* Referencias existentes */}
                {referencias.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Seleccionar referencias registradas
                                <span className="text-gray-400 text-xs ml-2 font-normal">
                                    ({referencias.length} disponibles)
                                </span>
                            </label>
                            <span className="text-xs text-gray-500">
                                Seleccionadas: {seleccionadas.length}
                            </span>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {referencias.map(ref => renderReferenciaExistente(ref))}
                        </div>
                        {seleccionadas.length > 0 && (
                            <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs text-green-700">
                                    ✅ {seleccionadas.length} referencia(s) seleccionada(s)
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mensaje si no hay referencias */}
                {referencias.length === 0 && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">
                        <p>ℹ️ No hay referencias registradas. Agrega una nueva referencia.</p>
                    </div>
                )}

                {/* Botón para agregar nueva referencia */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onAgregarNuevo}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-flex items-center"
                    >
                        <span className="text-lg mr-1">+</span> Agregar nueva referencia
                    </button>
                    
                    {referencias.length > 0 && seleccionadas.length === 0 && (
                        <span className="text-xs text-yellow-600 ml-2 flex items-center">
                            ⚠️ No has seleccionado ninguna referencia
                        </span>
                    )}
                </div>

                {/* Formularios para nuevas referencias */}
                {nuevasReferencias.length > 0 && (
                    <div className="mt-4 space-y-4">
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-700 mb-3">
                                📝 Nuevas referencias en creación ({nuevasReferencias.length})
                            </h4>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                                {nuevasReferencias.map((ref, idx) => renderNuevaReferencia(ref, idx))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Referencia de arrendador anterior */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">🏠 Referencia de arrendador anterior (si aplica)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Nombre del arrendador anterior
                            </label>
                            <input 
                                type="text" 
                                name="nombreArrendadorAnterior" 
                                value={formData?.nombreArrendadorAnterior || ''} 
                                onChange={handleInputChange} 
                                className={inputClassName}
                                placeholder="Nombre completo del arrendador anterior"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Teléfono
                            </label>
                            <input 
                                type="text" 
                                name="telefonoArrendadorAnterior" 
                                value={formData?.telefonoArrendadorAnterior || ''} 
                                onChange={handleInputChange} 
                                className={inputClassName}
                                placeholder="Teléfono de contacto"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Dirección del inmueble anterior
                            </label>
                            <input 
                                type="text" 
                                name="direccionArrendadorAnterior" 
                                value={formData?.direccionArrendadorAnterior || ''} 
                                onChange={handleInputChange} 
                                className={inputClassName}
                                placeholder="Dirección completa del inmueble que habitaba anteriormente"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Motivo de retiro
                            </label>
                            <select
                                name="motivoRetiro"
                                value={formData?.motivoRetiro || ''}
                                onChange={handleInputChange}
                                className={inputClassName}
                            >
                                <option value="">Seleccione el motivo</option>
                                <option value="Terminación de contrato">Terminación de contrato</option>
                                <option value="Cambio de ciudad">Cambio de ciudad</option>
                                <option value="Compra de vivienda propia">Compra de vivienda propia</option>
                                <option value="Cambio a inmueble más grande">Cambio a inmueble más grande</option>
                                <option value="Cambio a inmueble más pequeño">Cambio a inmueble más pequeño</option>
                                <option value="Problemas con el arrendador">Problemas con el arrendador</option>
                                <option value="Problemas con el inmueble">Problemas con el inmueble</option>
                                <option value="Razones laborales">Razones laborales</option>
                                <option value="Razones familiares">Razones familiares</option>
                                <option value="Otro">Otro</option>
                            </select>
                            {formData?.motivoRetiro === 'Otro' && (
                                <input
                                    type="text"
                                    name="motivoRetiroOtro"
                                    value={formData?.motivoRetiroOtro || ''}
                                    onChange={(e) => {
                                        handleInputChange({
                                            target: { name: 'motivoRetiro', value: e.target.value }
                                        });
                                    }}
                                    placeholder="Especifique el motivo"
                                    className={`${inputClassName} mt-2`}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Resumen final */}
                {(seleccionadas.length > 0 || nuevasReferencias.length > 0 || 
                  formData?.nombreArrendadorAnterior || formData?.motivoRetiro) && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">📋 Resumen de referencias:</p>
                        <ul className="mt-1 text-sm text-gray-600 space-y-1">
                            {seleccionadas.length > 0 && (
                                <li>• {seleccionadas.length} referencia(s) seleccionada(s)</li>
                            )}
                            {nuevasReferencias.length > 0 && (
                                <li>• {nuevasReferencias.length} nueva(s) referencia(s) en creación</li>
                            )}
                            {formData?.nombreArrendadorAnterior && (
                                <li>• Referencia de arrendador anterior: {formData.nombreArrendadorAnterior}</li>
                            )}
                            {formData?.motivoRetiro && formData.motivoRetiro !== 'Seleccione el motivo' && (
                                <li>• Motivo de retiro: {formData.motivoRetiro}</li>
                            )}
                            {seleccionadas.length === 0 && nuevasReferencias.length === 0 && 
                             !formData?.nombreArrendadorAnterior && (
                                <li className="text-yellow-600">⚠️ No hay referencias registradas</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferenciasSection;