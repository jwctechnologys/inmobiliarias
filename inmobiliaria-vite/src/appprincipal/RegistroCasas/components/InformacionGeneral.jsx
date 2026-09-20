// components/InformacionGeneral.jsx
import React from 'react';

const InformacionGeneral = ({ casaInfo, formData, handleInputChange }) => {
    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50";

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">1. INFORMACIÓN GENERAL DEL INMUEBLE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <input type="text" value={casaInfo?.ciudad || ''} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input type="date" value={new Date().toISOString().split('T')[0]} disabled className={inputClassName} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección del inmueble</label>
                    <input type="text" value={casaInfo?.direccion || ''} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de inmueble</label>
                    <input type="text" value={casaInfo?.tipoInmueble || ''} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uso del inmueble</label>
                    <input type="text" value={casaInfo?.usoInmueble || ''} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Canon de arrendamiento</label>
                    <input type="text" value={`$${new Intl.NumberFormat('es-CO').format(casaInfo?.canonmensual || 0)}`} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración del contrato (meses) *</label>
                    <select
                        name="duracionContrato"
                        value={formData.duracionContratoPersonalizado ? 'otro' : formData.duracionContrato}
                        onChange={(e) => {
                            if (e.target.value === 'otro') {
                                handleInputChange({ target: { name: 'duracionContratoPersonalizado', value: true } });
                                handleInputChange({ target: { name: 'duracionContrato', value: '' } });
                            } else {
                                handleInputChange({ target: { name: 'duracionContratoPersonalizado', value: false } });
                                handleInputChange({ target: { name: 'duracionContrato', value: e.target.value } });
                            }
                        }}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="6">6 meses</option>
                        <option value="12">12 meses</option>
                        <option value="24">24 meses</option>
                        <option value="otro">Otro (especificar)</option>
                    </select>

                    {formData.duracionContratoPersonalizado && (
                        <div className="mt-2">
                            <input
                                type="number"
                                name="duracionContrato"
                                value={formData.duracionContrato}
                                onChange={handleInputChange}
                                placeholder="Escriba la cantidad de meses"
                                min="1"
                                max="60"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                onWheel={(e) => e.target.blur()}
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                {formData.duracionContrato && `${formData.duracionContrato} meses`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InformacionGeneral;