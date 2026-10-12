import { Link } from 'react-router-dom';
import { IconoCorreo, IconoTelefono, IconoUbicacion, IconoWhatsapp } from '../inicio/iconosInicio';
import { EMPRESA, MENSAJE_GENERAL, enlaceWhatsapp } from './empresa';

const ENLACES = [
  { a: '/propiedades?modalidad=arriendo', texto: 'Propiedades en arriendo' },
  { a: '/propiedades?modalidad=venta', texto: 'Propiedades en venta' },
  { a: '/publicar-propiedad', texto: 'Publica tu propiedad' },
  { a: '/nosotros', texto: 'Nosotros' },
  { a: '/contacto', texto: 'Contacto' },
  { a: '/preguntas-frecuentes', texto: 'Preguntas frecuentes' },
];
const LEGALES = [
  { a: '/terminos-y-condiciones', texto: 'Términos y condiciones' },
  { a: '/politica-de-privacidad', texto: 'Política de tratamiento de datos' },
];

function PiePortal() {
  return (
    <footer id="contacto" className="mt-8 border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-xl font-bold text-fuchsia-900">{EMPRESA.nombre}</p>
          <p className="mt-1 text-sm text-gray-600">{EMPRESA.slogan}</p>
          <ul className="mt-5 space-y-2 text-sm text-gray-700">
            <li>
              <a href={enlaceWhatsapp(MENSAJE_GENERAL)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-fuchsia-900 no-underline hover:underline">
                <IconoWhatsapp className="h-4 w-4" /> WhatsApp {EMPRESA.telefono}
              </a>
            </li>
            <li>
              <a href={`tel:+${EMPRESA.whatsapp}`} className="inline-flex items-center gap-2 text-fuchsia-900 no-underline hover:underline">
                <IconoTelefono className="h-4 w-4" /> {EMPRESA.telefono}
              </a>
            </li>
            {EMPRESA.correo && (
              <li>
                <a href={`mailto:${EMPRESA.correo}`} className="inline-flex items-center gap-2 text-fuchsia-900 no-underline hover:underline">
                  <IconoCorreo className="h-4 w-4" /> {EMPRESA.correo}
                </a>
              </li>
            )}
            {(EMPRESA.direccion || EMPRESA.ciudad) && (
              <li className="inline-flex items-center gap-2">
                <IconoUbicacion className="h-4 w-4 text-fuchsia-900" /> {[EMPRESA.direccion, EMPRESA.ciudad].filter(Boolean).join(', ')}
              </li>
            )}
          </ul>
        </div>

        <nav aria-label="Enlaces del portal">
          <p className="font-semibold text-gray-900">Portal</p>
          <ul className="mt-4 space-y-2 text-sm">
            {ENLACES.map(({ a, texto }) => (
              <li key={a}><Link to={a} className="text-gray-700 no-underline hover:text-fuchsia-900 hover:underline">{texto}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Información legal">
          <p className="font-semibold text-gray-900">Legal</p>
          <ul className="mt-4 space-y-2 text-sm">
            {LEGALES.map(({ a, texto }) => (
              <li key={a}><Link to={a} className="text-gray-700 no-underline hover:text-fuchsia-900 hover:underline">{texto}</Link></li>
            ))}
          </ul>
          {EMPRESA.nit && <p className="mt-4 text-xs text-gray-500">{EMPRESA.razonSocial || EMPRESA.nombre} · NIT {EMPRESA.nit}</p>}
        </nav>
      </div>
      <p className="border-t border-gray-100 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {EMPRESA.nombre}. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default PiePortal;
