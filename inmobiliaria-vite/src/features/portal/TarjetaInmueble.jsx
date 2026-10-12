import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconoArea, IconoBano, IconoCama, IconoCasa, IconoCorazon, IconoEscudo, IconoEstrella, IconoEtiqueta, IconoFlecha,
  IconoGaraje, IconoMapa, IconoUbicacion, IconoWhatsapp,
} from '../inicio/iconosInicio';
import { enlaceWhatsapp } from './empresa';
import { esVenta, formatearPrecio, mensajeInmueble, rutaInmueble, textoOferta, textoUbicacion } from './formato';
import { registrarEvento } from './analitica';

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
      alt={casa.titulo}
      loading="lazy"
      decoding="async"
      className={`${className} object-cover`}
      onError={() => setFallo(true)}
    />
  );
}

// Datos clave con su icono: la cantidad va al lado, en grande, para leerse de un vistazo
function Datos({ casa, grande }) {
  const lista = [
    casa.habitaciones && { Icono: IconoCama, valor: casa.habitaciones, texto: casa.habitaciones === 1 ? 'Habitación' : 'Habitaciones' },
    casa.banos && { Icono: IconoBano, valor: casa.banos, texto: casa.banos === 1 ? 'Baño' : 'Baños' },
    casa.parqueaderos && { Icono: IconoGaraje, valor: casa.parqueaderos, texto: casa.parqueaderos === 1 ? 'Parqueadero' : 'Parqueaderos' },
    casa.area && { Icono: IconoArea, valor: Number(casa.area), texto: 'm²' },
  ].filter(Boolean);
  if (lista.length === 0) return null;
  return (
    <ul className={`grid gap-3 border-y border-gray-100 py-3 ${grande ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
      {lista.map(({ Icono, valor, texto }) => (
        <li key={texto} className="flex items-center gap-2.5">
          <span className={`flex shrink-0 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-900 ${grande ? 'h-11 w-11' : 'h-9 w-9'}`}>
            <Icono className={grande ? 'w-6 h-6' : 'w-5 h-5'} />
          </span>
          <span className="flex items-baseline gap-1 leading-tight">
            <strong className={`font-bold text-gray-900 ${grande ? 'text-xl' : 'text-base'}`}>{valor}</strong>
            <span className={`font-medium text-gray-700 ${grande ? 'text-sm' : 'text-xs'}`}>{texto}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// Tarjeta de un inmueble. variante: "destacada" (una sola, a todo el ancho), "grande" o "normal".
function TarjetaInmueble({ casa, variante = 'normal', favorito = false, alAlternarFavorito, alVerMapa }) {
  const destacada = variante === 'destacada';
  const grande = variante === 'grande';
  const alturaFoto = destacada ? 'h-64 lg:h-full lg:min-h-[26rem]' : grande ? 'h-64' : 'h-48';
  const ruta = rutaInmueble(casa);

  return (
    <article className={`relative flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md ${destacada ? 'flex-col lg:flex-row' : 'flex-col'}`}>
      <div className={`relative shrink-0 ${destacada ? 'lg:w-3/5' : ''}`}>
        <Link to={ruta} tabIndex={-1} aria-hidden="true" className="block">
          <Foto casa={casa} className={`w-full ${alturaFoto}`} />
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-800 px-3 py-1 text-xs font-semibold text-white">
            <IconoEtiqueta className="w-3.5 h-3.5" /> {textoOferta(casa)}
          </span>
          {casa.destacada && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
              <IconoEstrella className="w-3.5 h-3.5" /> Destacada
            </span>
          )}
          {casa.verificada && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">
              <IconoEscudo className="w-3.5 h-3.5" /> Verificada
            </span>
          )}
        </div>
        {alAlternarFavorito && (
          <button
            type="button"
            onClick={() => alAlternarFavorito(casa.id)}
            aria-pressed={favorito}
            aria-label={favorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            title={favorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow"
          >
            <IconoCorazon className={`w-5 h-5 ${favorito ? 'fill-fuchsia-700 text-fuchsia-700' : 'text-gray-600'}`} />
          </button>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${destacada ? 'justify-center gap-4 p-6 lg:p-10' : grande ? 'gap-3 p-5' : 'gap-2 p-4'}`}>
        <div>
          <span className={`font-bold text-fuchsia-900 ${destacada ? 'text-4xl' : grande ? 'text-3xl' : 'text-2xl'}`}>{formatearPrecio(casa.precio)}</span>
          {!esVenta(casa) && <span className="ml-1 text-sm text-gray-500">/mes</span>}
        </div>

        <h3 className={`font-semibold text-gray-900 ${destacada ? 'text-2xl' : grande ? 'text-xl' : 'text-base'}`}>
          <Link to={ruta} className="text-inherit no-underline after:absolute after:inset-0 hover:text-fuchsia-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-700">
            {casa.titulo}
          </Link>
        </h3>

        <p className={`flex items-start gap-1.5 text-gray-600 ${destacada ? 'text-base' : 'text-sm'}`}>
          <IconoUbicacion className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-800" />
          <span className={destacada ? '' : 'line-clamp-2'}>{[casa.direccion, textoUbicacion(casa)].filter(Boolean).join(' · ')}</span>
        </p>

        <Datos casa={casa} grande={destacada || grande} />

        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Link to={ruta} className="inline-flex items-center gap-2 rounded-full border border-fuchsia-800 px-4 py-2 text-sm font-semibold text-fuchsia-900 no-underline hover:bg-fuchsia-50">
            Ver más <IconoFlecha className="h-4 w-4" />
          </Link>
          {alVerMapa && (
            <button
              type="button"
              onClick={() => alVerMapa(casa)}
              title="Ver la ubicación en el mapa"
              className="inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-900"
            >
              <IconoMapa className="h-4 w-4" /> Ubicación
            </button>
          )}
          <a
            href={enlaceWhatsapp(mensajeInmueble(casa))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarEvento('clic_whatsapp', { origen: 'tarjeta', inmueble: casa.id })}
            title="Escribirnos por WhatsApp sobre esta propiedad"
            className="inline-flex items-center gap-2 rounded-full bg-[#1fa855] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#178a45]"
          >
            <IconoWhatsapp className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

export default TarjetaInmueble;

// Distribucion segun cuantas propiedades hay: con una sola ocupa todo el ancho, con pocas se reparten en columnas
// amplias y desde cuatro pasan a la cuadricula normal.
export const distribucion = (cantidad) => {
  if (cantidad <= 1) return { rejilla: 'grid-cols-1', variante: 'destacada' };
  if (cantidad === 2) return { rejilla: 'grid-cols-1 md:grid-cols-2', variante: 'grande' };
  if (cantidad === 3) return { rejilla: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', variante: 'grande' };
  return { rejilla: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', variante: 'normal' };
};
