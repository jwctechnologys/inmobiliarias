// components/HabitantesSection.jsx
import React, { useState, useEffect } from 'react';

const HabitantesSection = ({
    dependientes = [],
    seleccionados = [],
    onSelect,
    onEditDependiente,
    nuevosDependientes = [],
    onAgregarNuevo,
    onEliminarNuevo,
    onActualizarNuevo,
    formData,
    handleInputChange,
    inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
}) => {
    const [dependientesEditando, setDependientesEditando] = useState({});
    const [mostrarInfoCompleta, setMostrarInfoCompleta] = useState({});
    const [dependientesSeleccionadosData, setDependientesSeleccionadosData] = useState({});

    // Cargar datos de dependientes seleccionados
    useEffect(() => {
        const nuevosDatos = {};
        seleccionados.forEach(id => {
            const encontrado = dependientes.find(d => d.id === id);
            if (encontrado) {
                nuevosDatos[id] = encontrado;
            }
        });
        setDependientesSeleccionadosData(nuevosDatos);
    }, [seleccionados, dependientes]);

    const toggleEditDependiente = (id) => {
        setDependientesEditando(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
        // Activar vista completa al editar
        if (!dependientesEditando[id]) {
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

    const handleEditDependienteChange = (id, e) => {
        const { name, value } = e.target;
        const dependiente = dependientesSeleccionadosData[id];
        if (dependiente && onEditDependiente) {
            const updatedDependiente = { ...dependiente, [name]: value };
            setDependientesSeleccionadosData(prev => ({
                ...prev,
                [id]: updatedDependiente
            }));
            onEditDependiente(id, updatedDependiente);
        }
    };

    const handleNuevoDependienteChange = (id, e) => {
        const { name, value } = e.target;
        onActualizarNuevo(id, name, value);
    };

    const eliminarNuevoDependiente = (id) => {
        if (window.confirm('¿Está seguro de eliminar este dependiente?')) {
            onEliminarNuevo(id);
        }
    };

    // Renderizar vista completa de un dependiente existente
    const renderDependienteCompleto = (dep) => {
        if (!dep) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="first_name"
                        value={dep.first_name || ''}
                        onChange={(e) => handleEditDependienteChange(dep.id, e)}
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
                        value={dep.last_name || ''}
                        onChange={(e) => handleEditDependienteChange(dep.id, e)}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Edad <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="edad"
                        value={dep.edad || ''}
                        onChange={(e) => handleEditDependienteChange(dep.id, e)}
                        className={inputClassName}
                        min="0"
                        max="120"
                        onWheel={(e) => e.target.blur()}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tipo documento <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipo_documento"
                        value={dep.tipo_documento || ''}
                        onChange={(e) => handleEditDependienteChange(dep.id, e)}
                        className={inputClassName}
                    >
                        <option value="">Seleccione</option>
                        <option value="CC">CC - Cédula de Ciudadanía</option>
                        <option value="TI">TI - Tarjeta de Identidad</option>
                        <option value="RC">RC - Registro Civil</option>
                        <option value="CE">CE - Cédula de Extranjería</option>
                        <option value="PA">PA - Pasaporte</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        N° Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="doc_identificacion"
                        value={dep.doc_identificacion || ''}
                        onChange={(e) => handleEditDependienteChange(dep.id, e)}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Lugar expedición
                    </label>
                    <input
                        type="text"
                        name="lugarExpCedula"
                        value={dep.lugarExpCedula || ''}
                        onChange={(e) => handleEditDependienteChange(dep.id, e)}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Ocupación
                    </label>
                    <input
                        type="text"
                        name="ocupacion"
                        value={dep.ocupacion || ''}
                        onChange={(e) => handleEditDependienteChange(dep.id, e)}
                        className={inputClassName}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Parentesco <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="parentezco"
                        value={dep.parentezco || ''}
                        onChange={(e) => handleEditDependienteChange(dep.id, e)}
                        className={inputClassName}
                        placeholder="Ej: Hijo, Esposa, Hermano, etc."
                    />
                </div>
            </div>
        );
    };

    // Renderizar vista resumida de un dependiente existente
    const renderDependienteResumido = (dep) => {
        if (!dep) return null;

        return (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                <div>
                    <span className="font-medium text-gray-600">Documento:</span>
                    <span className="ml-1 text-gray-800">{dep.tipo_documento || 'N/A'}: {dep.doc_identificacion || 'N/A'}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Edad:</span>
                    <span className="ml-1 text-gray-800">{dep.edad || 'N/A'} años</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Parentesco:</span>
                    <span className="ml-1 text-gray-800">{dep.parentezco || 'N/A'}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Ocupación:</span>
                    <span className="ml-1 text-gray-800">{dep.ocupacion || 'N/A'}</span>
                </div>
                {dep.lugarExpCedula && (
                    <div className="col-span-2">
                        <span className="font-medium text-gray-600">Lugar expedición:</span>
                        <span className="ml-1 text-gray-800">{dep.lugarExpCedula}</span>
                    </div>
                )}
            </div>
        );
    };

    // Renderizar un dependiente existente
    const renderDependienteExistente = (dep) => {
        const estaSeleccionado = seleccionados.includes(dep.id);
        const estaEditando = dependientesEditando[dep.id] || false;
        const mostrarCompleto = mostrarInfoCompleta[dep.id] || false;

        return (
            <div key={dep.id} className={`border rounded-lg p-3 transition-all ${estaSeleccionado ? 'border-purple-300 bg-purple-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <label className="flex items-center flex-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={estaSeleccionado}
                            onChange={() => onSelect(dep.id)}
                            className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            <span className="font-medium">{dep.first_name} {dep.last_name}</span>
                            {dep.edad && <span className="text-gray-500 ml-2">({dep.edad} años)</span>}
                            {dep.parentezco && <span className="text-gray-500 ml-2">- {dep.parentezco}</span>}
                        </span>
                    </label>
                    
                    {estaSeleccionado && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => toggleMostrarInfoCompleta(dep.id)}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                                title={mostrarCompleto ? "Ver resumen" : "Ver información completa"}
                            >
                                {mostrarCompleto ? '📋 Resumen' : '📄 Detalle'}
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleEditDependiente(dep.id)}
                                className="text-purple-600 hover:text-purple-700 text-xs"
                                title={estaEditando ? "Cerrar edición" : "Editar información"}
                            >
                                {estaEditando ? '✕ Cerrar' : '✏️ Editar'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Mostrar información del dependiente si está seleccionado */}
                {estaSeleccionado && (
                    estaEditando ? (
                        // Modo edición - mostrar todos los campos editables
                        renderDependienteCompleto(dep)
                    ) : (
                        // Modo vista
                        mostrarCompleto ? (
                            // Vista completa - muestra toda la información
                            <div className="mt-3 pt-3 border-t">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Nombre completo:</span>
                                        <p className="text-gray-800">{dep.first_name} {dep.last_name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Documento:</span>
                                        <p className="text-gray-800">{dep.tipo_documento || 'N/A'}: {dep.doc_identificacion || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Edad:</span>
                                        <p className="text-gray-800">{dep.edad || 'N/A'} años</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Parentesco:</span>
                                        <p className="text-gray-800">{dep.parentezco || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Lugar expedición:</span>
                                        <p className="text-gray-800">{dep.lugarExpCedula || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Ocupación:</span>
                                        <p className="text-gray-800">{dep.ocupacion || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Vista resumida
                            renderDependienteResumido(dep)
                        )
                    )
                )}
            </div>
        );
    };

    // Renderizar un nuevo dependiente (en creación)
    const renderNuevoDependiente = (dep, idx) => {
        return (
            <div key={dep.id} className="border border-purple-300 bg-purple-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-purple-700">
                        ✨ Nuevo Dependiente {idx + 1}
                    </h4>
                    <button
                        type="button"
                        onClick={() => eliminarNuevoDependiente(dep.id)}
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
                            value={dep.first_name || ''}
                            onChange={(e) => handleNuevoDependienteChange(dep.id, e)}
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
                            value={dep.last_name || ''}
                            onChange={(e) => handleNuevoDependienteChange(dep.id, e)}
                            name="last_name"
                            className={inputClassName}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Edad <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Edad"
                            value={dep.edad || ''}
                            onChange={(e) => handleNuevoDependienteChange(dep.id, e)}
                            name="edad"
                            className={inputClassName}
                            min="0"
                            max="120"
                            required
                            onWheel={(e) => e.target.blur()}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Tipo documento <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={dep.tipo_documento || ''}
                            onChange={(e) => handleNuevoDependienteChange(dep.id, e)}
                            name="tipo_documento"
                            className={inputClassName}
                            required
                        >
                            <option value="">Tipo documento</option>
                            <option value="CC">CC - Cédula de Ciudadanía</option>
                            <option value="TI">TI - Tarjeta de Identidad</option>
                            <option value="RC">RC - Registro Civil</option>
                            <option value="CE">CE - Cédula de Extranjería</option>
                            <option value="PA">PA - Pasaporte</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            N° Documento <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="N° Documento"
                            value={dep.doc_identificacion || ''}
                            onChange={(e) => handleNuevoDependienteChange(dep.id, e)}
                            name="doc_identificacion"
                            className={inputClassName}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Lugar expedición
                        </label>
                        <input
                            type="text"
                            placeholder="Lugar expedición"
                            value={dep.lugarExpCedula || ''}
                            onChange={(e) => handleNuevoDependienteChange(dep.id, e)}
                            name="lugarExpCedula"
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
                            value={dep.ocupacion || ''}
                            onChange={(e) => handleNuevoDependienteChange(dep.id, e)}
                            name="ocupacion"
                            className={inputClassName}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Parentesco <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Parentesco (Ej: Hijo, Esposa)"
                            value={dep.parentezco || ''}
                            onChange={(e) => handleNuevoDependienteChange(dep.id, e)}
                            name="parentezco"
                            className={inputClassName}
                            required
                        />
                    </div>
                </div>
                
                {/* Mostrar resumen de los datos ingresados */}
                {dep.first_name && dep.last_name && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs text-green-700">
                            ✅ Datos completos: {dep.first_name} {dep.last_name} - {dep.parentezco || 'Sin parentesco'}
                            {dep.edad && ` (${dep.edad} años)`}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">
                5. PERSONAS QUE HABITARÁN EL INMUEBLE
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
                {/* Dependientes existentes */}
                {dependientes.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Seleccionar dependientes registrados
                                <span className="text-gray-400 text-xs ml-2 font-normal">
                                    ({dependientes.length} disponibles)
                                </span>
                            </label>
                            <span className="text-xs text-gray-500">
                                Seleccionados: {seleccionados.length}
                            </span>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {dependientes.map(dep => renderDependienteExistente(dep))}
                        </div>
                        {seleccionados.length > 0 && (
                            <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs text-green-700">
                                    ✅ {seleccionados.length} dependiente(s) seleccionado(s) para habitar el inmueble
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mensaje si no hay dependientes */}
                {dependientes.length === 0 && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">
                        <p>ℹ️ No hay dependientes registrados. Agrega uno nuevo o continúa sin seleccionar.</p>
                    </div>
                )}

                {/* Botón para agregar nuevo dependiente */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onAgregarNuevo}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-flex items-center"
                    >
                        <span className="text-lg mr-1">+</span> Agregar nuevo dependiente
                    </button>
                    
                    {dependientes.length > 0 && seleccionados.length === 0 && (
                        <span className="text-xs text-yellow-600 ml-2 flex items-center">
                            ⚠️ No has seleccionado ningún dependiente
                        </span>
                    )}
                </div>

                {/* Formularios para nuevos dependientes */}
                {nuevosDependientes.length > 0 && (
                    <div className="mt-4 space-y-4">
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-700 mb-3">
                                📝 Nuevos dependientes en creación ({nuevosDependientes.length})
                            </h4>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                                {nuevosDependientes.map((dep, idx) => renderNuevoDependiente(dep, idx))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mascotas */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">🐾 Mascotas</h3>
                    <div className="flex items-start">
                        <input 
                            type="checkbox" 
                            name="mascotas" 
                            checked={formData?.mascotas || false} 
                            onChange={handleInputChange} 
                            className="h-4 w-4 text-purple-600 rounded mt-1 focus:ring-purple-500" 
                        />
                        <div className="ml-3 flex-1">
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">
                                ¿Habitarán mascotas en el inmueble?
                            </label>
                            {formData?.mascotas && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Tipo de mascotas <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            name="tipoMascotas" 
                                            placeholder="Ej: Perros, Gatos, Aves"
                                            value={formData.tipoMascotas || ''} 
                                            onChange={handleInputChange} 
                                            className={inputClassName}
                                            required={formData.mascotas}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Cantidad <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            name="numMascotas" 
                                            placeholder="Número de mascotas"
                                            value={formData.numMascotas || ''} 
                                            onChange={handleInputChange} 
                                            className={inputClassName}
                                            min="1"
                                            max="20"
                                            required={formData.mascotas}
                                            onWheel={(e) => e.target.blur()}
                                        />
                                    </div>
                                </div>
                            )}
                            {formData?.mascotas && !formData.tipoMascotas && (
                                <p className="mt-1 text-xs text-red-500">⚠️ Por favor especifica el tipo de mascotas</p>
                            )}
                            {formData?.mascotas && !formData.numMascotas && (
                                <p className="mt-1 text-xs text-red-500">⚠️ Por favor especifica la cantidad de mascotas</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resumen final */}
                {(seleccionados.length > 0 || nuevosDependientes.length > 0 || formData?.mascotas) && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">📋 Resumen de habitantes:</p>
                        <ul className="mt-1 text-sm text-gray-600 space-y-1">
                            {seleccionados.length > 0 && (
                                <li>• {seleccionados.length} dependiente(s) seleccionado(s)</li>
                            )}
                            {nuevosDependientes.length > 0 && (
                                <li>• {nuevosDependientes.length} nuevo(s) dependiente(s) en creación</li>
                            )}
                            {formData?.mascotas && (
                                <li>• {formData.numMascotas || 'N/A'} mascota(s) ({formData.tipoMascotas || 'No especificado'})</li>
                            )}
                            {seleccionados.length === 0 && nuevosDependientes.length === 0 && !formData?.mascotas && (
                                <li className="text-yellow-600">⚠️ No hay habitantes registrados</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitantesSection;