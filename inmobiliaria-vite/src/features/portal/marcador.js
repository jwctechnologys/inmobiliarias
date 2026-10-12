import L from 'leaflet';

export const COLOR_MARCA = '#86198f';
export const CAPA_MAPA = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const ATRIBUCION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

// Marcador: una casa dentro de un circulo con punta hacia abajo. Se arma con elementos del DOM (no con texto HTML)
// para que ningun dato de un inmueble pueda ejecutar codigo en la pagina.
export function iconoCasa() {
  const NS = 'http://www.w3.org/2000/svg';
  const caja = document.createElement('div');
  caja.style.cssText = 'width:44px;text-align:center';
  const circulo = document.createElement('div');
  circulo.style.cssText = `width:44px;height:44px;border-radius:50%;background:${COLOR_MARCA};border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center`;
  const svg = document.createElementNS(NS, 'svg');
  [['width', '24'], ['height', '24'], ['viewBox', '0 0 24 24'], ['fill', 'none'], ['stroke', '#fff'], ['stroke-width', '2'], ['stroke-linecap', 'round'], ['stroke-linejoin', 'round']]
    .forEach(([clave, valor]) => svg.setAttribute(clave, valor));
  const trazo = document.createElementNS(NS, 'path');
  trazo.setAttribute('d', 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z');
  svg.appendChild(trazo);
  circulo.appendChild(svg);
  const punta = document.createElement('div');
  punta.style.cssText = `width:0;height:0;margin:-1px auto 0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid ${COLOR_MARCA}`;
  caja.append(circulo, punta);
  return L.divIcon({ html: caja, className: '', iconSize: [44, 56], iconAnchor: [22, 56], popupAnchor: [0, -50] });
}

export function crearMapa(contenedor, opciones = {}) {
  const mapa = L.map(contenedor, { scrollWheelZoom: false, ...opciones });
  L.tileLayer(CAPA_MAPA, { maxZoom: 19, attribution: ATRIBUCION }).addTo(mapa);
  // La rueda del raton solo acerca el mapa cuando se hizo clic en el: asi no se traba el desplazamiento de la pagina.
  mapa.on('focus', () => mapa.scrollWheelZoom.enable());
  mapa.on('blur', () => mapa.scrollWheelZoom.disable());
  return mapa;
}
