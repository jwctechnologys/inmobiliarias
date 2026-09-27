// Texto para mostrar cuando el servidor rechaza un formulario. Responde {error: "..."} o, si un campo no es
// valido, {campo: ["mensaje"]}; sin esto un error de validacion se mostraba como "undefined".
export const motivoDeError = (data) => {
    if (!data || typeof data !== 'object') return 'Error desconocido';
    if (data.error) return data.error;
    const porCampo = Object.entries(data).map(([campo, msgs]) => `${campo}: ${[].concat(msgs).join(' ')}`);
    return porCampo.length ? porCampo.join(', ') : 'Error desconocido';
};
