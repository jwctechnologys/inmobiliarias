// Home.jsx: portada del portal. Busca propiedades (lleva al buscador completo), muestra las destacadas y invita a publicar.
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconoBuscar, IconoCasa, IconoEdificio, IconoEscudo, IconoEtiqueta, IconoFlecha, IconoLlave, IconoMegafono, IconoPersonas,
  IconoUbicacion, IconoWhatsapp,
} from './iconosInicio';
import { buscarInmuebles, opcionesDeFiltros } from '../portal/api';
import { EMPRESA, MENSAJE_GENERAL, MENSAJE_PUBLICAR, enlaceWhatsapp } from '../portal/empresa';
import { useFavoritos } from '../portal/favoritos';
import { registrarEvento } from '../portal/analitica';
import { useSeo } from '../portal/seo';
import PiePortal from '../portal/PiePortal';
import TarjetaInmueble, { distribucion } from '../portal/TarjetaInmueble';

const MapaInmueble = lazy(() => import('./MapaInmueble'));

// Foto opcional del encabezado: si existe public/images/portada-inmobiliaria.jpg se usa de fondo; si no, el
// degradado morado de la marca. Se prueba con un <img> porque el servidor puede responder con la pagina de
// inicio (no con un 404) cuando el archivo no existe.
const FOTO_PORTADA = '/images/portada-inmobiliaria.jpg';

const SEGMENTOS = [
  { id: '', texto: 'Todas' },
  { id: 'arriendo', texto: 'En arriendo' },
  { id: 'venta', texto: 'En venta' },
];

const BENEFICIOS_PUBLICAR = [
  { Icono: IconoEdificio, titulo: 'Más visibilidad', detalle: 'Tu inmueble frente a quienes buscan' },
  { Icono: IconoPersonas, titulo: 'Acompañamiento', detalle: 'Te guiamos en todo el proceso' },
  { Icono: IconoEscudo, titulo: 'Trámites seguros', detalle: 'Contratos y gestión con respaldo' },
];

const VENTAJAS = [
  { Icono: IconoEscudo, titulo: 'Seguridad', detalle: 'en tus trámites' },
  { Icono: IconoPersonas, titulo: 'Asesoría', detalle: 'personalizada' },
  { Icono: IconoEdificio, titulo: 'Amplia oferta', detalle: 'de propiedades' },
  { Icono: IconoUbicacion, titulo: 'Las mejores zonas', detalle: 'de la ciudad y alrededores' },
];

const claseCampo = 'w-full appearance-none bg-transparent text-sm text-gray-700 focus:outline-none';

function Home() {
  const [opciones, setOpciones] = useState({ ciudades: [], tipos: [], conteo: {} });
  const [segmento, setSegmento] = useState('');
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: false, lista: [] });
  const [fotoPortada, setFotoPortada] = useState(false);
  const [casaEnMapa, setCasaEnMapa] = useState(null);
  const [busqueda, setBusqueda] = useState({ modalidad: '', tipo: '', ciudad: '', q: '' });
  const navigate = useNavigate();
  const { esFavorito, alternar } = useFavoritos();

  useSeo({
    titulo: 'Propiedades en arriendo y en venta',
    descripcion: `Encuentra casas, apartamentos y locales en arriendo y en venta en ${EMPRESA.ciudad}. Fotos, precios, ubicación en el mapa y contacto directo con ${EMPRESA.nombre}.`,
    ruta: '/',
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: EMPRESA.nombre, url: window.location.origin,
      telephone: EMPRESA.telefono, email: EMPRESA.correo || undefined,
      address: { '@type': 'PostalAddress', addressLocality: EMPRESA.ciudad, addressCountry: 'CO', streetAddress: EMPRESA.direccion || undefined },
    },
  });

  useEffect(() => {
    const control = new AbortController();
    opcionesDeFiltros(control.signal).then((datos) => { if (datos && !Array.isArray(datos)) setOpciones(datos); });
    return () => control.abort();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setFotoPortada(true);
    img.src = FOTO_PORTADA;
  }, []);

  useEffect(() => {
    const control = new AbortController();
    setEstado((e) => ({ ...e, cargando: true, error: false }));
    buscarInmuebles({ modalidad: segmento, por_pagina: 8, orden: 'destacadas' }, control.signal).then((datos) => {
      if (control.signal.aborted) return;
      setEstado(datos && datos.resultados ? { cargando: false, error: false, lista: datos.resultados } : { cargando: false, error: true, lista: [] });
    });
    return () => control.abort();
  }, [segmento, intento]);

  const { rejilla, variante } = useMemo(() => distribucion(estado.lista.length), [estado.lista.length]);
  const conteo = opciones.conteo || {};
  const enlaceVerTodas = `/propiedades${segmento ? `?modalidad=${segmento}` : ''}`;

  const buscar = (e) => {
    e.preventDefault();
    const parametros = new URLSearchParams(Object.entries(busqueda).filter(([, v]) => v));
    registrarEvento('buscar', { ...busqueda });
    navigate(`/propiedades${parametros.toString() ? `?${parametros}` : ''}`);
  };
  const cambiar = (clave) => (e) => setBusqueda((b) => ({ ...b, [clave]: e.target.value }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1b0a26] via-[#3b1052] to-[#7a1f8e] text-white">
        {fotoPortada && (
          <>
            <img src={FOTO_PORTADA} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#1b0a26] via-[#1b0a26]/70 to-transparent" />
          </>
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-16 pb-28 sm:px-6 md:py-24 md:pb-32 lg:px-8">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-200 sm:text-sm">
            <IconoLlave className="h-5 w-5" /> Tu aliado en el sueño de tu hogar
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            ¡Bienvenidos a <span className="text-fuchsia-300">{EMPRESA.nombre}</span>!
          </h1>
          <p className="mt-5 max-w-xl text-base text-gray-200 md:text-lg">
            Tu aliado de confianza en la búsqueda del hogar o inversión ideal. Estamos aquí para ayudarte a encontrar el espacio perfecto que se
            ajuste a tus sueños y necesidades.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/publicar-propiedad" className="inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-9 py-4 text-lg font-bold text-white no-underline shadow-lg ring-2 ring-white/30 hover:bg-fuchsia-500">
              <IconoMegafono className="h-6 w-6" /> Publica tu propiedad
            </Link>
            <Link to="/propiedades" className="inline-flex items-center gap-2 rounded-full border border-white/70 px-7 py-4 font-semibold text-white no-underline hover:bg-white/10">
              <IconoBuscar className="h-5 w-5" /> Ver propiedades
            </Link>
          </div>
          <p className="mt-10 max-w-sm text-lg italic text-fuchsia-100 md:absolute md:bottom-28 md:right-8 md:text-right md:text-xl">
            Más que propiedades, creamos historias.
          </p>
        </div>
      </header>

      <main>
        {/* Buscador: lleva al buscador completo con los filtros ya puestos */}
        <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:px-6" aria-label="Buscar propiedades">
          <form onSubmit={buscar} className="grid gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl md:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto] lg:items-center">
            {[
              { Icono: IconoEtiqueta, etiqueta: 'Quiero', clave: 'modalidad', vacio: 'Arriendo o venta', lista: [{ v: 'arriendo', t: 'Arrendar' }, { v: 'venta', t: 'Comprar' }] },
              { Icono: IconoCasa, etiqueta: 'Tipo de propiedad', clave: 'tipo', vacio: 'Todos', lista: (opciones.tipos || []).map((t) => ({ v: t, t })) },
              { Icono: IconoUbicacion, etiqueta: 'Ciudad', clave: 'ciudad', vacio: 'Todas', lista: (opciones.ciudades || []).map((t) => ({ v: t, t })) },
            ].map(({ Icono, etiqueta, clave, vacio, lista }) => (
              <label key={clave} className="flex items-center gap-3 px-4 py-2 md:border-r md:border-gray-200">
                <Icono className="h-7 w-7 shrink-0 text-fuchsia-900" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-gray-800">{etiqueta}</span>
                  <select value={busqueda[clave]} onChange={cambiar(clave)} className={claseCampo}>
                    <option value="">{vacio}</option>
                    {lista.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
                  </select>
                </span>
              </label>
            ))}
            <label className="flex items-center gap-3 px-4 py-2">
              <IconoBuscar className="h-7 w-7 shrink-0 text-fuchsia-900" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-gray-800">Barrio o palabra</span>
                <input value={busqueda.q} onChange={cambiar('q')} placeholder="Ej: Barzal, patio..." className={`${claseCampo} placeholder:text-gray-400`} />
              </span>
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-800 px-8 py-3 font-semibold text-white hover:bg-fuchsia-900 md:col-span-2 lg:col-span-1">
              <IconoBuscar className="h-5 w-5" /> Buscar
            </button>
          </form>
        </section>

        {/* Ventajas */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-label="Por qué elegirnos">
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {VENTAJAS.map(({ Icono, titulo, detalle }) => (
              <li key={titulo} className="flex items-center gap-3 first:border-l-0 first:pl-0 md:border-l md:border-gray-200 md:pl-6">
                <Icono className="h-10 w-10 shrink-0 text-fuchsia-900" />
                <span className="text-sm leading-tight text-gray-600">
                  <strong className="block text-base font-semibold text-gray-800">{titulo}</strong>
                  {detalle}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Propiedades destacadas */}
        <section id="propiedades" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div role="tablist" aria-label="Tipo de oferta" className="mb-6 inline-flex rounded-full border border-fuchsia-200 bg-white p-1 shadow-sm">
            {SEGMENTOS.map(({ id, texto }) => {
              const n = id ? conteo[id] : conteo.todas;
              return (
                <button key={id || 'todas'} type="button" role="tab" aria-selected={segmento === id} onClick={() => setSegmento(id)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold ${segmento === id ? 'bg-fuchsia-800 text-white' : 'text-fuchsia-900 hover:bg-fuchsia-50'}`}>
                  {texto}{n !== undefined && <span className={segmento === id ? ' text-fuchsia-200' : ' text-gray-400'}> ({n})</span>}
                </button>
              );
            })}
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-l-4 border-fuchsia-800 pl-4">
            <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
              {segmento ? 'Propiedades en ' : 'Propiedades '}
              <span className="text-fuchsia-800">{segmento === 'venta' ? 'Venta' : segmento === 'arriendo' ? 'Arriendo' : 'Destacadas'}</span>
            </h2>
            <Link to={enlaceVerTodas} className="inline-flex items-center gap-2 font-semibold text-fuchsia-900 no-underline hover:underline">
              Ver todas las propiedades <IconoFlecha className="h-4 w-4" />
            </Link>
          </div>

          {estado.error ? (
            <div className="rounded-2xl bg-white py-12 text-center shadow-md">
              <h3 className="text-xl font-semibold text-gray-700">No pudimos cargar las propiedades</h3>
              <p className="mt-2 text-gray-500">Revisa tu conexión e inténtalo de nuevo.</p>
              <button type="button" onClick={() => setIntento((n) => n + 1)} className="mt-5 rounded-full bg-fuchsia-800 px-6 py-2.5 font-semibold text-white">Reintentar</button>
            </div>
          ) : !estado.cargando && estado.lista.length === 0 ? (
            <div className="rounded-2xl bg-white py-14 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-50"><IconoCasa className="h-10 w-10 text-fuchsia-300" /></div>
              <h3 className="mb-2 text-xl font-semibold text-gray-700">No hay propiedades disponibles</h3>
              <p className="text-gray-500">Pronto tendremos nuevas propiedades para ti.</p>
              <Link to="/publicar-propiedad" className="mt-5 inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-6 py-2.5 text-sm font-semibold text-white no-underline hover:bg-fuchsia-900">
                <IconoMegafono className="h-4 w-4" /> ¿Tienes una propiedad? Publícala con nosotros
              </Link>
            </div>
          ) : (
            <div className={`grid gap-6 ${rejilla} ${estado.cargando ? 'opacity-60' : ''}`} aria-busy={estado.cargando}>
              {estado.lista.map((casa) => (
                <TarjetaInmueble key={casa.id} casa={casa} variante={variante} favorito={esFavorito(casa.id)} alAlternarFavorito={alternar} alVerMapa={setCasaEnMapa} />
              ))}
            </div>
          )}
        </section>

        {/* Publicidad: invitacion a publicar una propiedad */}
        <section id="publicar" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b0a26] via-[#3b1052] to-[#7a1f8e] px-6 py-10 text-white shadow-xl md:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-200">
                  <IconoMegafono className="h-5 w-5" /> Publica con nosotros
                </p>
                <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                  ¿Tienes una propiedad para <span className="text-fuchsia-300">arrendar o vender</span>?
                </h2>
                <p className="mt-4 max-w-xl text-gray-200">
                  Regístrala tú mismo en pocos minutos, sin crear una cuenta y sin llamadas: llena el formulario y nuestro equipo te contacta para publicarla.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to="/publicar-propiedad" className="inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-7 py-3 font-semibold text-white no-underline hover:bg-fuchsia-500">
                    <IconoMegafono className="h-5 w-5" /> Registrar mi propiedad
                  </Link>
                  <a href={enlaceWhatsapp(MENSAJE_PUBLICAR)} target="_blank" rel="noopener noreferrer" onClick={() => registrarEvento('clic_whatsapp', { origen: 'banner_publicar' })}
                    className="inline-flex items-center gap-2 rounded-full border border-white/70 px-7 py-3 font-semibold text-white no-underline hover:bg-white/10">
                    <IconoWhatsapp className="h-5 w-5" /> Prefiero escribir por WhatsApp
                  </a>
                </div>
              </div>
              <ul className="grid gap-4">
                {BENEFICIOS_PUBLICAR.map(({ Icono, titulo, detalle }) => (
                  <li key={titulo} className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-fuchsia-200"><Icono className="h-6 w-6" /></span>
                    <span className="leading-tight">
                      <strong className="block text-lg font-semibold">{titulo}</strong>
                      <span className="text-sm text-gray-200">{detalle}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Boton flotante de WhatsApp, siempre visible */}
      <a
        href={enlaceWhatsapp(MENSAJE_GENERAL)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarEvento('clic_whatsapp', { origen: 'flotante' })}
        aria-label="Comunicarse por WhatsApp"
        title="Comunicarse por WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1fa855] text-white no-underline shadow-lg hover:bg-[#178a45]"
      >
        <IconoWhatsapp className="h-8 w-8" />
      </a>

      {casaEnMapa && (
        <Suspense fallback={null}>
          <MapaInmueble casa={casaEnMapa} onCerrar={() => setCasaEnMapa(null)} />
        </Suspense>
      )}

      <PiePortal />
    </div>
  );
}

export default Home;
