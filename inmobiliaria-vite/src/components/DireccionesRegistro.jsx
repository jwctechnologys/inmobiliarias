// Direcciones de residencia y de correspondencia de los formularios de registro.
// La mayoria de las personas recibe la correspondencia donde vive: se pide la residencia y, con la casilla
// marcada (por defecto), esa misma direccion/barrio/ciudad se usa como correspondencia. Al desmarcarla
// aparecen los campos de correspondencia. Ver correspondenciaAEnviar() para lo que se envia al servidor.
import React from 'react';

const CAMPOS = [
    { clave: 'direccion', etiqueta: 'Dirección', ejemplo: 'Ej: Calle 26 # 69-76' },
    { clave: 'barrio', etiqueta: 'Barrio', ejemplo: 'Ej: Salitre' },
    { clave: 'ciudad', etiqueta: 'Ciudad', ejemplo: 'Ej: Bogotá' },
];

const EJEMPLOS_CORRESPONDENCIA = {
    direccion: 'Ej: Carrera 7 # 123-45',
    barrio: 'Ej: Chapinero',
    ciudad: 'Ej: Bogotá',
};

// Correspondencia que se envia al servidor: con la casilla marcada es igual a la residencia.
export const correspondenciaAEnviar = (mismaDireccion, valores) => ({
    direccionCorrespondencia: mismaDireccion ? valores.direccion : valores.direccionCorrespondencia,
    barrioCorrespondencia: mismaDireccion ? valores.barrio : valores.barrioCorrespondencia,
    ciudadCorrespondencia: mismaDireccion ? valores.ciudad : valores.ciudadCorrespondencia,
});

const DireccionesRegistro = ({
    valores,
    onChange,
    mismaDireccion,
    onMismaDireccionChange,
    residenciaObligatoria = true, // false: la residencia es opcional mientras la correspondencia se pida aparte
    inputClassName,
    labelClassName,
    sectionTitleClassName,
}) => {
    // Si la residencia hace de correspondencia, siempre hay que llenarla.
    const residenciaRequerida = residenciaObligatoria || mismaDireccion;

    return (
        <div className="space-y-6">
            <div>
                <h2 className={sectionTitleClassName}>
                    Dirección de Residencia
                    {!residenciaRequerida && <span className="text-sm font-normal text-gray-500"> (Opcional)</span>}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CAMPOS.map(({ clave, etiqueta, ejemplo }) => (
                        <div key={clave}>
                            <label className={labelClassName}>{etiqueta}{residenciaRequerida ? ' *' : ''}</label>
                            <input
                                type="text"
                                placeholder={ejemplo}
                                value={valores[clave]}
                                onChange={(e) => onChange(clave, e.target.value)}
                                required={residenciaRequerida}
                                className={inputClassName}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                    type="checkbox"
                    checked={mismaDireccion}
                    onChange={(e) => onMismaDireccionChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                />
                La dirección de correspondencia es la misma que la de residencia
            </label>

            {!mismaDireccion && (
                <div>
                    <h2 className={sectionTitleClassName}>Dirección de Correspondencia</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {CAMPOS.map(({ clave, etiqueta }) => {
                            const claveCorr = `${clave}Correspondencia`;
                            return (
                                <div key={claveCorr}>
                                    <label className={labelClassName}>{etiqueta} *</label>
                                    <input
                                        type="text"
                                        placeholder={EJEMPLOS_CORRESPONDENCIA[clave]}
                                        value={valores[claveCorr]}
                                        onChange={(e) => onChange(claveCorr, e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DireccionesRegistro;
