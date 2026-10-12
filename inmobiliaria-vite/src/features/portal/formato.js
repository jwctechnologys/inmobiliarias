import { API_URL } from '../../config';

export const formatearPrecio = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(valor || 0);

export const esVenta = (casa) => casa?.modalidad === 'venta';

export const textoOferta = (casa) => (esVenta(casa) ? 'En venta' : 'En arriendo');

export const textoUbicacion = (casa) => [casa?.barrio, casa?.ciudad].filter(Boolean).join(', ');

// Enlace legible de una ficha: /propiedad/12-apartamento-en-arriendo-en-ciudad-salitre
export const rutaInmueble = (casa) => `/propiedad/${casa.id}${casa.slug ? `-${casa.slug}` : ''}`;

// "12-apartamento-en-..." -> 12 (el numero manda; el resto del enlace es solo para que se lea bien)
export const idDeRuta = (parametro) => {
  const m = /^(\d+)/.exec(parametro || '');
  return m ? Number(m[1]) : null;
};

// Enlace para compartir por WhatsApp y redes: lo sirve el servidor con titulo, foto y precio en la vista previa.
export const urlParaCompartir = (id) => `${API_URL}/api/compartir/${id}/`;

// "Apartamentos en arriendo en Villavicencio" a partir de los filtros de busqueda (titulo de la pagina y de Google)
export const tituloDeBusqueda = ({ modalidad, tipo, ciudad, q }) => {
  const plural = { Casa: 'Casas', Apartamento: 'Apartamentos', Local: 'Locales', 'Habitación': 'Habitaciones', Oficina: 'Oficinas', Lote: 'Lotes' };
  const que = tipo ? (plural[tipo] || tipo) : 'Propiedades';
  const oferta = modalidad === 'venta' ? ' en venta' : modalidad === 'arriendo' ? ' en arriendo' : '';
  const donde = ciudad ? ` en ${ciudad}` : '';
  const buscado = q ? ` · "${q}"` : '';
  return `${que}${oferta}${donde}${buscado}`;
};

export const mensajeInmueble = (casa) =>
  `Hola, me interesa el ${(casa.tipoInmueble || 'inmueble').toLowerCase()} ubicado en ${[casa.direccion, casa.barrio].filter(Boolean).join(', ')} (${
    esVenta(casa) ? `en venta por ${formatearPrecio(casa.precio)}` : `${formatearPrecio(casa.precio)}/mes`
  }). ¿Me puede dar más información?`;
