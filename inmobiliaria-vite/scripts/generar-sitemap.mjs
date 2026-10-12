// Genera dist/sitemap.xml y dist/robots.txt despues de compilar (npm run build).
//
// El sitemap le dice a Google que paginas existen: las fijas, una por cada ciudad (/arriendo/<ciudad>, /venta/<ciudad>)
// y una por cada propiedad publicada. Pide la lista a la API publica; si la API no responde, el sitemap queda solo con
// las paginas fijas y la compilacion NO falla (se avisa por consola).
//
// Variables: VITE_BASE_URL (API) y VITE_SITE_URL (direccion publica del portal, sin / al final).
import { mkdirSync, writeFileSync } from 'node:fs';

const API = (process.env.VITE_BASE_URL || '').replace(/\/$/, '');
const SITIO = (process.env.VITE_SITE_URL || 'https://d2xzv6q1daxyi1.cloudfront.net').replace(/\/$/, '');
const hoy = new Date().toISOString().slice(0, 10);

const slug = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const escapar = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const fijas = [
  ['/', 'daily', '1.0'], ['/propiedades', 'daily', '0.9'], ['/arriendo', 'daily', '0.8'], ['/venta', 'daily', '0.8'],
  ['/publicar-propiedad', 'monthly', '0.7'], ['/nosotros', 'monthly', '0.5'], ['/contacto', 'monthly', '0.5'],
  ['/preguntas-frecuentes', 'monthly', '0.4'], ['/terminos-y-condiciones', 'yearly', '0.2'], ['/politica-de-privacidad', 'yearly', '0.2'],
];

async function pedir(ruta) {
  const respuesta = await fetch(`${API}${ruta}`, { signal: AbortSignal.timeout(20000) });
  if (!respuesta.ok) throw new Error(`${ruta}: ${respuesta.status}`);
  return respuesta.json();
}

const urls = [...fijas];
if (API) {
  try {
    const filtros = await pedir('/api/publico/filtros/');
    for (const ciudad of filtros.ciudades || []) {
      urls.push([`/arriendo/${slug(ciudad)}`, 'daily', '0.7'], [`/venta/${slug(ciudad)}`, 'daily', '0.7']);
    }
    for (let pagina = 1, paginas = 1; pagina <= paginas && pagina <= 200; pagina += 1) {
      const datos = await pedir(`/api/publico/inmuebles/?por_pagina=48&pagina=${pagina}&orden=recientes`);
      paginas = datos.paginas || 1;
      for (const casa of datos.resultados || []) urls.push([`/propiedad/${casa.id}-${casa.slug}`, 'weekly', '0.8']);
    }
  } catch (error) {
    console.warn(`Aviso: el sitemap se genero solo con las paginas fijas (${error.message}).`);
  }
} else {
  console.warn('Aviso: sin VITE_BASE_URL el sitemap solo tiene las paginas fijas.');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([ruta, frecuencia, prioridad]) => `  <url><loc>${escapar(SITIO + ruta)}</loc><lastmod>${hoy}</lastmod><changefreq>${frecuencia}</changefreq><priority>${prioridad}</priority></url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /login
Disallow: /registerBasico
Disallow: /register
Disallow: /gestion
Disallow: /mis-propiedades
Disallow: /aplicar

Sitemap: ${SITIO}/sitemap.xml
`;

mkdirSync('dist', { recursive: true });
writeFileSync('dist/sitemap.xml', xml);
writeFileSync('dist/robots.txt', robots);
console.log(`sitemap.xml: ${urls.length} direcciones · robots.txt listo (${SITIO})`);
