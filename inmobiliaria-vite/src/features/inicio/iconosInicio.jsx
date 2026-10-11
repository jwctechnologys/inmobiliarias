// Iconos de la pagina de inicio: trazo lineal uniforme (estilo "Lucide"), sin animacion. Todos heredan el
// color del texto (currentColor) y se dimensionan con className.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

const crear = (...trazos) =>
  function Icono({ className = 'w-5 h-5' }) {
    return (
      <svg {...base} className={className}>
        {trazos.map((d, i) => (typeof d === 'string' ? <path key={i} d={d} /> : <circle key={i} {...d} />))}
      </svg>
    );
  };

export const IconoCasa = crear('M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z');
export const IconoUbicacion = crear('M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z', { cx: 12, cy: 10, r: 3 });
export const IconoCama = crear('M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8', 'M2 17h20', 'M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4');
export const IconoBano = crear('M4 12h16a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2a1 1 0 0 1 1-1z', 'M6 12V5a2 2 0 0 1 2-2h1', 'M7 19l-1 2', 'M17 19l1 2');
export const IconoGaraje = crear('M3 13l2-6a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 6v4a1 1 0 0 1-1 1h-2v-1H6v1H4a1 1 0 0 1-1-1z', 'M3 13h18', { cx: 7.5, cy: 15.5, r: 0.8 }, { cx: 16.5, cy: 15.5, r: 0.8 });
export const IconoPatio = crear('M12 22v-6', 'M8 16h8a4 4 0 0 0 1-7.9 5 5 0 0 0-10 0A4 4 0 0 0 8 16z');
export const IconoEdificio = crear('M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16', 'M16 9h2a2 2 0 0 1 2 2v10', 'M3 21h18', 'M8 7h4', 'M8 11h4', 'M8 15h4');
export const IconoBuscar = crear({ cx: 11, cy: 11, r: 7 }, 'm20 20-3.5-3.5');
export const IconoEscudo = crear('M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z', 'm9 12 2.5 2.5L15.5 10');
export const IconoPersonas = crear('M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1', { cx: 9.5, cy: 7, r: 4 }, 'M21 20v-1a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8');
export const IconoTelefono = crear('M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z');
export const IconoCorreo = crear('M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'm3 7 9 6 9-6');
export const IconoFlecha = crear('M5 12h14', 'm13 6 6 6-6 6');
export const IconoEtiqueta = crear('M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z', { cx: 7.5, cy: 7.5, r: 1 });
export const IconoLlave = crear({ cx: 8, cy: 15, r: 4 }, 'm10.8 12.2 9.2-9.2', 'm17 6 3 3', 'm15 8 2 2');
export const IconoChevron = crear('m6 9 6 6 6-6');
export const IconoMapa = crear('M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z', 'M9 4v14', 'M15 6v14');
export const IconoWhatsapp = crear('M7.9 20A9 9 0 1 0 4 16.1L2 22z', 'M9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.4-2.2-1.1-.9.8c-1-.4-2-1.4-2.4-2.4l.8-.9-1.1-2.2z');
export const IconoCocina = crear('M5 3v7a2 2 0 0 0 2 2v9', 'M9 3v7a2 2 0 0 1-2 2', 'M7 3v5', 'M17 21V3c-2.5 1.5-4 4.5-4 8h4');
export const IconoSala = crear('M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3', 'M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z', 'M6 18v2', 'M18 18v2');
