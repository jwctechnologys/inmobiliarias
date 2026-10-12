import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../../config';
import { getCsrfToken } from '../../../utils/csrf';
import { IconoCalendario, IconoCasa, IconoCorreo, IconoEstrella, IconoTelefono, IconoWhatsapp } from '../../inicio/iconosInicio';
import { formatearPrecio } from '../formato';
import { useSeo } from '../seo';

// ---- acceso a la API de gestion (con la sesion del usuario)
async function leer(ruta) {
  const respuesta = await fetch(`${API_URL}${ruta}`, { credentials: 'include' });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
  return respuesta.json();
}

async function cambiar(ruta, cuerpo) {
  const token = await getCsrfToken();
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': token },
    body: JSON.stringify(cuerpo),
  });
  if (!respuesta.ok) throw new Error(String(respuesta.status));
  return respuesta.json();
}

const usuarioActual = () => {
  try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
};

function useLista(ruta) {
  const [estado, setEstado] = useState({ cargando: true, error: '', datos: [] });
  const cargar = useCallback(() => {
    setEstado((e) => ({ ...e, cargando: true, error: '' }));
    leer(ruta)
      .then((datos) => setEstado({ cargando: false, error: '', datos: Array.isArray(datos) ? datos : [] }))
      .catch((e) => setEstado({ cargando: false, error: e.message === '403' || e.message === '401' ? 'No tienes permiso para ver esta sección.' : 'No pudimos cargar los datos.', datos: [] }));
  }, [ruta]);
  useEffect(() => { cargar(); }, [cargar]);
  return { ...estado, cargar, reemplazar: (actualizado) => setEstado((e) => ({ ...e, datos: e.datos.map((d) => (d.id === actualizado.id ? actualizado : d)) })) };
}

const fecha = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
const soloNumeros = (t) => (t || '').replace(/\D/g, '');
const enlaceChat = (telefono, texto) => {
  const n = soloNumeros(telefono);
  return `https://wa.me/${n.length === 10 ? `57${n}` : n}?text=${encodeURIComponent(texto)}`;
};

const colorEstado = { pendiente: 'bg-amber-100 text-amber-800', nueva: 'bg-amber-100 text-amber-800', contactado: 'bg-emerald-100 text-emerald-800', atendida: 'bg-emerald-100 text-emerald-800', descartada: 'bg-gray-200 text-gray-700' };

function Caja({ titulo, subtitulo, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-[#1b0a26] via-[#3b1052] to-[#7a1f8e] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold md:text-3xl">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-gray-200">{subtitulo}</p>}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function Estado({ cargando, error, vacio, mensajeVacio, alReintentar }) {
  if (cargando) return <p className="py-10 text-center text-gray-600">Cargando...</p>;
  if (error) return <div className="rounded-2xl bg-white py-10 text-center shadow"><p className="text-gray-700">{error}</p><button type="button" onClick={alReintentar} className="mt-4 rounded-full bg-fuchsia-800 px-5 py-2 font-semibold text-white">Reintentar</button></div>;
  if (vacio) return <p className="rounded-2xl bg-white py-10 text-center text-gray-600 shadow">{mensajeVacio}</p>;
  return null;
}

// Cambia el estado y las notas de un elemento (solicitud o consulta) y avisa si algo falla
function ControlesDeSeguimiento({ item, ruta, estados, alActualizar }) {
  const [notas, setNotas] = useState(item.notas || '');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');
  const guardar = async (cambios) => {
    setGuardando(true); setAviso('');
    try { alActualizar(await cambiar(`${ruta}${item.id}/`, cambios)); } catch { setAviso('No se pudo guardar. Inténtalo de nuevo.'); } finally { setGuardando(false); }
  };
  return (
    <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-[12rem_1fr]">
      <label className="block text-sm"><span className="mb-1 block font-semibold text-gray-700">Estado</span>
        <select value={item.estado} disabled={guardando} onChange={(e) => guardar({ estado: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
          {estados.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select></label>
      <label className="block text-sm"><span className="mb-1 block font-semibold text-gray-700">Notas del equipo</span>
        <textarea rows="2" value={notas} onChange={(e) => setNotas(e.target.value)} onBlur={() => { if (notas !== (item.notas || '')) guardar({ notas }); }} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
      {aviso && <p role="alert" className="text-sm font-medium text-red-600 sm:col-span-2">{aviso}</p>}
    </div>
  );
}

const Contacto = ({ item, texto }) => (
  <div className="flex flex-wrap gap-2 text-sm">
    <a href={`tel:${soloNumeros(item.telefono)}`} className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-50 px-3 py-1.5 font-semibold text-fuchsia-900 no-underline"><IconoTelefono className="h-4 w-4" /> {item.telefono}</a>
    <a href={enlaceChat(item.telefono, texto)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#1fa855] px-3 py-1.5 font-semibold text-white no-underline"><IconoWhatsapp className="h-4 w-4" /> WhatsApp</a>
    {item.correo && <a href={`mailto:${item.correo}`} className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-50 px-3 py-1.5 font-semibold text-fuchsia-900 no-underline"><IconoCorreo className="h-4 w-4" /> {item.correo}</a>}
  </div>
);

// ---------------------------------------------------------------- consultas (admin: todas; propietario: las suyas)
function ListaConsultas({ filtroCasa }) {
  const ruta = `/api/gestion/consultas/${filtroCasa ? `?casa=${filtroCasa}` : ''}`;
  const { cargando, error, datos, cargar, reemplazar } = useLista(ruta);
  return (
    <div className="space-y-4">
      <Estado cargando={cargando} error={error} vacio={!datos.length} mensajeVacio="Todavía no hay consultas." alReintentar={cargar} />
      {datos.map((c) => (
        <article key={c.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">{c.nombre}</p>
              <p className="text-sm text-gray-600">{fecha(c.creada)} · <Link to={`/propiedad/${c.casa_id}`} className="font-semibold text-fuchsia-900">{c.casa || `Inmueble ${c.casa_id}`}</Link></p>
            </div>
            <div className="flex gap-2">
              {c.tipo === 'visita' && <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-900"><IconoCalendario className="h-3.5 w-3.5" /> Visita {c.fecha_visita} · {c.franja_visita === 'tarde' ? 'tarde' : 'mañana'}</span>}
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorEstado[c.estado]}`}>{c.estado}</span>
            </div>
          </div>
          {c.mensaje && <p className="mt-3 whitespace-pre-line text-gray-700">{c.mensaje}</p>}
          <div className="mt-3"><Contacto item={c} texto={`Hola ${c.nombre}, te escribimos por tu consulta sobre ${c.casa}.`} /></div>
          <ControlesDeSeguimiento item={c} ruta="/api/gestion/consultas/" estados={[['nueva', 'Nueva'], ['atendida', 'Atendida'], ['descartada', 'Descartada']]} alActualizar={reemplazar} />
        </article>
      ))}
    </div>
  );
}

function ListaPublicaciones() {
  const { cargando, error, datos, cargar, reemplazar } = useLista('/api/gestion/publicaciones/');
  return (
    <div className="space-y-4">
      <Estado cargando={cargando} error={error} vacio={!datos.length} mensajeVacio="Todavía no hay propiedades enviadas." alReintentar={cargar} />
      {datos.map((p) => (
        <article key={p.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-4">
              {p.foto && <img src={p.foto} alt="" className="h-20 w-28 rounded-lg object-cover" loading="lazy" />}
              <div>
                <p className="font-semibold text-gray-900">{p.nombre}</p>
                <p className="text-sm text-gray-600">{fecha(p.creada)}</p>
                <p className="mt-1 text-gray-800">{[p.tipoInmueble, p.modalidad === 'venta' ? 'en venta' : 'en arriendo'].filter(Boolean).join(' ')} · {[p.direccion, p.barrio, p.ciudad].filter(Boolean).join(', ')}</p>
                {p.precio ? <p className="text-sm font-semibold text-fuchsia-900">{formatearPrecio(p.precio)}</p> : null}
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorEstado[p.estado]}`}>{p.estado}</span>
          </div>
          {p.descripcion && <p className="mt-3 whitespace-pre-line text-gray-700">{p.descripcion}</p>}
          <div className="mt-3"><Contacto item={p} texto={`Hola ${p.nombre}, te escribimos de ${'Inmobiliaria CL'} por la propiedad que quieres publicar.`} /></div>
          <ControlesDeSeguimiento item={p} ruta="/api/gestion/publicaciones/" estados={[['pendiente', 'Pendiente'], ['contactado', 'Contactado'], ['descartada', 'Descartada']]} alActualizar={reemplazar} />
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- pantallas
export function SolicitudesDelPortal() {
  useSeo({ titulo: 'Solicitudes del portal', noIndexar: true });
  const [pestana, setPestana] = useState('consultas');
  return (
    <Caja titulo="Solicitudes del portal" subtitulo="Propiedades enviadas para publicar, consultas y visitas pedidas desde el portal.">
      <div role="tablist" className="mb-6 inline-flex rounded-full border border-fuchsia-200 bg-white p-1">
        {[['consultas', 'Consultas y visitas'], ['publicaciones', 'Propiedades por publicar']].map(([id, texto]) => (
          <button key={id} type="button" role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)} className={`rounded-full px-5 py-2 text-sm font-semibold ${pestana === id ? 'bg-fuchsia-800 text-white' : 'text-fuchsia-900'}`}>{texto}</button>
        ))}
      </div>
      {pestana === 'consultas' ? <ListaConsultas /> : <ListaPublicaciones />}
    </Caja>
  );
}

export function MisPropiedades() {
  useSeo({ titulo: 'Mis propiedades', noIndexar: true });
  const { cargando, error, datos, cargar } = useLista('/api/gestion/mis-inmuebles/');
  const [casaSeleccionada, setCasaSeleccionada] = useState(null);
  const esAdmin = (usuarioActual().groups || []).includes('administrador');
  const totales = datos.reduce((t, c) => ({ vistas: t.vistas + c.vistas, consultas: t.consultas + c.consultas, nuevas: t.nuevas + c.consultas_nuevas, publicadas: t.publicadas + (c.publicada ? 1 : 0) }), { vistas: 0, consultas: 0, nuevas: 0, publicadas: 0 });
  return (
    <Caja titulo={esAdmin ? 'Todas las propiedades' : 'Mis propiedades'} subtitulo="Cómo van tus anuncios: visitas a la ficha y personas interesadas.">
      <Estado cargando={cargando} error={error} vacio={!datos.length} mensajeVacio="Aún no tienes propiedades registradas." alReintentar={cargar} />
      {datos.length > 0 && (
        <>
          <dl className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[['Publicadas', totales.publicadas], ['Visitas a las fichas', totales.vistas], ['Consultas recibidas', totales.consultas], ['Consultas nuevas', totales.nuevas]].map(([t, v]) => (
              <div key={t} className="rounded-2xl border border-gray-200 bg-white p-5"><dt className="text-sm text-gray-600">{t}</dt><dd className="mt-1 text-3xl font-bold text-fuchsia-900">{v}</dd></div>
            ))}
          </dl>
          <ul className="space-y-4">
            {datos.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                {c.foto ? <img src={c.foto} alt="" className="h-20 w-28 rounded-lg object-cover" loading="lazy" /> : <div className="flex h-20 w-28 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-300"><IconoCasa className="h-8 w-8" /></div>}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{c.tipoInmueble || 'Inmueble'} · {c.direccion}</p>
                  <p className="text-sm text-gray-600">{[c.barrio, c.ciudad].filter(Boolean).join(', ')} · {formatearPrecio(c.precio)}{c.modalidad === 'venta' ? '' : '/mes'}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ${c.publicada ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>{c.arrendada ? 'Arrendada' : c.publicada ? 'Publicada' : 'No publicada'}</span>
                    {c.verificada && <span className="rounded-full bg-emerald-700 px-3 py-1 text-white">Verificada</span>}
                    {c.destacada && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-white"><IconoEstrella className="h-3 w-3" /> Destacada</span>}
                  </div>
                </div>
                <dl className="flex gap-6 text-center">
                  <div><dt className="text-xs text-gray-600">Visitas</dt><dd className="text-2xl font-bold text-gray-900">{c.vistas}</dd></div>
                  <div><dt className="text-xs text-gray-600">Consultas</dt><dd className="text-2xl font-bold text-gray-900">{c.consultas}{c.consultas_nuevas > 0 && <span className="ml-1 rounded-full bg-fuchsia-700 px-2 py-0.5 align-middle text-xs text-white">{c.consultas_nuevas} nuevas</span>}</dd></div>
                </dl>
                <div className="flex flex-col gap-2">
                  {c.publicada && <Link to={`/propiedad/${c.id}`} className="rounded-full border border-fuchsia-800 px-4 py-1.5 text-center text-sm font-semibold text-fuchsia-900 no-underline">Ver ficha</Link>}
                  {c.consultas > 0 && <button type="button" onClick={() => setCasaSeleccionada(casaSeleccionada === c.id ? null : c.id)} className="rounded-full bg-fuchsia-800 px-4 py-1.5 text-sm font-semibold text-white">{casaSeleccionada === c.id ? 'Ocultar consultas' : 'Ver consultas'}</button>}
                </div>
                {casaSeleccionada === c.id && <div className="w-full border-t border-gray-100 pt-4"><ListaConsultas filtroCasa={c.id} /></div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </Caja>
  );
}
