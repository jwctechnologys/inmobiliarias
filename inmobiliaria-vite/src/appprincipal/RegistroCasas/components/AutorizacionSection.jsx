// components/AutorizacionSection.jsx
import React from 'react';

const AutorizacionSection = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">8. AUTORIZACIÓN Y TRATAMIENTO DE DATOS</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-start space-x-3">
                    <input type="checkbox" name="autorizacionDatos" checked={formData.autorizacionDatos} onChange={handleInputChange} className="mt-1 h-4 w-4 text-purple-600 rounded" required />
                    <span className="text-sm text-gray-700">Autorizo de manera libre, previa y voluntaria al ARRENDADOR o a quien represente sus intereses, para verificar, consultar y reportar la información suministrada en este formulario, incluyendo consultas en centrales de riesgo crediticio, bases de datos públicas y privadas, verificación laboral, de contacto, judicial y comercial, conforme a la Ley 1581 de 2012 y normas concordantes. Declaro que la información suministrada es veraz y entiendo que la diligencia de este formulario no implica obligación alguna de celebrar contrato de arrendamiento.</span>
                </label>
            </div>
        </div>
    );
};

export default AutorizacionSection;