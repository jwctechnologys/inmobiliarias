// Home.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import {
  IconoCasa, IconoUbicacion, IconoCama, IconoBano, IconoGaraje, IconoPatio, IconoEdificio, IconoBuscar,
  IconoEscudo, IconoPersonas, IconoCocina, IconoSala, IconoMapa, IconoWhatsapp, IconoMegafono, IconoTelefono, IconoCorreo, IconoFlecha, IconoEtiqueta, IconoLlave, IconoChevron,
} from './iconosInicio';

// Foto opcional del encabezado: si existe public/images/portada-inmobiliaria.jpg se usa de fondo; si no, el
// degradado morado de la marca. Se prueba con un <img> porque el servidor puede responder con la pagina de
// inicio (no con un 404) cuando el archivo no existe.
const FOTO_PORTADA = '/images/portada-inmobiliaria.jpg';

// El canon mensual y el precio de venta no se comparan: cada segmento tiene sus propios rangos.
const RANGOS_PRECIO = {
  arriendo: [
    { id: 'hasta500', texto: 'Hasta $ 500.000', min: 0, max: 500000 },
    { id: '500a1000', texto: '$ 500.000 – $ 1.000.000', min: 500000, max: 1000000 },
    { id: '1000a2000', texto: '$ 1.000.000 – $ 2.000.000', min: 1000000, max: 2000000 },
    { id: 'mas2000', texto: 'Más de $ 2.000.000', min: 2000000, max: Infinity },
  ],
  venta: [
    { id: 'hasta200', texto: 'Hasta $ 200.000.000', min: 0, max: 200000000 },
    { id: '200a400', texto: '$ 200.000.000 – $ 400.000.000', min: 200000000, max: 400000000 },
    { id: '400a800', texto: '$ 400.000.000 – $ 800.000.000', min: 400000000, max: 800000000 },
    { id: 'mas800', texto: 'Más de $ 800.000.000', min: 800000000, max: Infinity },
  ],
};

const SEGMENTOS = [
  { id: 'todas', texto: 'Todas' },
  { id: 'arriendo', texto: 'En arriendo' },
  { id: 'venta', texto: 'En venta' },
];

const MENSAJE_PUBLICAR = 'Hola, quisiera publicar mi propiedad con Inmobiliaria CL. ¿Me pueden dar información?';

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

const formatearPrecio = (precio) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(precio);

const WHATSAPP = '573144568091';
const enlaceWhatsapp = (mensaje) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
const mensajeDe = (casa) =>
  `Hola, me interesa el ${(casa.tipoInmueble || 'inmueble').toLowerCase()} ubicado en ${[casa.direccion, casa.barrio].filter(Boolean).join(', ')} (${esVenta(casa) ? `en venta por ${formatearPrecio(precioDe(casa))}` : `${formatearPrecio(precioDe(casa))}/mes`}). ¿Me puede dar más información?`;

// El mapa (Leaflet) se descarga solo cuando alguien abre una ubicacion.
const MapaInmueble = lazy(() => import('./MapaInmueble'));

const esVenta = (casa) => casa.modalidad === 'venta';
const precioDe = (casa) => (esVenta(casa) ? casa.precioVenta : casa.canonmensual);

const textoUbicacion = (casa) => [casa.barrio, casa.ciudad].filter(Boolean).join(', ');

// Distribucion segun cuantas propiedades hay: con una sola la tarjeta ocupa todo el ancho, con pocas se reparten
// en columnas amplias y desde cuatro pasan a la cuadricula normal.
const distribucion = (cantidad) => {
  if (cantidad <= 1) return { rejilla: 'grid-cols-1', variante: 'destacada' };
  if (cantidad === 2) return { rejilla: 'grid-cols-1 md:grid-cols-2', variante: 'grande' };
  if (cantidad === 3) return { rejilla: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', variante: 'grande' };
  return { rejilla: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', variante: 'normal' };
};

function Foto({ casa, className }) {
  const [fallo, setFallo] = useState(false);
  if (!casa.fotoPrincipal || fallo) {
    return (
      <div className={`${className} flex items-center justify-center bg-fuchsia-50 text-fuchsia-300`}>
        <IconoCasa className="w-16 h-16" />
      </div>
    );
  }
  return (
    <img
      src={casa.fotoPrincipal}
      alt={casa.descripcion || 'Propiedad'}
      className={`${className} object-cover`}
      onError={() => setFallo(true)}
    />
  );
}

// Cada espacio de la casa lleva su icono y, al lado, la cantidad (se toma de la observacion que escribe el
// propietario: "2", "3 con closet"...). Si la observacion no empieza por un numero se muestra como nota.
const ESPACIOS = [
  { campo: 'habitaciones', obs: 'observacion_habitaciones', Icono: IconoCama, singular: 'Habitación', plural: 'Habitaciones' },
  { campo: 'baños', obs: 'observacion_baños', Icono: IconoBano, singular: 'Baño', plural: 'Baños' },
  { campo: 'cocina', obs: 'observacion_cocina', Icono: IconoCocina, singular: 'Cocina', plural: 'Cocinas' },
  { campo: 'garage', obs: 'observacion_garage', Icono: IconoGaraje, singular: 'Parqueadero', plural: 'Parqueaderos' },
  { campo: 'sala', obs: 'observacion_sala', Icono: IconoSala, singular: 'Sala', plural: 'Salas' },
  { campo: 'patio', obs: 'observacion_patio', Icono: IconoPatio, singular: 'Patio', plural: 'Patios' },
];

const espaciosDe = (casa) =>
  ESPACIOS.filter((e) => casa[e.campo]).map((e) => {
    const texto = String(casa[e.obs] || '').trim();
    const m = texto.match(/^(\d+)\s*(.*)$/);
    const cantidad = m ? Number(m[1]) : null;
    return { ...e, cantidad, nota: m ? m[2] : texto, etiqueta: cantidad === 1 || cantidad === null ? e.singular : e.plural };
  });

function Caracteristicas({ casa, grande }) {
  const lista = espaciosDe(casa);
  if (lista.length === 0) return null;
  return (
    <ul className={`grid gap-3 border-y border-gray-100 py-3 ${grande ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
      {lista.map(({ Icono, cantidad, etiqueta, nota, campo }) => (
        <li key={campo} className="flex items-center gap-2.5">
          <span className={`flex shrink-0 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-900 ${grande ? 'h-11 w-11' : 'h-9 w-9'}`}>
            <Icono className={grande ? 'w-6 h-6' : 'w-5 h-5'} />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="flex items-baseline gap-1">
              {cantidad !== null && <strong className={`font-bold text-gray-900 ${grande ? 'text-xl' : 'text-base'}`}>{cantidad}</strong>}
              <span className={`font-medium text-gray-700 ${grande ? 'text-sm' : 'text-xs'}`}>{etiqueta}</span>
            </span>
            {nota && <span className="block truncate text-xs text-gray-500" title={nota}>{nota}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TarjetaCasa({ casa, variante, alAbrir, alVerMapa }) {
  const destacada = variante === 'destacada';
  const grande = variante === 'grande';
  const alturaFoto = destacada ? 'h-64 lg:h-full lg:min-h-[26rem]' : grande ? 'h-64' : 'h-48';

  return (
    <article
      onClick={() => alAbrir(casa.id)}
      className={`bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden cursor-pointer flex ${destacada ? 'flex-col lg:flex-row' : 'flex-col'}`}
    >
      <div className={`relative shrink-0 ${destacada ? 'lg:w-3/5' : ''}`}>
        <Foto casa={casa} className={`w-full ${alturaFoto}`} />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-fuchsia-800 px-3 py-1 text-xs font-semibold text-white">
          <IconoEtiqueta className="w-3.5 h-3.5" />
          {esVenta(casa) ? 'En Venta' : 'En Arriendo'}
        </span>
      </div>

      <div className={`flex flex-1 flex-col ${destacada ? 'p-6 lg:p-10 justify-center gap-4' : grande ? 'p-5 gap-3' : 'p-4 gap-2'}`}>
        <div>
          <span className={`font-bold text-fuchsia-900 ${destacada ? 'text-4xl' : grande ? 'text-3xl' : 'text-2xl'}`}>
            {formatearPrecio(precioDe(casa))}
          </span>
          {!esVenta(casa) && <span className="ml-1 text-sm text-gray-500">/mes</span>}
        </div>

        <h3 className={`font-semibold text-gray-900 ${destacada ? 'text-2xl' : grande ? 'text-xl' : 'text-base'}`}>
          {[casa.tipoInmueble || 'Propiedad', casa.barrio && `en ${casa.barrio}`].filter(Boolean).join(' ')}
        </h3>

        <p className={`flex items-start gap-1.5 text-gray-600 ${destacada ? 'text-base' : 'text-sm'}`}>
          <IconoUbicacion className="w-4 h-4 mt-0.5 shrink-0 text-fuchsia-800" />
          <span className={destacada ? '' : 'line-clamp-2'}>
            {[casa.direccion, textoUbicacion(casa)].filter(Boolean).join(' · ')}
          </span>
        </p>

        {casa.descripcion && (
          <p
            lang="es"
            className={`whitespace-pre-line text-justify hyphens-auto leading-relaxed text-gray-600 ${destacada ? 'text-base' : grande ? 'text-sm line-clamp-4' : 'text-sm line-clamp-3'}`}
          >
            {casa.descripcion}
          </p>
        )}

        {(casa.tipoInmueble || casa.usoInmueble) && (
          <p className="flex flex-wrap gap-2 text-xs">
            {[casa.tipoInmueble, casa.usoInmueble].filter(Boolean).map((texto) => (
              <span key={texto} className="rounded-full bg-fuchsia-50 px-3 py-1 font-medium text-fuchsia-900">{texto}</span>
            ))}
          </p>
        )}

        <Caracteristicas casa={casa} grande={destacada || grande} />

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-800 px-5 py-2 text-sm font-semibold text-fuchsia-900">
            Ver más <IconoFlecha className="w-4 h-4" />
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); alVerMapa(casa); }}
            title="Ver la ubicación en el mapa"
            className="inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-900"
          >
            <IconoMapa className="w-4 h-4" /> Ubicación
          </button>
          <a
            href={enlaceWhatsapp(mensajeDe(casa))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Escribirnos por WhatsApp sobre esta propiedad"
            className="inline-flex items-center gap-2 rounded-full bg-[#1fa855] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#178a45]"
          >
            <IconoWhatsapp className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

function Filtro({ Icono, etiqueta, valor, alCambiar, opciones, vacio = 'Selecciona...' }) {
  return (
    <label className="flex items-center gap-3 px-4 py-2 md:border-r md:border-gray-200 last:border-r-0">
      <Icono className="w-7 h-7 shrink-0 text-fuchsia-900" />
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-semibold text-gray-800">{etiqueta}</span>
        <span className="relative block">
          <select
            value={valor}
            onChange={(e) => alCambiar(e.target.value)}
            className="w-full appearance-none bg-transparent pr-6 text-sm text-gray-500 focus:outline-none"
          >
            <option value="">{vacio}</option>
            {opciones.map((o) => (
              <option key={o.valor} value={o.valor}>{o.texto}</option>
            ))}
          </select>
          <IconoChevron className="pointer-events-none absolute right-0 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-500" />
        </span>
      </span>
    </label>
  );
}

function Home() {
  const [casas, setCasas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fotoPortada, setFotoPortada] = useState(false);
  const [casaEnMapa, setCasaEnMapa] = useState(null);
  const [filtros, setFiltros] = useState({ tipo: '', ubicacion: '', uso: '', precio: '' });
  const [segmento, setSegmento] = useState('todas');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/casas/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al cargar las propiedades');
        }
        return response.json();
      })
      .then((data) => {
        setCasas(data.filter((casa) => !casa.solicitudAceptada));
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al cargar las casas:', error);
        setError(error.message);
        setCargando(false);
      });
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setFotoPortada(true);
    img.src = FOTO_PORTADA;
  }, []);

  const handleCasaClick = (id) => navigate(`/info/Casas/${id}`);

  // Las opciones de los filtros salen de las propiedades publicadas, asi nunca ofrecen algo que no existe.
  const opciones = useMemo(() => {
    const unicos = (valores) => [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    const aOpciones = (lista) => lista.map((v) => ({ valor: v, texto: v }));
    return {
      tipo: aOpciones(unicos(casas.map((c) => c.tipoInmueble))),
      uso: aOpciones(unicos(casas.map((c) => c.usoInmueble))),
      ubicacion: aOpciones(unicos(casas.map(textoUbicacion))),
      precio: (RANGOS_PRECIO[segmento] || []).map((r) => ({ valor: r.id, texto: r.texto })),
    };
  }, [casas, segmento]);

  const conteo = useMemo(() => ({
    todas: casas.length,
    arriendo: casas.filter((c) => !esVenta(c)).length,
    venta: casas.filter(esVenta).length,
  }), [casas]);

  const visibles = useMemo(() => {
    const rango = (RANGOS_PRECIO[segmento] || []).find((r) => r.id === filtros.precio);
    return casas.filter((c) => {
      if (segmento === 'venta' && !esVenta(c)) return false;
      if (segmento === 'arriendo' && esVenta(c)) return false;
      if (filtros.tipo && c.tipoInmueble !== filtros.tipo) return false;
      if (filtros.uso && c.usoInmueble !== filtros.uso) return false;
      if (filtros.ubicacion && textoUbicacion(c) !== filtros.ubicacion) return false;
      if (rango && !(precioDe(c) >= rango.min && precioDe(c) <= rango.max)) return false;
      return true;
    });
  }, [casas, filtros, segmento]);

  const hayFiltros = Object.values(filtros).some(Boolean);
  const elegirSegmento = (id) => {
    setSegmento(id);
    setFiltros((previos) => ({ ...previos, precio: '' })); // los rangos de precio cambian con el segmento
  };
  const cambiarFiltro = (clave) => (valor) => setFiltros((previos) => ({ ...previos, [clave]: valor }));
  const irAPropiedades = () => document.getElementById('propiedades')?.scrollIntoView();
  const { rejilla, variante } = distribucion(visibles.length);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 font-medium">Cargando propiedades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-medium rounded-full"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 pb-28 md:pb-32">
          <p className="mb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-200">
            <IconoLlave className="w-5 h-5" />
            Tu aliado en el sueño de tu hogar
          </p>
          <h1 className="max-w-2xl text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            ¡Bienvenidos a <span className="text-fuchsia-300">Inmobiliaria CL</span>!
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-gray-200">
            Tu aliado de confianza en la búsqueda del hogar o inversión ideal. Estamos aquí para ayudarte a encontrar el
            espacio perfecto que se ajuste a tus sueños y necesidades.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={irAPropiedades}
              className="inline-flex items-center gap-2 rounded-full bg-fuchsia-700 hover:bg-fuchsia-800 px-7 py-3 font-semibold text-white"
            >
              <IconoBuscar className="w-5 h-5" />
              Ver propiedades
            </button>
            <a
              href={enlaceWhatsapp('Hola, quisiera información sobre las propiedades disponibles en Inmobiliaria CL.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1fa855] hover:bg-[#178a45] px-7 py-3 font-semibold text-white no-underline"
            >
              <IconoWhatsapp className="w-5 h-5" />
              Contáctanos por WhatsApp
            </a>
            <Link
              to="/publicar-propiedad"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 hover:bg-white/10 px-7 py-3 font-semibold text-white no-underline"
            >
              <IconoMegafono className="w-5 h-5" />
              Publica tu propiedad
            </Link>
          </div>
          <p className="mt-10 max-w-sm text-lg italic text-fuchsia-100 md:absolute md:right-8 md:bottom-28 md:text-right md:text-xl">
            Más que propiedades, creamos historias.
          </p>
        </div>
      </header>

      {/* Buscador */}
      <section className="relative z-10 max-w-6xl mx-auto -mt-14 px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-3 shadow-xl border border-gray-100 grid gap-2 md:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto] lg:items-center">
          <Filtro Icono={IconoCasa} etiqueta="Tipo de propiedad" valor={filtros.tipo} alCambiar={cambiarFiltro('tipo')} opciones={opciones.tipo} />
          <Filtro Icono={IconoUbicacion} etiqueta="Ubicación" valor={filtros.ubicacion} alCambiar={cambiarFiltro('ubicacion')} opciones={opciones.ubicacion} />
          <Filtro Icono={IconoEdificio} etiqueta="Uso" valor={filtros.uso} alCambiar={cambiarFiltro('uso')} opciones={opciones.uso} />
          <Filtro Icono={IconoEtiqueta} etiqueta="Rango de precio" valor={filtros.precio} alCambiar={cambiarFiltro('precio')} opciones={opciones.precio} vacio={segmento === 'todas' ? 'Elige arriendo o venta' : 'Selecciona...'} />
          <button
            type="button"
            onClick={irAPropiedades}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-800 hover:bg-fuchsia-900 px-8 py-3 font-semibold text-white md:col-span-2 lg:col-span-1"
          >
            <IconoBuscar className="w-5 h-5" />
            Buscar
          </button>
        </div>
      </section>

      {/* Ventajas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {VENTAJAS.map(({ Icono, titulo, detalle }) => (
            <li key={titulo} className="flex items-center gap-3 md:border-l md:border-gray-200 md:pl-6 first:border-l-0 first:pl-0">
              <Icono className="w-10 h-10 shrink-0 text-fuchsia-900" />
              <span className="text-sm leading-tight text-gray-600">
                <strong className="block text-base font-semibold text-gray-800">{titulo}</strong>
                {detalle}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Propiedades */}
      <section id="propiedades" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div role="tablist" aria-label="Tipo de oferta" className="mb-6 inline-flex rounded-full border border-fuchsia-200 bg-white p-1 shadow-sm">
          {SEGMENTOS.map(({ id, texto }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={segmento === id}
              onClick={() => elegirSegmento(id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${segmento === id ? 'bg-fuchsia-800 text-white' : 'text-fuchsia-900 hover:bg-fuchsia-50'}`}
            >
              {texto} <span className={segmento === id ? 'text-fuchsia-200' : 'text-gray-400'}>({conteo[id]})</span>
            </button>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-l-4 border-fuchsia-800 pl-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {segmento === 'venta' ? 'Propiedades en ' : segmento === 'arriendo' ? 'Propiedades en ' : 'Propiedades '}
            <span className="text-fuchsia-800">{segmento === 'venta' ? 'Venta' : segmento === 'arriendo' ? 'Arriendo' : 'Destacadas'}</span>
          </h2>
          <p className="text-gray-600">
            {visibles.length} {visibles.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
            {hayFiltros && (
              <button
                type="button"
                onClick={() => setFiltros({ tipo: '', ubicacion: '', uso: '', precio: '' })}
                className="ml-3 font-semibold text-fuchsia-800 underline"
              >
                Quitar filtros
              </button>
            )}
          </p>
        </div>

        {visibles.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl shadow-md">
            <div className="w-20 h-20 bg-fuchsia-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconoCasa className="w-10 h-10 text-fuchsia-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {hayFiltros ? 'Ninguna propiedad coincide con tu búsqueda' : 'No hay propiedades disponibles'}
            </h3>
            <p className="text-gray-500">
              {hayFiltros ? 'Prueba con otros filtros.' : 'Pronto tendremos nuevas propiedades para ti.'}
            </p>
            {!hayFiltros && (
              <Link
                to="/publicar-propiedad"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-6 py-2.5 text-sm font-semibold text-white no-underline hover:bg-fuchsia-900"
              >
                <IconoMegafono className="w-4 h-4" /> ¿Tienes una propiedad? Publícala con nosotros
              </Link>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${rejilla}`}>
            {visibles.map((casa) => (
              <TarjetaCasa key={casa.id} casa={casa} variante={variante} alAbrir={handleCasaClick} alVerMapa={setCasaEnMapa} />
            ))}
          </div>
        )}
      </section>

      {/* Publicidad: invitacion a publicar una propiedad */}
      <section id="publicar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b0a26] via-[#3b1052] to-[#7a1f8e] px-6 py-10 text-white shadow-xl md:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-200">
                <IconoMegafono className="w-5 h-5" /> Publica con nosotros
              </p>
              <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                ¿Tienes una propiedad para <span className="text-fuchsia-300">arrendar o vender</span>?
              </h2>
              <p className="mt-4 max-w-xl text-gray-200">
                Regístrala tú mismo en pocos minutos, sin crear una cuenta y sin llamadas: llena el formulario y nuestro equipo te contacta para publicarla.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/publicar-propiedad"
                  className="inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-7 py-3 font-semibold text-white no-underline hover:bg-fuchsia-500"
                >
                  <IconoMegafono className="w-5 h-5" /> Registrar mi propiedad
                </Link>
                <a
                  href={enlaceWhatsapp(MENSAJE_PUBLICAR)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 px-7 py-3 font-semibold text-white no-underline hover:bg-white/10"
                >
                  <IconoWhatsapp className="w-5 h-5" /> Prefiero escribir por WhatsApp
                </a>
              </div>
            </div>
            <ul className="grid gap-4">
              {BENEFICIOS_PUBLICAR.map(({ Icono, titulo, detalle }) => (
                <li key={titulo} className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-fuchsia-200">
                    <Icono className="w-6 h-6" />
                  </span>
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

      {/* Boton flotante de WhatsApp, siempre visible */}
      <a
        href={enlaceWhatsapp('Hola, quisiera información sobre las propiedades disponibles en Inmobiliaria CL.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Comunicarse por WhatsApp"
        title="Comunicarse por WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1fa855] text-white shadow-lg no-underline hover:bg-[#178a45]"
      >
        <IconoWhatsapp className="w-8 h-8" />
      </a>

      {casaEnMapa && (
        <Suspense fallback={null}>
          <MapaInmueble casa={casaEnMapa} onCerrar={() => setCasaEnMapa(null)} />
        </Suspense>
      )}

      {/* Contacto */}
      <footer id="contacto" className="bg-white border-t border-gray-200 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center text-gray-600">
          <p className="mb-4">¿Tienes preguntas? Contáctanos para ayudarte a encontrar tu hogar ideal.</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium">
            <a href={enlaceWhatsapp('Hola, quisiera información sobre las propiedades disponibles en Inmobiliaria CL.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-fuchsia-900 hover:text-fuchsia-700 no-underline">
              <IconoWhatsapp className="w-5 h-5" />
              WhatsApp +57 314 456 8091
            </a>
            <a href="tel:+573144568091" className="inline-flex items-center gap-2 text-fuchsia-900 hover:text-fuchsia-700 no-underline">
              <IconoTelefono className="w-5 h-5" />
              +57 314 456 8091
            </a>
            <a href="mailto:info@inmobiliaria.cl" className="inline-flex items-center gap-2 text-fuchsia-900 hover:text-fuchsia-700 no-underline">
              <IconoCorreo className="w-5 h-5" />
              info@inmobiliaria.cl
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
