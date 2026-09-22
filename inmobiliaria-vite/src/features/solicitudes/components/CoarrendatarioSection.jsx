// components/CoarrendatarioSection.jsx
import React from 'react';

const CoarrendatarioSection = ({
    coarrendatarios,
    seleccionado,
    onSelect,
    onEditCoarrendatario,
    coarrendatario,
    onCoarrendatarioChange,
    crearNuevo,
    onToggleNuevo,
    inputClassName,
    onGuardarCambiosLocal
}) => {
    // Función para obtener el texto del parentezco
    //console.log("1",coarrendatarios);
    //console.log("2", coarrendatario);
    const getParentezcoTexto = (value) => {
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
        return map[value] || value || '';
    };

    // Función para renderizar un campo de texto
    const renderField = (name, label, placeholder, type = 'text') => {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <input
                    type={type}
                    name={name}
                    value={coarrendatario?.[name] || ''}
                    onChange={onCoarrendatarioChange}
                    className={inputClassName}
                    placeholder={placeholder}
                />
            </div>
        );
    };

    // Función para renderizar un campo select
    const renderSelect = (name, label, options, placeholder = 'Seleccione una opción') => {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <select
                    name={name}
                    value={coarrendatario?.[name] || ''}
                    onChange={onCoarrendatarioChange}
                    className={inputClassName}
                >
                    <option value="">{placeholder}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    // Función para renderizar un campo checkbox
    const renderCheckbox = (name, label) => {
        return (
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name={name}
                    checked={coarrendatario?.[name] || false}
                    onChange={onCoarrendatarioChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                    {label}
                </label>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">4. COARRENDATARIO / CÓNYUGE</h2>
                <button
                    type="button"
                    onClick={onToggleNuevo}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                    {crearNuevo ? '← Seleccionar existente' : '+ Crear nuevo coarrendatario'}
                </button>
            </div>

            {/* Si no está creando uno nuevo, mostrar lista de coarrendatarios existentes */}
            {!crearNuevo && coarrendatarios.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar coarrendatario existente:
                    </label>
                    <select
                        value={seleccionado || ''}
                        onChange={(e) => onSelect(Number(e.target.value))}
                        className={inputClassName}
                    >
                        <option value="">Seleccione un coarrendatario...</option>
                        {coarrendatarios.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.first_name} {c.last_name} - {c.n_cedula || 'Sin documento'}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Siempre mostrar el formulario del coarrendatario (ya sea seleccionado o nuevo) */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-medium text-gray-700">
                        {crearNuevo ? 'Nuevo coarrendatario' : 'Datos del coarrendatario'}
                    </p>
                    {seleccionado && !crearNuevo && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            Seleccionado
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombres */}
                    {renderField('first_name', 'Nombres *', 'Ingrese los nombres')}
                    {renderField('last_name', 'Apellidos *', 'Ingrese los apellidos')}

                    {/* Tipo de documento */}
                    {renderSelect('tipo_documento', 'Tipo de documento *', [
                        { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
                        { value: 'CE', label: 'Cédula de Extranjería (CE)' },
                        { value: 'NIT', label: 'NIT' },
                        { value: 'PA', label: 'Pasaporte' },
                        { value: 'TI', label: 'Tarjeta de Identidad (TI)' }
                    ])}

                    {/* Número de documento */}
                    {renderField('doc_identificacion', 'Número de documento *', 'Ingrese el número de documento')}

                    {/* Lugar de expedición */}
                    {renderField('lugarExpCedula', 'Lugar de expedición', 'Ciudad donde se expidió el documento')}

                    {/* Parentezco */}
                    {renderSelect('parentezco', 'Parentesco / Vínculo *', [
                        { value: 'conyuge', label: 'Cónyuge' },
                        { value: 'codeudor_familiar', label: 'Codeudor (Familiar)' },
                        { value: 'codeudor_amigo', label: 'Codeudor (Amigo)' },
                        { value: 'hermano', label: 'Hermano/a' },
                        { value: 'padre', label: 'Padre/Madre' },
                        { value: 'hijo', label: 'Hijo/a' },
                        { value: 'familiar', label: 'Familiar' },
                        { value: 'amigo', label: 'Amigo/a' },
                        { value: 'vecino', label: 'Vecino/a' },
                        { value: 'compañero', label: 'Compañero/a' },
                        { value: 'otro', label: 'Otro' }
                    ])}

                    {/* Celular */}
                    {renderField('celular', 'Celular *', 'Ingrese el número de celular')}

                    {/* Email */}
                    {renderField('email', 'Correo electrónico', 'ejemplo@correo.com', 'email')}

                    {/* Dirección */}
                    {renderField('direccion', 'Dirección de residencia *', 'Calle, número, urbanización')}

                    {/* Barrio */}
                    {renderField('barrio', 'Barrio', 'Ingrese el barrio')}

                    {/* Ciudad */}
                    {renderField('ciudad', 'Ciudad *', 'Ingrese la ciudad')}

                    {/* Género */}
                    {renderSelect('genero', 'Género', [
                        { value: 'M', label: 'Masculino' },
                        { value: 'F', label: 'Femenino' },
                        { value: 'Otro', label: 'Otro' }
                    ])}

                    {/* Empresa donde labora */}
                    {renderField('empresa', 'Entidad donde labora', 'Nombre de la empresa')}

                    {/* Cargo */}
                    {renderField('ocupacion', 'Cargo', 'Cargo que desempeña')}

                    {/* Ingresos mensuales */}
                    {renderField('ingresosMensualesTotales', 'Ingresos mensuales totales *', '0', 'number')}

                    {/* Declara renta */}
                    <div className="flex items-center h-full pt-6">
                        {renderCheckbox('declaraRenta', 'Declara renta')}
                    </div>
                </div>

                {/* Botón para guardar cambios localmente */}
                {seleccionado && !crearNuevo && (
                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onGuardarCambiosLocal}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                            💾 Guardar cambios del coarrendatario
                        </button>
                    </div>
                )}
            </div>

            {/* Mostrar resumen del coarrendatario seleccionado */}
            {seleccionado && !crearNuevo && coarrendatario?.first_name && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Resumen del coarrendatario seleccionado:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div><span className="font-medium">Nombre:</span> {coarrendatario.first_name} {coarrendatario.last_name}</div>
                        <div><span className="font-medium">Documento:</span> {coarrendatario.tipo_documento || 'N/A'} {coarrendatario.doc_identificacion || 'N/A'}</div>
                        <div><span className="font-medium">Parentezco:</span> {getParentezcoTexto(coarrendatario.parentezco)}</div>
                        <div><span className="font-medium">Celular:</span> {coarrendatario.celular || 'N/A'}</div>
                        <div><span className="font-medium">Email:</span> {coarrendatario.email || 'N/A'}</div>
                        <div><span className="font-medium">Ciudad:</span> {coarrendatario.ciudad || 'N/A'}</div>
                        <div><span className="font-medium">Empresa:</span> {coarrendatario.empresa || 'N/A'}</div>
                        <div><span className="font-medium">Ingresos:</span> ${new Intl.NumberFormat('es-CO').format(coarrendatario.ingresosMensualesTotales || 0)}</div>
                        <div><span className="font-medium">Declara Renta:</span> {coarrendatario.declaraRenta ? 'Sí' : 'No'}</div>
                    </div>
                </div>
            )}

            {/* Indicador de campos obligatorios */}
            <p className="text-xs text-gray-500 mt-2">
                * Campos obligatorios
            </p>
        </div>
    );
};

export default CoarrendatarioSection;