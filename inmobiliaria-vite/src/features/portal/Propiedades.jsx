import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IconoAnterior, IconoBuscar, IconoCerrar, IconoFiltros, IconoLista, IconoMapa, IconoSiguiente } from '../inicio/iconosInicio';
import { buscarInmuebles, opcionesDeFiltros, puntosDelMapa } from './api';
import { formatearPrecio, rutaInmueble, tituloDeBusqueda } from './formato';
import { useFavoritos } from './favoritos';
import { crearMapa, iconoCasa } from './marcador';
import { useSeo } from './seo';
import PiePortal from './PiePortal';
import TarjetaInmueble from './TarjetaInmueble';

const MapaInmueble = lazy(() => import('../inicio/MapaInmueble'));

const FILTROS = ['modalidad', 'tipo', 'ciudad', 'q', 'precio_min', 'precio_max', 'habitaciones', 'banos', 'parqueaderos', 'area_min', 'estrato', 'verificada'];
const POR_PAGINA = 12;
const ORDENES = [
  ['destacadas', 'Más relevantes'],
  ['recientes', 'Más recientes'],
  ['precio_asc', 'Precio: menor a mayor'],
  ['precio_desc', 'Precio: mayor a menor'],
];

const slug = (texto) => (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Chips({ etiqueta, valor, alCambiar }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-gray-800">{etiqueta}</legend>
      <div className="flex gap-2">
        {['', '1', '2', '3', '4'].map((n) => (
          <button
            key={n || 'todas'}
            type="button"
            aria-pressed={valor === n}
            onClick={() => alCambiar(n)}
            className={`min-w-10 rounded-full border px-3 py-1.5 text-sm font-semibold ${valor === n ? 'border-fuchsia-800 bg-fuchsia-800 text-white' : 'border-gray-300 text-gray-700 hover:border-fuchsia-800'}`}
          >
            {n ? `${n}+` : 'Todas'}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Campo({ etiqueta, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-gray-800">{etiqueta}</span>
      {children}
    </label>
  );
}

const claseCampo = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-600';

// Mapa con todos los inmuebles de la busqueda (los que tienen coordenadas)
function MapaDeResultados({ filtros }) {
  const contenedor = useRef(null);
  const [estado, setEstado] = useState({ cargando: true, puntos: [] });
  const clave = JSON.stringify(filtros);

  useEffect(() => {
    const control = new AbortController();
    puntosDelMapa(filtros, control.signal).then((datos) => {
      if (!control.signal.aborted) setEstado({ cargando: false, puntos: datos?.resultados ?? [] });
    });
    return () => control.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useEffect(() => {
    if (!contenedor.current) return undefined;
    const mapa = crearMapa(contenedor.current).setView([4.142, -73.626], 12, { animate: false });
    const icono = iconoCasa();
    const coordenadas = estado.puntos.filter((p) => p.latitud != null).map((p) => {
      const marcador = L.marker([p.latitud, p.longitud], { icon: icono, title: p.titulo }).addTo(mapa);
      const popup = document.createElement('div');
      popup.style.cssText = 'font:14px system-ui,sans-serif;min-width:170px';
      const titulo = document.createElement('strong');
      titulo.textContent = p.titulo;
      const precio = document.createElement('div');
      precio.textContent = formatearPrecio(p.precio) + (p.modalidad === 'venta' ? '' : ' /mes');
      precio.style.cssText = 'color:#86198f;font-weight:700;margin:2px 0 6px';
      const enlace = document.createElement('a');
      enlace.href = rutaInmueble(p);
      enlace.textContent = 'Ver propiedad';
      enlace.style.cssText = 'font-weight:600;color:#86198f';
      popup.append(titulo, precio, enlace);
      marcador.bindPopup(popup);
      return [p.latitud, p.longitud];
    });
    if (coordenadas.length === 1) mapa.setView(coordenadas[0], 15, { animate: false });
    else if (coordenadas.length > 1) mapa.fitBounds(coordenadas, { padding: [50, 50], maxZoom: 16, animate: false });
    mapa.invalidateSize();
    return () => mapa.remove();
  }, [estado.puntos]);

  return (
    <div className="relative h-[70vh] min-h-[22rem] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
      <div ref={contenedor} className="h-full w-full" role="region" aria-label="Mapa de propiedades" />
      {!estado.cargando && estado.puntos.length === 0 && (
        <p className="absolute inset-x-6 top-4 z-[500] rounded-lg bg-white/95 px-4 py-3 text-center text-sm text-gray-700 shadow">
          Ninguna de estas propiedades tiene ubicación en el mapa todavía. Usa la vista de lista.
        </p>
      )}
    </div>
  );
}

function Paginacion({ pagina, paginas, ir }) {
  if (paginas <= 1) return null;
  const numeros = [];
  for (let n = 1; n <= paginas; n += 1) {
    if (n === 1 || n === paginas || Math.abs(n - pagina) <= 1) numeros.push(n);
    else if (numeros[numeros.length - 1] !== '…') numeros.push('…');
  }
  const boton = 'flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold';
  return (
    <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button type="button" disabled={pagina <= 1} onClick={() => ir(pagina - 1)} className={`${boton} border-gray-300 disabled:opacity-40`} aria-label="Página anterior">
        <IconoAnterior className="h-4 w-4" />
      </button>
      {numeros.map((n, i) => (n === '…'
        ? <span key={`p${i}`} className="px-1 text-gray-400">…</span>
        : (
          <button key={n} type="button" aria-current={n === pagina ? 'page' : undefined} onClick={() => ir(n)}
            className={`${boton} ${n === pagina ? 'border-fuchsia-800 bg-fuchsia-800 text-white' : 'border-gray-300 text-gray-700 hover:border-fuchsia-800'}`}>
            {n}
          </button>
        )))}
      <button type="button" disabled={pagina >= paginas} onClick={() => ir(pagina + 1)} className={`${boton} border-gray-300 disabled:opacity-40`} aria-label="Página siguiente">
        <IconoSiguiente className="h-4 w-4" />
      </button>
    </nav>
  );
}

// Buscador completo: filtros, orden, lista paginada y mapa. Sirve tambien para /arriendo/:ciudad y /venta/:ciudad.
function Propiedades({ modalidadFija }) {
  const navigate = useNavigate();
  const { ciudad: ciudadDeRuta } = useParams();
  const [parametros, setParametros] = useSearchParams();
  const [opciones, setOpciones] = useState({ ciudades: [], tipos: [], conteo: {} });
  const [resultado, setResultado] = useState({ cargando: true, error: false, datos: null });
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [casaEnMapa, setCasaEnMapa] = useState(null);
  const { esFavorito, alternar } = useFavoritos();
  const [texto, setTexto] = useState(parametros.get('q') || '');

  useEffect(() => {
    const control = new AbortController();
    opcionesDeFiltros(control.signal).then((datos) => { if (datos && !Array.isArray(datos)) setOpciones(datos); });
    return () => control.abort();
  }, []);

  // La ciudad de un enlace como /arriendo/villavicencio se convierte en el nombre real (con tildes) de la lista
  const ciudadReal = useMemo(() => {
    if (!ciudadDeRuta) return '';
    return (opciones.ciudades || []).find((c) => slug(c) === slug(ciudadDeRuta)) || '';
  }, [ciudadDeRuta, opciones.ciudades]);

  const filtros = useMemo(() => {
    const f = {};
    FILTROS.forEach((k) => { if (parametros.get(k)) f[k] = parametros.get(k); });
    if (modalidadFija) f.modalidad = modalidadFija;
    if (ciudadDeRuta) f.ciudad = ciudadReal || ciudadDeRuta.replace(/-/g, ' ');
    return f;
  }, [parametros, modalidadFija, ciudadDeRuta, ciudadReal]);

  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1);
  const orden = parametros.get('orden') || 'destacadas';
  const vista = parametros.get('vista') === 'mapa' ? 'mapa' : 'lista';
  const claveBusqueda = JSON.stringify({ filtros, pagina, orden });

  useEffect(() => {
    const control = new AbortController();
    setResultado((r) => ({ ...r, cargando: true, error: false }));
    buscarInmuebles({ ...filtros, orden, pagina, por_pagina: POR_PAGINA }, control.signal).then((datos) => {
      if (control.signal.aborted) return;
      setResultado(datos && datos.resultados ? { cargando: false, error: false, datos } : { cargando: false, error: true, datos: null });
    });
    return () => control.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveBusqueda]);

  const cambiar = useCallback((cambios) => {
    const nuevos = new URLSearchParams(parametros);
    Object.entries(cambios).forEach(([k, v]) => { if (v === '' || v === null || v === undefined || v === false) nuevos.delete(k); else nuevos.set(k, String(v)); });
    if (!('pagina' in cambios)) nuevos.delete('pagina');
    setParametros(nuevos, { replace: true });
  }, [parametros, setParametros]);

  // Al cambiar de modalidad desde un enlace /arriendo/... se pasa a la busqueda normal (que si admite cualquiera)
  const elegirModalidad = (valor) => {
    if (modalidadFija) {
      const nuevos = new URLSearchParams(parametros);
      if (valor) nuevos.set('modalidad', valor);
      navigate(`/propiedades?${nuevos}`);
    } else {
      cambiar({ modalidad: valor });
    }
  };

  const hayFiltros = FILTROS.some((k) => parametros.get(k)) && !(Object.keys(filtros).length === 1 && modalidadFija);
  const limpiar = () => {
    setTexto('');
    if (modalidadFija || ciudadDeRuta) navigate('/propiedades'); else setParametros({}, { replace: true });
  };

  const datos = resultado.datos;
  const lista = datos?.resultados ?? [];
  const titulo = tituloDeBusqueda({ modalidad: filtros.modalidad, tipo: filtros.tipo, ciudad: filtros.ciudad, q: filtros.q });
  const { rejilla, variante } = lista.length === 1 ? { rejilla: 'grid-cols-1', variante: 'destacada' } : { rejilla: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3', variante: 'normal' };

  useSeo({
    titulo,
    descripcion: `${titulo}: ${datos?.total ?? ''} propiedades disponibles con fotos, precios y ubicación. Encuentra tu próximo hogar con ${'Inmobiliaria CL'}.`,
    ruta: `${window.location.pathname}${filtros.q || filtros.tipo || pagina > 1 ? window.location.search : ''}`,
    noIndexar: Boolean(filtros.q) || pagina > 3,
  });

  const panel = (
    <div className="space-y-5">
      <form onSubmit={(e) => { e.preventDefault(); cambiar({ q: texto.trim() }); }} className="flex gap-2" role="search">
        <label className="flex-1">
          <span className="sr-only">Buscar por barrio, dirección o palabra</span>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Barrio, dirección o palabra..." className={claseCampo} />
        </label>
        <button type="submit" aria-label="Buscar" className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-800 text-white"><IconoBuscar className="h-5 w-5" /></button>
      </form>

      <Campo etiqueta="Tipo de propiedad">
        <select value={parametros.get('tipo') || ''} onChange={(e) => cambiar({ tipo: e.target.value })} className={claseCampo}>
          <option value="">Todos</option>
          {(opciones.tipos || []).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Campo>

      {!ciudadDeRuta && (
        <Campo etiqueta="Ciudad">
          <select value={parametros.get('ciudad') || ''} onChange={(e) => cambiar({ ciudad: e.target.value })} className={claseCampo}>
            <option value="">Todas</option>
            {(opciones.ciudades || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
      )}

      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-gray-800">Precio (COP)</legend>
        <div className="grid grid-cols-2 gap-2">
          <label><span className="sr-only">Precio mínimo</span><input type="number" min="0" inputMode="numeric" placeholder="Mínimo" value={parametros.get('precio_min') || ''} onChange={(e) => cambiar({ precio_min: e.target.value })} className={claseCampo} /></label>
          <label><span className="sr-only">Precio máximo</span><input type="number" min="0" inputMode="numeric" placeholder="Máximo" value={parametros.get('precio_max') || ''} onChange={(e) => cambiar({ precio_max: e.target.value })} className={claseCampo} /></label>
        </div>
      </fieldset>

      <Chips etiqueta="Habitaciones" valor={parametros.get('habitaciones') || ''} alCambiar={(v) => cambiar({ habitaciones: v })} />
      <Chips etiqueta="Baños" valor={parametros.get('banos') || ''} alCambiar={(v) => cambiar({ banos: v })} />
      <Chips etiqueta="Parqueaderos" valor={parametros.get('parqueaderos') || ''} alCambiar={(v) => cambiar({ parqueaderos: v })} />

      <Campo etiqueta="Área mínima (m²)">
        <input type="number" min="0" inputMode="numeric" value={parametros.get('area_min') || ''} onChange={(e) => cambiar({ area_min: e.target.value })} className={claseCampo} />
      </Campo>

      <Campo etiqueta="Estrato">
        <select value={parametros.get('estrato') || ''} onChange={(e) => cambiar({ estrato: e.target.value })} className={claseCampo}>
          <option value="">Cualquiera</option>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </Campo>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800">
        <input type="checkbox" checked={parametros.get('verificada') === '1'} onChange={(e) => cambiar({ verificada: e.target.checked ? '1' : '' })} className="h-4 w-4 accent-fuchsia-800" />
        Solo propiedades verificadas
      </label>

      {hayFiltros && <button type="button" onClick={limpiar} className="w-full rounded-full border border-fuchsia-800 py-2 text-sm font-semibold text-fuchsia-900 hover:bg-fuchsia-50">Limpiar filtros</button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-[#1b0a26] via-[#3b1052] to-[#7a1f8e] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav aria-label="Ruta de navegación" className="mb-3 text-sm text-fuchsia-200">
            <Link to="/" className="text-fuchsia-200 no-underline hover:underline">Inicio</Link> / <span>Propiedades</span>
          </nav>
          <h1 className="text-3xl font-bold md:text-4xl">{titulo}</h1>
          <p className="mt-2 text-gray-200" aria-live="polite">
            {resultado.cargando && !datos ? 'Buscando...' : `${datos?.total ?? 0} ${datos?.total === 1 ? 'propiedad disponible' : 'propiedades disponibles'}`}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="Tipo de oferta" className="inline-flex rounded-full border border-fuchsia-200 bg-white p-1 shadow-sm">
            {[['', 'Todas', opciones.conteo?.todas], ['arriendo', 'En arriendo', opciones.conteo?.arriendo], ['venta', 'En venta', opciones.conteo?.venta]].map(([valor, texto, n]) => {
              const activo = (filtros.modalidad || '') === valor;
              return (
                <button key={valor || 'todas'} type="button" role="tab" aria-selected={activo} onClick={() => elegirModalidad(valor)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${activo ? 'bg-fuchsia-800 text-white' : 'text-fuchsia-900 hover:bg-fuchsia-50'}`}>
                  {texto}{n !== undefined && <span className={activo ? ' text-fuchsia-200' : ' text-gray-400'}> ({n})</span>}
                </button>
              );
            })}
          </div>

          <label className="ml-auto flex items-center gap-2 text-sm text-gray-700">
            <span className="font-semibold">Ordenar</span>
            <select value={orden} onChange={(e) => cambiar({ orden: e.target.value === 'destacadas' ? '' : e.target.value })} className={`${claseCampo} !w-auto`}>
              {ORDENES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>

          <div className="inline-flex rounded-full border border-gray-300 bg-white p-1" role="group" aria-label="Vista">
            <button type="button" aria-pressed={vista === 'lista'} onClick={() => cambiar({ vista: '' })} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${vista === 'lista' ? 'bg-fuchsia-800 text-white' : 'text-gray-700'}`}><IconoLista className="h-4 w-4" /> Lista</button>
            <button type="button" aria-pressed={vista === 'mapa'} onClick={() => cambiar({ vista: 'mapa' })} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${vista === 'mapa' ? 'bg-fuchsia-800 text-white' : 'text-gray-700'}`}><IconoMapa className="h-4 w-4" /> Mapa</button>
          </div>

          <button type="button" onClick={() => setPanelAbierto(true)} className="inline-flex items-center gap-2 rounded-full border border-fuchsia-800 px-4 py-2 text-sm font-semibold text-fuchsia-900 lg:hidden">
            <IconoFiltros className="h-4 w-4" /> Filtros
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <aside className="hidden self-start rounded-2xl border border-gray-200 bg-white p-5 lg:block" aria-label="Filtros de búsqueda">{panel}</aside>

          <section aria-label="Resultados">
            {vista === 'mapa' ? (
              <MapaDeResultados filtros={{ ...filtros, orden }} />
            ) : resultado.error ? (
              <div className="rounded-2xl bg-white py-14 text-center shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">No pudimos cargar las propiedades</h2>
                <p className="mt-2 text-gray-600">Revisa tu conexión e inténtalo de nuevo.</p>
                <button type="button" onClick={() => setParametros(new URLSearchParams(parametros), { replace: true })} className="mt-5 rounded-full bg-fuchsia-800 px-6 py-2.5 font-semibold text-white">Reintentar</button>
              </div>
            ) : !resultado.cargando && lista.length === 0 ? (
              <div className="rounded-2xl bg-white py-14 text-center shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">Ninguna propiedad coincide con tu búsqueda</h2>
                <p className="mt-2 text-gray-600">Prueba con menos filtros o con otra zona.</p>
                {hayFiltros && <button type="button" onClick={limpiar} className="mt-5 rounded-full bg-fuchsia-800 px-6 py-2.5 font-semibold text-white">Quitar filtros</button>}
                <p className="mt-6 text-sm text-gray-600">¿No encuentras lo que buscas? <Link to="/contacto" className="font-semibold text-fuchsia-900">Cuéntanos qué necesitas</Link>.</p>
              </div>
            ) : (
              <div className={resultado.cargando ? 'opacity-60 transition-opacity' : ''} aria-busy={resultado.cargando}>
                <div className={`grid gap-6 ${rejilla}`}>
                  {lista.map((casa) => (
                    <TarjetaInmueble key={casa.id} casa={casa} variante={variante} favorito={esFavorito(casa.id)} alAlternarFavorito={alternar} alVerMapa={setCasaEnMapa} />
                  ))}
                </div>
                <Paginacion pagina={datos?.pagina || 1} paginas={datos?.paginas || 1} ir={(n) => { cambiar({ pagina: n > 1 ? n : '' }); window.scrollTo(0, 0); }} />
              </div>
            )}
          </section>
        </div>
      </main>

      {panelAbierto && (
        <div className="fixed inset-0 z-[1500] flex lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPanelAbierto(false)} />
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
              <button type="button" onClick={() => setPanelAbierto(false)} aria-label="Cerrar filtros" className="rounded-full p-2 hover:bg-gray-100"><IconoCerrar className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{panel}</div>
            <div className="border-t border-gray-100 px-5 py-4">
              <button type="button" onClick={() => setPanelAbierto(false)} className="w-full rounded-full bg-fuchsia-800 py-3 font-semibold text-white">
                Ver {datos?.total ?? 0} {datos?.total === 1 ? 'propiedad' : 'propiedades'}
              </button>
            </div>
          </div>
        </div>
      )}

      {casaEnMapa && (
        <Suspense fallback={null}>
          <MapaInmueble casa={casaEnMapa} onCerrar={() => setCasaEnMapa(null)} />
        </Suspense>
      )}

      <PiePortal />
    </div>
  );
}

export default Propiedades;
