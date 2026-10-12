import { useEffect } from 'react';
import { EMPRESA } from './empresa';

const poner = (selector, crear, atributo, valor) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = crear();
    document.head.appendChild(el);
  }
  el.setAttribute(atributo, valor);
  return el;
};

const meta = (clave, nombre, valor) =>
  poner(`meta[${clave}="${nombre}"]`, () => { const m = document.createElement('meta'); m.setAttribute(clave, nombre); return m; }, 'content', valor);

// Titulo, descripcion, enlace canonico, etiquetas para compartir (Open Graph) y datos estructurados de la pagina.
// Google ejecuta el JavaScript del portal y lee estas etiquetas; al salir de la pagina se restauran las de siempre.
export function useSeo({ titulo, descripcion, imagen, ruta, jsonLd, noIndexar = false }) {
  const jsonTexto = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const tituloAnterior = document.title;
    const completo = titulo ? `${titulo} | ${EMPRESA.nombre}` : EMPRESA.nombre;
    const url = `${window.location.origin}${ruta ?? window.location.pathname}`;
    document.title = completo;
    if (descripcion) {
      meta('name', 'description', descripcion);
      meta('property', 'og:description', descripcion);
    }
    meta('property', 'og:title', completo);
    meta('property', 'og:url', url);
    meta('property', 'og:type', 'website');
    meta('property', 'og:site_name', EMPRESA.nombre);
    meta('name', 'twitter:card', imagen ? 'summary_large_image' : 'summary');
    if (imagen) meta('property', 'og:image', imagen);
    meta('name', 'robots', noIndexar ? 'noindex,nofollow' : 'index,follow');
    poner('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; }, 'href', url);

    let script = null;
    if (jsonTexto) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = jsonTexto;
      document.head.appendChild(script);
    }
    return () => {
      document.title = tituloAnterior;
      script?.remove();
      meta('name', 'robots', 'index,follow');
    };
  }, [titulo, descripcion, imagen, ruta, jsonTexto, noIndexar]);
}

// Datos estructurados de una ficha para Google (resultado enriquecido con precio y ubicacion)
export function jsonLdDeInmueble(casa, url) {
  if (!casa) return null;
  const venta = casa.modalidad === 'venta';
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: casa.titulo,
    url,
    description: casa.descripcion || casa.titulo,
    datePosted: casa.fecha || undefined,
    image: casa.fotoPrincipal || undefined,
    offers: { '@type': 'Offer', price: casa.precio || undefined, priceCurrency: 'COP', availability: 'https://schema.org/InStock',
      businessFunction: venta ? 'http://purl.org/goodrelations/v1#Sell' : 'http://purl.org/goodrelations/v1#LeaseOut' },
    about: {
      '@type': casa.tipoInmueble === 'Casa' ? 'SingleFamilyResidence' : 'Accommodation',
      numberOfRooms: casa.habitaciones || undefined,
      numberOfBathroomsTotal: casa.banos || undefined,
      floorSize: casa.area ? { '@type': 'QuantitativeValue', value: Number(casa.area), unitCode: 'MTK' } : undefined,
      address: { '@type': 'PostalAddress', streetAddress: casa.direccion, addressLocality: casa.ciudad, addressRegion: casa.barrio, addressCountry: 'CO' },
      geo: casa.latitud != null ? { '@type': 'GeoCoordinates', latitude: casa.latitud, longitude: casa.longitud } : undefined,
    },
  };
}
