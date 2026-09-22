// components/DatosArrendatario.jsx
import React from 'react';

const DatosArrendatario = ({ perfilArrendatario }) => {
    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50";
    
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">2. DATOS DEL ARRENDATARIO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres y apellidos</label>
                    <input type="text" value={`${perfilArrendatario?.first_name || ''} ${perfilArrendatario?.last_name || ''}`} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula de ciudadanía</label>
                    <input type="text" value={perfilArrendatario?.doc_identificacion || ''} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado civil</label>
                    <input type="text" value={perfilArrendatario?.estadoCivil || ''} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="text" value={perfilArrendatario?.email || ''} disabled className={inputClassName} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de celular</label>
                    <input type="text" value={perfilArrendatario?.celular || ''} disabled className={inputClassName} />
                </div>
            </div>
        </div>
    );
};

export default DatosArrendatario;