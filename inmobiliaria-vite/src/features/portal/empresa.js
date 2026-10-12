// Datos de la inmobiliaria que se muestran en el portal (contacto, páginas legales, pie de página).
// Un solo lugar: cambia aquí un dato y se actualiza en todo el portal. Los campos vacíos simplemente no se muestran.
export const EMPRESA = {
  nombre: 'Inmobiliaria CL',
  slogan: 'Tu mejor conexión',
  whatsapp: '573144568091', // solo números, con indicativo del país
  telefono: '+57 314 456 8091',
  correo: 'info@inmobiliaria.cl',
  ciudad: 'Villavicencio, Meta',
  direccion: '',
  horario: '',
  nit: '',
  razonSocial: '',
};

export const enlaceWhatsapp = (mensaje) =>
  `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(mensaje)}`;

export const MENSAJE_GENERAL = `Hola, quisiera información sobre las propiedades disponibles en ${EMPRESA.nombre}.`;
export const MENSAJE_PUBLICAR = `Hola, quisiera publicar mi propiedad con ${EMPRESA.nombre}. ¿Me pueden dar información?`;
