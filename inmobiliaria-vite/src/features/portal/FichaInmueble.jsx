import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  IconoAnterior, IconoArea, IconoBano, IconoCalendario, IconoCama, IconoCamara, IconoCasa, IconoCerrar, IconoCocina, IconoCompartir,
  IconoCorazon, IconoEdificio, IconoEnlace, IconoEscudo, IconoEstrella, IconoGaraje, IconoMapa, IconoPatio, IconoSala, IconoSiguiente,
  IconoTelefono, IconoUbicacion, IconoVideo, IconoWhatsapp,
} from '../inicio/iconosInicio';
import { enviarFormulario, fichaDeInmueble } from './api';
import { registrarEvento } from './analitica';
import { EMPRESA, enlaceWhatsapp } from './empresa';
import { useFavoritos } from './favoritos';
import { esVenta, formatearPrecio, idDeRuta, mensajeInmueble, rutaInmueble, textoOferta, textoUbicacion, urlParaCompartir } from './formato';
import { crearMapa, iconoCasa } from './marcador';
import { jsonLdDeInmueble, useSeo } from './seo';
import PiePortal from './PiePortal';
import TarjetaInmueble from './TarjetaInmueble';

const MapaInmueble = lazy(() => import('../inicio/MapaInmueble'));

const ICONOS_COMODIDAD = { habitaciones: IconoCama, 'baños': IconoBano, cocina: IconoCocina, garage: IconoGaraje, sala: IconoSala, comedor: IconoSala, patio: IconoPatio, tanquesubterraneo: IconoEdificio };
const ESTADOS = { nuevo: 'Nuevo', usado: 'Usado', planos: 'Sobre planos' };
const claseCampo = 'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-600';

// ---------------------------------------------------------------- galeria con visor ampliado
function Galeria({ fotos, titulo }) {
  const [actual, setActual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const total = fotos.length;
  const ir = useCallback((delta) => setActual((i) => (i + delta + total) % total), [total]);

  useEffect(() => {
    if (!ampliada) return undefined;
    const alTeclear = (e) => {
      if (e.key === 'Escape') setAmpliada(false);
      if (e.key === 'ArrowLeft') ir(-1);
      if (e.key === 'ArrowRight') ir(1);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [ampliada, ir]);

  if (total === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-300 md:h-96"><IconoCasa className="h-20 w-20" /></div>
    );
  }
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <button type="button" onClick={() => setAmpliada(true)} className="block w-full" aria-label="Ampliar foto">
          <img src={fotos[actual].url} alt={fotos[actual].descripcion || titulo} className="aspect-[16/10] w-full object-cover" decoding="async" />
        </button>
        {total > 1 && (
          <>
            <button type="button" onClick={() => ir(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"><IconoAnterior className="h-5 w-5" /></button>
            <button type="button" onClick={() => ir(1)} aria-label="Foto siguiente" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"><IconoSiguiente className="h-5 w-5" /></button>
          </>
        )}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
          <IconoCamara className="h-4 w-4" /> {actual + 1} / {total}
        </span>
      </div>
      {total > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Fotos del inmueble">
          {fotos.map((f, i) => (
            <li key={f.url} className="shrink-0">
              <button type="button" onClick={() => setActual(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === actual}
                className={`block overflow-hidden rounded-lg border-2 ${i === actual ? 'border-fuchsia-700' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                <img src={f.url} alt="" loading="lazy" decoding="async" className="h-16 w-24 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {ampliada && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Fotos ampliadas" onClick={() => setAmpliada(false)}>
          <button type="button" onClick={() => setAmpliada(false)} aria-label="Cerrar" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white"><IconoCerrar className="h-6 w-6" /></button>
          {total > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); ir(-1); }} aria-label="Foto anterior" className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white"><IconoAnterior className="h-6 w-6" /></button>}
          <img src={fotos[actual].url} alt={fotos[actual].descripcion || titulo} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          {total > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); ir(1); }} aria-label="Foto siguiente" className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white"><IconoSiguiente className="h-6 w-6" /></button>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- mapa dentro de la ficha
function MapaFicha({ casa, alAmpliar }) {
  const contenedor = useRef(null);
  const tiene = casa.latitud != null && casa.longitud != null;
  useEffect(() => {
    if (!tiene || !contenedor.current) return undefined;
    const mapa = crearMapa(contenedor.current).setView([casa.latitud, casa.longitud], 16, { animate: false });
    L.marker([casa.latitud, casa.longitud], { icon: iconoCasa(), title: casa.direccion, keyboard: false }).addTo(mapa);
    mapa.invalidateSize();
    return () => mapa.remove();
  }, [tiene, casa.latitud, casa.longitud, casa.direccion]);

  if (!tiene) {
    return (
      <button type="button" onClick={alAmpliar} className="inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-900">
        <IconoMapa className="h-4 w-4" /> Ver ubicación en el mapa
      </button>
    );
  }
  return <div ref={contenedor} className="h-72 overflow-hidden rounded-2xl border border-gray-200" role="region" aria-label="Mapa de la ubicación" />;
}

// ---------------------------------------------------------------- formulario de contacto / visita
function FormularioContacto({ casa }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [tipo, setTipo] = useState('info');
  const [datos, setDatos] = useState({ nombre: '', telefono: '', correo: '', mensaje: '', fecha_visita: '', franja_visita: 'manana', acepta_datos: false });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState('inicial'); // inicial | enviando | enviado
  const [aviso, setAviso] = useState('');

  const cambiar = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setAviso('');
    const nuevos = {};
    if (datos.nombre.trim().length < 3) nuevos.nombre = 'Escribe tu nombre.';
    if (datos.telefono.replace(/\D/g, '').length < 7) nuevos.telefono = 'Escribe un teléfono válido.';
    if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) nuevos.correo = 'Escribe un correo válido.';
    if (tipo === 'visita' && !datos.fecha_visita) nuevos.fecha_visita = 'Elige el día de la visita.';
    if (!datos.acepta_datos) nuevos.acepta_datos = 'Debes autorizar el uso de tus datos.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    setEstado('enviando');
    const carga = { ...datos, tipo, sitio_web: e.target.elements.sitio_web.value };
    if (tipo !== 'visita') { delete carga.fecha_visita; delete carga.franja_visita; }
    const r = await enviarFormulario(`/api/publico/inmuebles/${casa.id}/consulta/`, carga);
    if (r.ok) {
      registrarEvento('generar_lead', { tipo, inmueble: casa.id });
      setEstado('enviado');
      return;
    }
    setEstado('inicial');
    if (r.errores) setErrores(Object.fromEntries(Object.entries(r.errores).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
    else setAviso(r.limite ? 'Has enviado muchos mensajes seguidos. Inténtalo de nuevo en un rato.' : 'No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.');
  };

  if (estado === 'enviado') {
    return (
      <div className="rounded-xl bg-emerald-50 p-5 text-center" role="status">
        <IconoEscudo className="mx-auto h-10 w-10 text-emerald-700" />
        <p className="mt-2 font-semibold text-emerald-900">{tipo === 'visita' ? '¡Solicitud de visita enviada!' : '¡Mensaje enviado!'}</p>
        <p className="mt-1 text-sm text-emerald-800">Nos comunicaremos contigo al {datos.telefono}.</p>
      </div>
    );
  }

  const error = (k) => errores[k] && <span className="mt-1 block text-xs font-medium text-red-600">{errores[k]}</span>;
  const borde = (k) => (errores[k] ? 'border-red-400' : 'border-gray-300');
  return (
    <form onSubmit={enviar} noValidate className="space-y-3">
      <div role="tablist" aria-label="Qué quieres hacer" className="grid grid-cols-2 rounded-full border border-fuchsia-200 p-1">
        {[['info', 'Más información', IconoUbicacion], ['visita', 'Agendar visita', IconoCalendario]].map(([valor, texto, Icono]) => (
          <button key={valor} type="button" role="tab" aria-selected={tipo === valor} onClick={() => setTipo(valor)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold ${tipo === valor ? 'bg-fuchsia-800 text-white' : 'text-fuchsia-900'}`}>
            <Icono className="h-4 w-4" /> {texto}
          </button>
        ))}
      </div>

      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label>No llenar <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" defaultValue="" /></label></div>

      <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-800">Nombre *</span>
        <input name="nombre" value={datos.nombre} onChange={cambiar} autoComplete="name" className={`${claseCampo} ${borde('nombre')}`} />{error('nombre')}</label>
      <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-800">Teléfono / WhatsApp *</span>
        <input name="telefono" type="tel" value={datos.telefono} onChange={cambiar} autoComplete="tel" className={`${claseCampo} ${borde('telefono')}`} />{error('telefono')}</label>
      <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-800">Correo (opcional)</span>
        <input name="correo" type="email" value={datos.correo} onChange={cambiar} autoComplete="email" className={`${claseCampo} ${borde('correo')}`} />{error('correo')}</label>

      {tipo === 'visita' && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-800">Día *</span>
            <input name="fecha_visita" type="date" min={hoy} value={datos.fecha_visita} onChange={cambiar} className={`${claseCampo} ${borde('fecha_visita')}`} />{error('fecha_visita')}</label>
          <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-800">Franja</span>
            <select name="franja_visita" value={datos.franja_visita} onChange={cambiar} className={`${claseCampo} border-gray-300`}>
              <option value="manana">Mañana</option><option value="tarde">Tarde</option>
            </select></label>
        </div>
      )}

      <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-800">Mensaje (opcional)</span>
        <textarea name="mensaje" rows="3" value={datos.mensaje} onChange={cambiar} placeholder="¿Qué te gustaría saber?" className={`${claseCampo} border-gray-300`} /></label>

      <label className="flex items-start gap-2 text-xs text-gray-600">
        <input type="checkbox" name="acepta_datos" checked={datos.acepta_datos} onChange={cambiar} className="mt-0.5 h-4 w-4 shrink-0 accent-fuchsia-800" />
        <span>Autorizo el tratamiento de mis datos para que me contacten sobre este inmueble, según la <Link to="/politica-de-privacidad" target="_blank" className="font-semibold text-fuchsia-900">política de tratamiento de datos</Link>.</span>
      </label>
      {error('acepta_datos')}

      {aviso && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{aviso}</p>}
      <button type="submit" disabled={estado === 'enviando'} className="w-full rounded-full bg-fuchsia-800 py-3 font-semibold text-white hover:bg-fuchsia-900 disabled:opacity-60">
        {estado === 'enviando' ? 'Enviando...' : tipo === 'visita' ? 'Solicitar visita' : 'Enviar mensaje'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------- pagina
function FichaInmueble() {
  const { idslug } = useParams();
  const navigate = useNavigate();
  const id = idDeRuta(idslug);
  const [estado, setEstado] = useState({ cargando: true, casa: null });
  const [intento, setIntento] = useState(0);
  const [mapaAbierto, setMapaAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const { esFavorito, alternar } = useFavoritos();

  useEffect(() => {
    if (!id) { setEstado({ cargando: false, casa: null }); return undefined; }
    const control = new AbortController();
    setEstado({ cargando: true, casa: null });
    fichaDeInmueble(id, control.signal).then((casa) => {
      if (control.signal.aborted) return;
      setEstado({ cargando: false, casa: casa && casa.id ? casa : null });
      window.scrollTo(0, 0);
    });
    return () => control.abort();
  }, [id, intento]);

  const casa = estado.casa;
  const rutaCanonica = casa ? rutaInmueble(casa) : null;

  // Si el enlace trae un texto distinto (o ninguno), se corrige para que cada ficha tenga una sola direccion
  useEffect(() => {
    if (casa && window.location.pathname !== rutaCanonica) navigate(rutaCanonica, { replace: true });
  }, [casa, rutaCanonica, navigate]);

  const fotos = casa ? [casa.fotoPrincipal && { url: casa.fotoPrincipal, descripcion: '' }, ...(casa.imagenes || []).map((i) => ({ url: i.imagen, descripcion: i.descripcion }))].filter(Boolean) : [];

  useSeo({
    titulo: casa ? `${casa.titulo} · ${formatearPrecio(casa.precio)}` : 'Propiedad',
    descripcion: casa ? (casa.descripcion || `${casa.titulo}. ${casa.direccion}, ${casa.ciudad}.`).replace(/\s+/g, ' ').slice(0, 155) : undefined,
    imagen: casa?.fotoPrincipal || undefined,
    ruta: rutaCanonica || undefined,
    jsonLd: casa ? jsonLdDeInmueble(casa, `${window.location.origin}${rutaCanonica}`) : null,
    noIndexar: !casa && !estado.cargando,
  });

  const compartirPorWhatsapp = () => {
    registrarEvento('compartir', { medio: 'whatsapp', inmueble: casa.id });
    window.open(`https://wa.me/?text=${encodeURIComponent(`${casa.titulo} - ${formatearPrecio(casa.precio)}\n${urlParaCompartir(casa.id)}`)}`, '_blank', 'noopener,noreferrer');
  };
  const copiarEnlace = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}${rutaCanonica}`); setCopiado(true); setTimeout(() => setCopiado(false), 2500); registrarEvento('compartir', { medio: 'copiar', inmueble: casa.id }); } catch { /* sin permiso del portapapeles */ }
  };

  if (estado.cargando) {
    return <div className="min-h-screen bg-gray-50"><p className="px-4 py-24 text-center text-gray-600">Cargando la propiedad...</p></div>;
  }
  if (!casa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-xl px-4 py-24 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-50"><IconoCasa className="h-10 w-10 text-fuchsia-300" /></div>
          <h1 className="text-2xl font-bold text-gray-900">Esta propiedad ya no está disponible</h1>
          <p className="mt-3 text-gray-600">Puede que se haya arrendado o vendido, o que el enlace esté incompleto. Mira otras propiedades parecidas.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/propiedades" className="rounded-full bg-fuchsia-800 px-6 py-2.5 font-semibold text-white no-underline hover:bg-fuchsia-900">Ver propiedades</Link>
            <button type="button" onClick={() => setIntento((n) => n + 1)} className="rounded-full border border-fuchsia-800 px-6 py-2.5 font-semibold text-fuchsia-900">Reintentar</button>
          </div>
        </main>
        <PiePortal />
      </div>
    );
  }

  const datos = [
    casa.habitaciones && { Icono: IconoCama, valor: casa.habitaciones, texto: casa.habitaciones === 1 ? 'Habitación' : 'Habitaciones' },
    casa.banos && { Icono: IconoBano, valor: casa.banos, texto: casa.banos === 1 ? 'Baño' : 'Baños' },
    casa.parqueaderos && { Icono: IconoGaraje, valor: casa.parqueaderos, texto: casa.parqueaderos === 1 ? 'Parqueadero' : 'Parqueaderos' },
    casa.area && { Icono: IconoArea, valor: Number(casa.area), texto: 'm² construidos' },
  ].filter(Boolean);
  const detalles = [
    casa.estrato && ['Estrato', casa.estrato],
    casa.estado_inmueble && ['Estado', ESTADOS[casa.estado_inmueble]],
    casa.antiguedad != null && ['Antigüedad', `${casa.antiguedad} ${casa.antiguedad === 1 ? 'año' : 'años'}`],
    casa.tipoInmueble && ['Tipo', casa.tipoInmueble],
    casa.usoInmueble && ['Uso', casa.usoInmueble],
    casa.con_administracion && ['Administración', 'Con administración'],
    !esVenta(casa) && casa.deposito ? ['Depósito', formatearPrecio(casa.deposito)] : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
        <nav aria-label="Ruta de navegación" className="mb-4 text-sm text-gray-600">
          <Link to="/" className="text-gray-600 no-underline hover:underline">Inicio</Link> /{' '}
          <Link to={`/propiedades?modalidad=${casa.modalidad}`} className="text-gray-600 no-underline hover:underline">{esVenta(casa) ? 'En venta' : 'En arriendo'}</Link> /{' '}
          <span className="text-gray-900">{casa.titulo}</span>
        </nav>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-fuchsia-800 px-3 py-1 text-xs font-semibold text-white">{textoOferta(casa)}</span>
              {casa.destacada && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white"><IconoEstrella className="h-3.5 w-3.5" /> Destacada</span>}
              {casa.verificada && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white"><IconoEscudo className="h-3.5 w-3.5" /> Verificada</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{casa.titulo}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-gray-600"><IconoUbicacion className="h-4 w-4 text-fuchsia-800" /> {[casa.direccion, textoUbicacion(casa)].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => alternar(casa.id)} aria-pressed={esFavorito(casa.id)} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
              <IconoCorazon className={`h-4 w-4 ${esFavorito(casa.id) ? 'fill-fuchsia-700 text-fuchsia-700' : ''}`} /> {esFavorito(casa.id) ? 'Guardada' : 'Guardar'}
            </button>
            <button type="button" onClick={compartirPorWhatsapp} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800"><IconoCompartir className="h-4 w-4" /> Compartir</button>
            <button type="button" onClick={copiarEnlace} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800" aria-live="polite"><IconoEnlace className="h-4 w-4" /> {copiado ? '¡Copiado!' : 'Copiar enlace'}</button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
          <div className="min-w-0 space-y-8">
            <Galeria fotos={fotos} titulo={casa.titulo} />

            {datos.length > 0 && (
              <ul className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-4">
                {datos.map(({ Icono, valor, texto }) => (
                  <li key={texto} className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-900"><Icono className="h-6 w-6" /></span>
                    <span className="leading-tight"><strong className="block text-2xl font-bold text-gray-900">{valor}</strong><span className="text-sm text-gray-600">{texto}</span></span>
                  </li>
                ))}
              </ul>
            )}

            {casa.descripcion && (
              <section aria-labelledby="t-descripcion">
                <h2 id="t-descripcion" className="mb-3 text-xl font-bold text-gray-900">Descripción</h2>
                <p lang="es" className="whitespace-pre-line text-justify hyphens-auto leading-relaxed text-gray-700">{casa.descripcion}</p>
              </section>
            )}

            {detalles.length > 0 && (
              <section aria-labelledby="t-detalles">
                <h2 id="t-detalles" className="mb-3 text-xl font-bold text-gray-900">Detalles</h2>
                <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {detalles.map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-gray-100 py-2 text-sm"><dt className="text-gray-600">{k}</dt><dd className="font-semibold text-gray-900">{v}</dd></div>
                  ))}
                </dl>
              </section>
            )}

            {casa.comodidades?.length > 0 && (
              <section aria-labelledby="t-comodidades">
                <h2 id="t-comodidades" className="mb-3 text-xl font-bold text-gray-900">Espacios y comodidades</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {casa.comodidades.map(({ clave, etiqueta, cantidad, nota }) => {
                    const Icono = ICONOS_COMODIDAD[clave] || IconoCasa;
                    return (
                      <li key={clave} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-900"><Icono className="h-5 w-5" /></span>
                        <span className="leading-tight">
                          <span className="font-semibold text-gray-900">{cantidad != null && <strong className="mr-1 text-lg">{cantidad}</strong>}{etiqueta}</span>
                          {nota && <span className="block text-sm text-gray-600">{nota}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {casa.servicios?.length > 0 && (
              <section aria-labelledby="t-servicios">
                <h2 id="t-servicios" className="mb-3 text-xl font-bold text-gray-900">Servicios</h2>
                <ul className="flex flex-wrap gap-2">
                  {casa.servicios.map((s) => <li key={s} className="rounded-full bg-fuchsia-50 px-4 py-1.5 text-sm font-medium text-fuchsia-900">{s}</li>)}
                </ul>
              </section>
            )}

            {casa.condiciones && (
              <section aria-labelledby="t-condiciones">
                <h2 id="t-condiciones" className="mb-3 text-xl font-bold text-gray-900">{esVenta(casa) ? 'Condiciones' : 'Condiciones de arrendamiento'}</h2>
                <p lang="es" className="whitespace-pre-line text-justify hyphens-auto leading-relaxed text-gray-700">{casa.condiciones}</p>
              </section>
            )}

            {casa.videos?.length > 0 && (
              <section aria-labelledby="t-videos">
                <h2 id="t-videos" className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900"><IconoVideo className="h-5 w-5 text-fuchsia-800" /> Video</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {casa.videos.map((v) => (
                    <figure key={v.id}>
                      <video controls preload="metadata" className="w-full rounded-xl bg-black"><source src={v.video} /></video>
                      {v.descripcion && <figcaption className="mt-1 text-sm text-gray-600">{v.descripcion}</figcaption>}
                    </figure>
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby="t-ubicacion">
              <h2 id="t-ubicacion" className="mb-3 text-xl font-bold text-gray-900">Ubicación</h2>
              <MapaFicha casa={casa} alAmpliar={() => setMapaAbierto(true)} />
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(casa.latitud != null ? `${casa.latitud},${casa.longitud}` : [casa.direccion, casa.barrio, casa.ciudad, 'Colombia'].filter(Boolean).join(', '))}`}
                target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-900">
                <IconoMapa className="h-4 w-4" /> Cómo llegar en Google Maps
              </a>
            </section>
          </div>

          <aside id="contacto-ficha" className="scroll-mt-4 lg:sticky lg:top-4 lg:self-start" aria-label="Contacto">
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
              <div>
                <p className="text-3xl font-bold text-fuchsia-900">{formatearPrecio(casa.precio)}{!esVenta(casa) && <span className="ml-1 text-base font-normal text-gray-500">/mes</span>}</p>
                {!esVenta(casa) && casa.deposito ? <p className="text-sm text-gray-600">Depósito: {formatearPrecio(casa.deposito)}</p> : null}
              </div>
              <div className="grid gap-2">
                <a href={enlaceWhatsapp(mensajeInmueble(casa))} target="_blank" rel="noopener noreferrer" onClick={() => registrarEvento('clic_whatsapp', { origen: 'ficha', inmueble: casa.id })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1fa855] py-3 font-semibold text-white no-underline hover:bg-[#178a45]"><IconoWhatsapp className="h-5 w-5" /> Escribir por WhatsApp</a>
                <a href={`tel:+${EMPRESA.whatsapp}`} onClick={() => registrarEvento('clic_llamar', { inmueble: casa.id })}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-fuchsia-800 py-3 font-semibold text-fuchsia-900 no-underline hover:bg-fuchsia-50"><IconoTelefono className="h-5 w-5" /> Llamar {EMPRESA.telefono}</a>
                {!esVenta(casa) && (
                  <Link to={`/aplicar/${casa.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-800 py-3 font-semibold text-white no-underline hover:bg-fuchsia-900">Solicitar este arriendo</Link>
                )}
              </div>
              <hr className="border-gray-100" />
              <FormularioContacto casa={casa} />
            </div>
          </aside>
        </div>

        {casa.parecidos?.length > 0 && (
          <section className="mt-14" aria-labelledby="t-parecidas">
            <h2 id="t-parecidas" className="mb-6 border-l-4 border-fuchsia-800 pl-4 text-2xl font-bold text-gray-900">Propiedades parecidas</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {casa.parecidos.map((p) => <TarjetaInmueble key={p.id} casa={p} favorito={esFavorito(p.id)} alAlternarFavorito={alternar} />)}
            </div>
          </section>
        )}
      </main>

      {/* Barra fija en celular: el contacto siempre a mano sin tener que bajar hasta el formulario */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-lg font-bold text-fuchsia-900">{formatearPrecio(casa.precio)}{!esVenta(casa) && <span className="text-xs font-normal text-gray-500">/mes</span>}</p>
        </div>
        <a href={enlaceWhatsapp(mensajeInmueble(casa))} target="_blank" rel="noopener noreferrer" onClick={() => registrarEvento('clic_whatsapp', { origen: 'barra_movil', inmueble: casa.id })}
          aria-label="Escribir por WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1fa855] text-white no-underline"><IconoWhatsapp className="h-6 w-6" /></a>
        <a href="#contacto-ficha" className="rounded-full bg-fuchsia-800 px-5 py-2.5 text-sm font-semibold text-white no-underline">Contactar</a>
      </div>

      {mapaAbierto && (
        <Suspense fallback={null}><MapaInmueble casa={casa} onCerrar={() => setMapaAbierto(false)} /></Suspense>
      )}
      <PiePortal />
    </div>
  );
}

export default FichaInmueble;
