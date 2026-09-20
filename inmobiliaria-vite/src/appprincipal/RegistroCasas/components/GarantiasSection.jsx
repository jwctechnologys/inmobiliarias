// components/GarantiasSection.jsx
import React from 'react';

const GarantiasSection = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">4A. GARANTÍAS OFRECIDAS (OBLIGATORIO)</h2>
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">El interesado en el arrendamiento manifiesta que, además del codeudor, se compromete a seleccionar y cumplir al menos una (1) de las siguientes garantías adicionales, las cuales estarán sujetas a estudio y aprobación por parte del ARRENDADOR:</p>
            </div>
            <div className="space-y-4">
                <div className="flex items-start">
                    <input type="radio" name="garantiaSeleccionada" value="seguroArrendamiento" checked={formData.seguroArrendamiento} onChange={() => {
                        const update = { seguroArrendamiento: true, depositoVoluntario: false, otraGarantiaAcordada: false, valorDepositoVoluntario: '', especificacionOtraGarantiaAcordada: '' };
                        handleInputChange({ target: { name: 'seguroArrendamiento', value: true } });
                        handleInputChange({ target: { name: 'depositoVoluntario', value: false } });
                        handleInputChange({ target: { name: 'otraGarantiaAcordada', value: false } });
                    }} className="h-4 w-4 text-purple-700 rounded-full mt-1" />
                    <div className="ml-3">
                        <p className="text-sm text-gray-700">Aplicar y ser aprobado en Seguro de Arrendamiento (la Aseguradora será Seleccionada por el Arrendador). En caso de que EL ARRENDATARIO opte por constituir como garantía un seguro de arrendamiento y resulte aprobado por la entidad aseguradora, este asumirá el pago del cincuenta por ciento (50 %) del valor total del seguro, como condición para la suscripción y vigencia del contrato, aceptando expresamente dicho porcentaje.</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <input type="radio" name="garantiaSeleccionada" value="depositoVoluntario" checked={formData.depositoVoluntario} onChange={() => {
                        handleInputChange({ target: { name: 'seguroArrendamiento', value: false } });
                        handleInputChange({ target: { name: 'depositoVoluntario', value: true } });
                        handleInputChange({ target: { name: 'otraGarantiaAcordada', value: false } });
                    }} className="h-4 w-4 text-purple-600 rounded-full mt-1" />
                    <div className="ml-3 flex-1">
                        <div className="text-sm text-gray-700 leading-relaxed">
                            Depósito voluntario propuesto por el interesado como garantía, equivalente a $
                            <input type="number" name="valorDepositoVoluntario" placeholder="0" value={formData.valorDepositoVoluntario} onChange={handleInputChange} className="w-28 px-1 py-0.5 border-0 border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none bg-transparent text-right text-sm" onWheel={(e) => e.target.blur()} />
                            . “El interesado manifiesta que, en caso de optar por un depósito voluntario como garantía adicional, este será de carácter reembolsable, sujeto al cumplimiento total de las obligaciones contractuales al momento de la terminación del contrato, conforme a las condiciones que se establecerán de manera definitiva en el contrato de arrendamiento”.
                        </div>
                    </div>
                </div>
                <div className="flex items-start">
                    <input type="radio" name="garantiaSeleccionada" value="otraGarantiaAcordada" checked={formData.otraGarantiaAcordada} onChange={() => {
                        handleInputChange({ target: { name: 'seguroArrendamiento', value: false } });
                        handleInputChange({ target: { name: 'depositoVoluntario', value: false } });
                        handleInputChange({ target: { name: 'otraGarantiaAcordada', value: true } });
                    }} className="h-4 w-4 text-purple-600 rounded-full mt-1" />
                    <div className="ml-3 flex-1">
                        <div className="text-sm text-gray-700 leading-relaxed">
                            Otra garantía acordada con el arrendador:
                            <input type="text" name="especificacionOtraGarantiaAcordada" placeholder="especifique la garantía" value={formData.especificacionOtraGarantiaAcordada} onChange={handleInputChange} className="inline-block px-1 py-0.5 border-0 border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none bg-transparent text-sm" style={{ minWidth: '180px', maxWidth: '100%' }} />
                            . El interesado entiende que la no aprobación o no constitución efectiva de la garantía seleccionada dará lugar a la no continuidad del proceso de arrendamiento, sin que ello genere obligación alguna para el ARRENDADOR.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GarantiasSection;