import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Medicion de visitas y acciones con Google Analytics 4. Solo se activa si se define VITE_GA_ID al compilar
// (por ejemplo G-XXXXXXXXXX): sin esa variable no se carga nada ni se envia ningun dato a terceros.
const ID = import.meta.env.VITE_GA_ID;
let cargado = false;

function cargar() {
  if (!ID || cargado || typeof document === 'undefined') return;
  cargado = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date());
  window.gtag('config', ID, { send_page_view: false, anonymize_ip: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID)}`;
  document.head.appendChild(script);
}

// Acciones que importan: clic en WhatsApp, consulta enviada, propiedad enviada, compartir, favorito...
export function registrarEvento(nombre, parametros = {}) {
  if (!ID) return;
  cargar();
  window.gtag?.('event', nombre, parametros);
}

// Registra cada cambio de pagina (el portal es una aplicacion de una sola pagina: Google no los ve solo)
export function SeguimientoDePaginas() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (!ID) return;
    cargar();
    window.gtag?.('event', 'page_view', { page_path: pathname + search, page_location: window.location.href, page_title: document.title });
  }, [pathname, search]);
  return null;
}
