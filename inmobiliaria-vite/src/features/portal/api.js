import { API_URL } from '../../config';

// Pide datos a la API publica. Devuelve el JSON, o null si algo falla (el portal muestra un aviso en vez de romperse).
export async function pedir(ruta, parametros = {}, senal) {
  const consulta = new URLSearchParams(Object.entries(parametros).filter(([, v]) => v !== '' && v !== null && v !== undefined));
  const sufijo = consulta.toString() ? `?${consulta}` : '';
  try {
    const respuesta = await fetch(`${API_URL}${ruta}${sufijo}`, { signal: senal });
    if (!respuesta.ok) return null;
    return await respuesta.json();
  } catch {
    return null;
  }
}

export const buscarInmuebles = (parametros, senal) => pedir('/api/publico/inmuebles/', parametros, senal);
export const puntosDelMapa = (parametros, senal) => pedir('/api/publico/mapa/', parametros, senal);
export const opcionesDeFiltros = (senal) => pedir('/api/publico/filtros/', {}, senal);
export const fichaDeInmueble = (id, senal) => pedir(`/api/publico/inmuebles/${id}/`, {}, senal);

// Envia un formulario publico (consulta, visita o propiedad para publicar). Devuelve { ok, errores, limite }.
export async function enviarFormulario(ruta, datos) {
  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      method: 'POST',
      body: datos instanceof FormData ? datos : JSON.stringify(datos),
      headers: datos instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    });
    if (respuesta.ok) return { ok: true };
    if (respuesta.status === 429) return { ok: false, limite: true };
    if (respuesta.status === 400) return { ok: false, errores: await respuesta.json() };
    return { ok: false };
  } catch {
    return { ok: false, sinConexion: true };
  }
}
