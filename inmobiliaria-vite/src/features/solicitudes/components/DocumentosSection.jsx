// components/DocumentosSection.jsx
import React from 'react';

const DocumentosSection = ({ formData, handleFileChange, handleMultipleFilesChange, nombresArchivos, fileInputClassName }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-200 pb-2">7. DOCUMENTOS REQUERIDOS</h2>
            <p className="text-sm text-red-600 mb-2">* Documentos obligatorios para procesar la solicitud (Cédula Arrendatario y Cédula Codeudor)</p>
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cédula Arrendatario - OBLIGATORIO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cédula Arrendatario <span className="text-red-600">*</span>
                        </label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'cedulaArrendatario')} accept=".pdf,.jpg,.png,.jpeg" required className={fileInputClassName} />
                        {nombresArchivos.cedulaArrendatario && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.cedulaArrendatario}</p>}
                    </div>

                    {/* Cédula Codeudor - OBLIGATORIO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cédula Codeudor <span className="text-red-600">*</span>
                        </label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'cedulaCodeudor')} accept=".pdf,.jpg,.png,.jpeg" required className={fileInputClassName} />
                        {nombresArchivos.cedulaCodeudor && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.cedulaCodeudor}</p>}
                    </div>

                    {/* Cédulas de Habitantes - OPCIONAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cédulas de Habitantes (Opcional)</label>
                        <input type="file" multiple onChange={handleMultipleFilesChange} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                        {nombresArchivos.cedulasHabitantes && <p className="text-xs text-green-600 mt-1">Archivos seleccionados: {nombresArchivos.cedulasHabitantes}</p>}
                        <p className="text-xs text-gray-500 mt-1">Personas mayores de edad que habitarán el inmueble</p>
                    </div>

                    {/* Certificado Laboral Arrendatario - OPCIONAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificado Laboral Arrendatario (Opcional)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'certificado_laboral_arrendatario')} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                        {nombresArchivos.certificado_laboral_arrendatario && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.certificado_laboral_arrendatario}</p>}
                    </div>

                    {/* Certificado Laboral Codeudor - OPCIONAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificado Laboral Codeudor (Opcional)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'certificado_laboral_codeudor')} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                        {nombresArchivos.certificado_laboral_codeudor && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.certificado_laboral_codeudor}</p>}
                    </div>

                    {/* Desprendible de Nómina Arrendatario - OPCIONAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desprendible de Nómina Arrendatario (Opcional)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'desprendible_nomina_arrendatario')} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                        {nombresArchivos.desprendible_nomina_arrendatario && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.desprendible_nomina_arrendatario}</p>}
                    </div>

                    {/* Desprendible de Nómina Codeudor - OPCIONAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desprendible de Nómina Codeudor (Opcional)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'desprendible_nomina_codeudor')} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                        {nombresArchivos.desprendible_nomina_codeudor && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.desprendible_nomina_codeudor}</p>}
                    </div>

                    {/* Declaración de Renta Arrendatario (condicional) - OPCIONAL */}
                    {formData.declaraRenta && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Declaración de Renta Arrendatario (Opcional)</label>
                            <input type="file" onChange={(e) => handleFileChange(e, 'declaracion_renta_arrendatario')} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                            {nombresArchivos.declaracion_renta_arrendatario && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.declaracion_renta_arrendatario}</p>}
                            <p className="text-xs text-gray-500 mt-1">Requerido solo si declara renta</p>
                        </div>
                    )}

                    {/* Declaración de Renta Codeudor (condicional) - OPCIONAL */}
                    {formData.coarrendatarioNuevo?.declaraRenta && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Declaración de Renta Codeudor (Opcional)</label>
                            <input type="file" onChange={(e) => handleFileChange(e, 'declaracion_renta_codeudor')} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                            {nombresArchivos.declaracion_renta_codeudor && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.declaracion_renta_codeudor}</p>}
                        </div>
                    )}

                    {/* Cámara de Comercio Arrendatario - OPCIONAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cámara de Comercio Arrendatario (Opcional)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'camara_comercio_arrendatario')} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                        {nombresArchivos.camara_comercio_arrendatario && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.camara_comercio_arrendatario}</p>}
                        <p className="text-xs text-gray-500 mt-1">Requerido solo si es trabajador independiente</p>
                    </div>

                    {/* Cámara de Comercio Codeudor - OPCIONAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cámara de Comercio Codeudor (Opcional)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'camara_comercio_codeudor')} accept=".pdf,.jpg,.png,.jpeg" className={fileInputClassName} />
                        {nombresArchivos.camara_comercio_codeudor && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {nombresArchivos.camara_comercio_codeudor}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentosSection;