import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IconoUbicacion } from './iconosInicio';
import { crearMapa, iconoCasa } from '../portal/marcador';

const PATRON = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;
const CLAVE_CACHE = 'inmobiliaria.geocodificacion';

// Lo que copia Google Maps al tocar un punto ("4.1295747, -73.6220074") -> [latitud, longitud], o null.
function parsearCoordenadas(texto) {
  const m = PATRON.exec(texto || '');
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 ? [lat, lng] : null;
}

// El punto exacto guardado: la API publica lo da como latitud/longitud; las pantallas internas, como texto "coordenadas".
const puntoGuardado = (casa) => (casa.latitud != null && casa.longitud != null ? [casa.latitud, casa.longitud] : parsearCoordenadas(casa.coordenadas));

const direccionCompleta = (casa) => [casa.direccion, casa.barrio, casa.ciudad, 'Colombia'].filter(Boolean).join(', ');

const enlaceGoogleMaps = (casa, punto) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(punto ? punto.join(',') : direccionCompleta(casa))}`;

const leerCache = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE_CACHE)) || {}; } catch { return {}; }
};

// Si la propiedad no tiene coordenadas guardadas, se busca la direccion en OpenStreetMap (Nominatim) y el resultado
// se recuerda en el navegador para no repetir la consulta.
async function buscarDireccion(casa, senal) {
  const consulta = direccionCompleta(casa);
  const cache = leerCache();
  if (cache[consulta]) return cache[consulta];
  const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(consulta)}`, { signal: senal });
  const datos = await respuesta.json();
  if (!datos.length) return null;
  const punto = [Number(datos[0].lat), Number(datos[0].lon)];
  try { localStorage.setItem(CLAVE_CACHE, JSON.stringify({ ...cache, [consulta]: punto })); } catch { /* sin cache */ }
  return punto;
}

// Ventana con el mapa de una propiedad: marcador con el icono de casa en su ubicacion y boton a Google Maps.
function MapaInmueble({ casa, onCerrar }) {
  const contenedor = useRef(null);
  const [estado, setEstado] = useState('buscando'); // buscando | listo | sin-ubicacion
  const [punto, setPunto] = useState(null);
  const exacto = Boolean(puntoGuardado(casa));

  useEffect(() => {
    const control = new AbortController();
    const guardado = puntoGuardado(casa);
    if (guardado) {
      setPunto(guardado);
      setEstado('listo');
    } else {
      buscarDireccion(casa, control.signal)
        .then((encontrado) => {
          setPunto(encontrado);
          setEstado(encontrado ? 'listo' : 'sin-ubicacion');
        })
        .catch(() => { if (!control.signal.aborted) setEstado('sin-ubicacion'); });
    }
    return () => control.abort();
  }, [casa]);

  useEffect(() => {
    if (estado !== 'listo' || !punto) return undefined;
    const mapa = crearMapa(contenedor.current).setView(punto, 17, { animate: false });
    L.marker(punto, { icon: iconoCasa(), title: casa.direccion, keyboard: false }).addTo(mapa);
    mapa.invalidateSize();
    return () => mapa.remove();
  }, [estado, punto, casa.direccion]);

  useEffect(() => {
    const alTeclear = (e) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Ubicación de la propiedad"
    >
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <IconoUbicacion className="w-5 h-5 text-fuchsia-800" /> Ubicación
            </h3>
            <p className="text-sm text-gray-600">{[casa.direccion, casa.barrio, casa.ciudad].filter(Boolean).join(', ')}</p>
          </div>
          <button type="button" onClick={onCerrar} className="rounded-full px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cerrar</button>
        </div>

        <div className="relative h-[55vh] min-h-[18rem] bg-gray-100">
          {estado === 'listo' && <div ref={contenedor} className="h-full w-full" role="region" aria-label="Mapa" />}
          {estado === 'buscando' && <p className="flex h-full items-center justify-center text-gray-600">Buscando la ubicación...</p>}
          {estado === 'sin-ubicacion' && (
            <p className="flex h-full items-center justify-center px-6 text-center text-gray-600">
              No pudimos ubicar esta dirección en el mapa. Puedes buscarla directamente en Google Maps.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <a
            href={enlaceGoogleMaps(casa, punto)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-5 py-2 text-sm font-semibold text-white no-underline hover:bg-fuchsia-900"
          >
            <IconoUbicacion className="w-4 h-4" /> Abrir en Google Maps
          </a>
          {estado === 'listo' && !exacto && (
            <span className="text-xs text-gray-500">Ubicación aproximada según la dirección.</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapaInmueble;
