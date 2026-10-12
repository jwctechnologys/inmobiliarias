import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
import {
  IconoAlerta, IconoBandeja, IconoBuscar, IconoCasa, IconoDocumento, IconoEstrella, IconoGrafica, IconoMegafono,
  IconoPersonas, IconoTarjeta, IconoUsuarioMas, IconoEscudo, IconoCalendario, IconoMapa,
} from './iconosInicio';
import { useSeo } from '../portal/seo';

// Accesos de cada rol: lo que la persona hace todos los dias. Solo se listan pantallas que existen.
const ACCESOS = {
  administrador: [
    { seccion: 'Contratos y solicitudes', items: [
      { id: 'solicitudes', titulo: 'Gestionar solicitudes', detalle: 'Revisa y responde las solicitudes de arriendo', a: '/ver-solicitudes', Icono: IconoBandeja },
      { id: 'crear', titulo: 'Crear contratos', detalle: 'Genera el contrato de las solicitudes aceptadas', a: '/Crear/Contratos', Icono: IconoDocumento },
      { id: 'revisar', titulo: 'Revisar contratos', detalle: 'Contratos firmados e inconformidades', a: '/Revisar/Contratos', Icono: IconoEscudo },
      { id: 'seguimiento', titulo: 'Seguimiento de pagos', detalle: 'Pagos de arriendo de los contratos activos', a: '/SeguimientoApagos', Icono: IconoTarjeta },
      { id: 'servicios', titulo: 'Pagos de servicios', detalle: 'Recibos de servicios subidos por los arrendatarios', a: '/RevisarPagosServicios', Icono: IconoCalendario },
      { id: 'novedades', titulo: 'Reportes de novedades', detalle: 'Percances reportados en los inmuebles', a: '/VerReporteNovedades', Icono: IconoAlerta },
    ] },
    { seccion: 'Propiedades y portal', items: [
      { id: 'casas', titulo: 'Registrar casas', detalle: 'Crea, edita y publica los inmuebles', a: '/register/Casas', Icono: IconoCasa },
      { id: 'portal', titulo: 'Solicitudes del portal', detalle: 'Consultas, visitas y propiedades enviadas', a: '/gestion/solicitudes', Icono: IconoMegafono },
      { id: 'estadisticas', titulo: 'Estadísticas de propiedades', detalle: 'Visitas y consultas por inmueble', a: '/mis-propiedades', Icono: IconoGrafica },
      { id: 'publico', titulo: 'Ver el portal público', detalle: 'Cómo lo ven los visitantes', a: '/propiedades', Icono: IconoBuscar },
    ] },
    { seccion: 'Usuarios', items: [
      { id: 'registrar', titulo: 'Registrar usuarios', detalle: 'Propietarios, arrendatarios y proveedores', a: '/register', Icono: IconoUsuarioMas },
      { id: 'usuarios', titulo: 'Ver usuarios', detalle: 'Consulta y edita los usuarios', a: '/VerUsuarios', Icono: IconoPersonas },
    ] },
  ],
  propietario: [
    { seccion: 'Mis propiedades', items: [
      { id: 'casas', titulo: 'Registrar casas', detalle: 'Crea y edita tus inmuebles', a: '/register/Casas', Icono: IconoCasa },
      { id: 'estadisticas', titulo: 'Mis propiedades', detalle: 'Visitas y consultas de cada anuncio', a: '/mis-propiedades', Icono: IconoGrafica },
      { id: 'solicitudes', titulo: 'Ver solicitudes', detalle: 'Solicitudes de arriendo de tus inmuebles', a: '/ver-solicitudes', Icono: IconoBandeja },
      { id: 'publico', titulo: 'Ver el portal público', detalle: 'Cómo ven tus propiedades los visitantes', a: '/propiedades', Icono: IconoBuscar },
    ] },
  ],
  arrendatario: [
    { seccion: 'Mi arriendo', items: [
      { id: 'solicitudes', titulo: 'Gestionar solicitudes', detalle: 'Estado de tus solicitudes de arriendo', a: '/ver-solicitudes', Icono: IconoBandeja },
      { id: 'contratos', titulo: 'Ver contratos', detalle: 'Tus contratos y los pendientes de firma', a: '/VerContratosUsuario', Icono: IconoDocumento },
      { id: 'pagos', titulo: 'Subir pagos', detalle: 'Recibos de servicios y pagos', a: '/SubirPagoRecibosSeparados', Icono: IconoTarjeta },
      { id: 'novedades', titulo: 'Reportar percances', detalle: 'Avisa de daños o novedades en tu vivienda', a: '/ReporteNovedades', Icono: IconoAlerta },
    ] },
    { seccion: 'Mi perfil', items: [
      { id: 'coarrendatario', titulo: 'Registrar coarrendatario', detalle: 'Agrega a tu codeudor o coarrendatario', a: '/register/coarrendatario', Icono: IconoUsuarioMas },
      { id: 'dependientes', titulo: 'Registrar dependientes', detalle: 'Las personas que vivirán contigo', a: '/register/dependientes', Icono: IconoPersonas },
      { id: 'referencias', titulo: 'Registrar referencias', detalle: 'Referencias personales y comerciales', a: '/registrarReferencia', Icono: IconoEstrella },
      { id: 'publico', titulo: 'Buscar propiedades', detalle: 'Mira las propiedades disponibles', a: '/propiedades', Icono: IconoBuscar },
    ] },
  ],
  proveedor: [
    { seccion: 'Portal', items: [
      { id: 'publico', titulo: 'Ver el portal público', detalle: 'Propiedades disponibles', a: '/propiedades', Icono: IconoMapa },
    ] },
  ],
};

const ROL_TEXTO = { administrador: 'Administrador', propietario: 'Propietario', arrendatario: 'Arrendatario', proveedor: 'Proveedor' };
const ROLES = ['administrador', 'propietario', 'arrendatario', 'proveedor'];

const usuarioGuardado = () => {
  try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
};

async function contar(ruta, clave) {
  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, { credentials: 'include' });
    if (!respuesta.ok) return 0;
    const datos = await respuesta.json();
    return clave ? Number(datos?.[clave]) || 0 : Array.isArray(datos) ? datos.length : 0;
  } catch {
    return 0;
  }
}

// Pagina de inicio de quien tiene sesion: lo importante son las funciones del programa, no las propiedades.
function PanelInicio() {
  const usuario = usuarioGuardado();
  const grupos = usuario.groups || [];
  const rol = ROLES.find((r) => grupos.includes(r)) || 'proveedor';
  const [avisos, setAvisos] = useState({});
  useSeo({ titulo: 'Panel de inicio', noIndexar: true });

  useEffect(() => {
    let activo = true;
    const poner = (id, n) => { if (activo && n > 0) setAvisos((a) => ({ ...a, [id]: n })); };
    if (rol === 'administrador') {
      contar('/api/solicitudes-pendientes/', 'solicitudes_pendientes').then((n) => poner('solicitudes', n));
      contar('/api/gestion/consultas/?estado=nueva').then((n) => poner('portal', n));
      contar('/api/gestion/publicaciones/?estado=pendiente').then((n) => setAvisos((a) => (activo && n > 0 ? { ...a, portal: (a.portal || 0) + n } : a)));
    } else if (rol === 'propietario') {
      contar('/api/gestion/consultas/?estado=nueva').then((n) => poner('estadisticas', n));
    } else if (rol === 'arrendatario' && usuario.id) {
      contar(`/api/solicitudes/arrendatario/${usuario.id}/pendientes/`, 'solicitudes_pendientes').then((n) => poner('solicitudes', n));
    }
    return () => { activo = false; };
    // el usuario no cambia mientras la pantalla esta abierta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol]);

  const secciones = useMemo(() => ACCESOS[rol] || ACCESOS.proveedor, [rol]);
  const nombre = usuario.first_name || usuario.username || 'bienvenido';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-[#1b0a26] via-[#3b1052] to-[#7a1f8e] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-200">{ROL_TEXTO[rol]}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Hola, {nombre}</h1>
          <p className="mt-2 max-w-xl text-gray-200">¿Qué quieres hacer hoy? Elige una función.</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        {secciones.map(({ seccion, items }) => (
          <section key={seccion} aria-labelledby={`s-${seccion}`}>
            <h2 id={`s-${seccion}`} className="mb-4 border-l-4 border-fuchsia-800 pl-3 text-xl font-bold text-gray-900">{seccion}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(({ id, titulo, detalle, a, Icono }) => (
                <li key={id}>
                  <Link to={a} className="group relative flex h-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-inherit no-underline shadow-sm hover:border-fuchsia-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-700">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-900 group-hover:bg-fuchsia-800 group-hover:text-white">
                      <Icono className="h-7 w-7" />
                    </span>
                    <span className="min-w-0 leading-tight">
                      <strong className="block text-base font-semibold text-gray-900">{titulo}</strong>
                      <span className="text-sm text-gray-600">{detalle}</span>
                    </span>
                    {avisos[id] > 0 && (
                      <span className="absolute right-3 top-3 min-w-6 rounded-full bg-fuchsia-700 px-2 py-0.5 text-center text-xs font-bold text-white" aria-label={`${avisos[id]} pendientes`}>
                        {avisos[id]}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

export default PanelInicio;
