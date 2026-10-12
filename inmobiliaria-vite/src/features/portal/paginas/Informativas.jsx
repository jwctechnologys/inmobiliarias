import { Link } from 'react-router-dom';
import { IconoCorreo, IconoEscudo, IconoMegafono, IconoPersonas, IconoTelefono, IconoUbicacion, IconoWhatsapp, IconoEdificio, IconoBuscar, IconoCheck } from '../../inicio/iconosInicio';
import { EMPRESA, MENSAJE_GENERAL, enlaceWhatsapp } from '../empresa';
import { useSeo } from '../seo';
import PiePortal from '../PiePortal';

const ACTUALIZADO = '11 de octubre de 2026';

// Estructura comun de las paginas informativas: encabezado morado, contenido y pie del portal
function Pagina({ titulo, descripcion, ruta, jsonLd, children }) {
  useSeo({ titulo, descripcion, ruta, jsonLd });
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-[#1b0a26] via-[#3b1052] to-[#7a1f8e] text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <nav aria-label="Ruta de navegación" className="mb-3 text-sm text-fuchsia-200">
            <Link to="/" className="text-fuchsia-200 no-underline hover:underline">Inicio</Link> / <span>{titulo}</span>
          </nav>
          <h1 className="text-3xl font-bold md:text-4xl">{titulo}</h1>
          {descripcion && <p className="mt-3 max-w-2xl text-gray-200">{descripcion}</p>}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">{children}</main>
      <PiePortal />
    </div>
  );
}

function Texto({ titulo, children }) {
  return (
    <section className="mb-8">
      {titulo && <h2 className="mb-3 text-xl font-bold text-gray-900">{titulo}</h2>}
      <div lang="es" className="space-y-3 text-justify hyphens-auto leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

const Boton = ({ a, children, externo }) => externo
  ? <a href={a} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1fa855] px-6 py-3 font-semibold text-white no-underline hover:bg-[#178a45]">{children}</a>
  : <Link to={a} className="inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-6 py-3 font-semibold text-white no-underline hover:bg-fuchsia-900">{children}</Link>;

// ------------------------------------------------------------------ Nosotros
export function Nosotros() {
  const pasos = [
    { Icono: IconoBuscar, titulo: 'Encuentra', texto: 'Busca por zona, precio y características, mira las fotos y ubica cada propiedad en el mapa.' },
    { Icono: IconoPersonas, titulo: 'Habla con nosotros', texto: 'Escríbenos por WhatsApp o agenda una visita desde la ficha de la propiedad.' },
    { Icono: IconoEscudo, titulo: 'Firma con respaldo', texto: 'Te acompañamos en los trámites y en el contrato, para que todo quede claro y seguro.' },
  ];
  return (
    <Pagina titulo="Nosotros" descripcion={`${EMPRESA.nombre}: ${EMPRESA.slogan.toLowerCase()} entre propietarios e inquilinos.`} ruta="/nosotros">
      <Texto titulo={`¿Quiénes somos?`}>
        <p>{EMPRESA.nombre} es una inmobiliaria de {EMPRESA.ciudad} que conecta a propietarios con personas que buscan un hogar, un local o una inversión. Administramos el proceso completo: publicamos la propiedad, atendemos a los interesados, validamos las solicitudes y formalizamos el contrato.</p>
        <p>Trabajamos con un objetivo: que arrendar, comprar o publicar un inmueble sea una experiencia clara, segura y cercana, con información real y acompañamiento de una persona en cada paso.</p>
      </Texto>

      <h2 className="mb-4 text-xl font-bold text-gray-900">Cómo funciona</h2>
      <ol className="mb-10 grid gap-4 md:grid-cols-3">
        {pasos.map(({ Icono, titulo, texto }, i) => (
          <li key={titulo} className="rounded-2xl border border-gray-200 bg-white p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-900"><Icono className="h-6 w-6" /></span>
            <p className="mt-3 font-semibold text-gray-900">{i + 1}. {titulo}</p>
            <p className="mt-1 text-sm text-gray-600">{texto}</p>
          </li>
        ))}
      </ol>

      <Texto titulo="Lo que nos importa">
        <ul className="space-y-2">
          {['Información veraz: lo que ves en la ficha es lo que hay.', 'Atención directa: respondemos tus mensajes y llamadas.', 'Trámites seguros: contratos claros y datos protegidos.', 'Transparencia con propietarios e inquilinos.'].map((t) => (
            <li key={t} className="flex items-start gap-2"><IconoCheck className="mt-1 h-4 w-4 shrink-0 text-fuchsia-800" /> {t}</li>
          ))}
        </ul>
      </Texto>

      <div className="flex flex-wrap gap-3">
        <Boton a="/propiedades"><IconoBuscar className="h-5 w-5" /> Ver propiedades</Boton>
        <Boton a="/publicar-propiedad"><IconoMegafono className="h-5 w-5" /> Publica tu propiedad</Boton>
      </div>
    </Pagina>
  );
}

// ------------------------------------------------------------------ Contacto
export function Contacto() {
  const canales = [
    { Icono: IconoWhatsapp, titulo: 'WhatsApp', texto: EMPRESA.telefono, a: enlaceWhatsapp(MENSAJE_GENERAL), externo: true },
    { Icono: IconoTelefono, titulo: 'Llámanos', texto: EMPRESA.telefono, a: `tel:+${EMPRESA.whatsapp}` },
    EMPRESA.correo && { Icono: IconoCorreo, titulo: 'Correo', texto: EMPRESA.correo, a: `mailto:${EMPRESA.correo}` },
    (EMPRESA.direccion || EMPRESA.ciudad) && { Icono: IconoUbicacion, titulo: 'Ubicación', texto: [EMPRESA.direccion, EMPRESA.ciudad].filter(Boolean).join(', ') },
  ].filter(Boolean);
  return (
    <Pagina titulo="Contacto" descripcion="Escríbenos o llámanos: con gusto resolvemos tus dudas." ruta="/contacto">
      <ul className="mb-8 grid gap-4 sm:grid-cols-2">
        {canales.map(({ Icono, titulo, texto, a, externo }) => {
          const contenido = (
            <>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-900"><Icono className="h-6 w-6" /></span>
              <span className="leading-tight"><strong className="block text-gray-900">{titulo}</strong><span className="text-sm text-gray-600">{texto}</span></span>
            </>
          );
          return (
            <li key={titulo}>
              {a
                ? <a href={a} {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 no-underline hover:border-fuchsia-800">{contenido}</a>
                : <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">{contenido}</div>}
            </li>
          );
        })}
      </ul>
      {EMPRESA.horario && <p className="mb-8 text-gray-700"><strong>Horario de atención:</strong> {EMPRESA.horario}</p>}
      <Texto titulo="¿Quieres publicar tu propiedad o agendar una visita?">
        <p>Para publicar un inmueble llena el formulario y te contactamos. Para visitar una propiedad, entra a su ficha y elige &ldquo;Agendar visita&rdquo;: dejas tu día y franja preferidos y te confirmamos.</p>
      </Texto>
      <div className="flex flex-wrap gap-3">
        <Boton a="/publicar-propiedad"><IconoMegafono className="h-5 w-5" /> Publicar mi propiedad</Boton>
        <Boton a="/propiedades"><IconoEdificio className="h-5 w-5" /> Ver propiedades</Boton>
      </div>
    </Pagina>
  );
}

// ------------------------------------------------------------------ Preguntas frecuentes
export const PREGUNTAS = [
  ['¿Cómo arriendo una propiedad?', 'Busca la propiedad en el portal, entra a su ficha y pulsa "Solicitar este arriendo" o escríbenos por WhatsApp. Revisamos tu solicitud, coordinamos la visita y, si todo está bien, firmamos el contrato.'],
  ['¿Cómo agendo una visita?', 'En la ficha de cada propiedad elige "Agendar visita", indica el día y la franja (mañana o tarde) y deja tu teléfono. Te llamamos para confirmar.'],
  ['¿Qué necesito para arrendar?', 'Te pediremos tus datos, información laboral o de ingresos, referencias y copia de tu documento. El equipo te indica exactamente qué documentos aplican en cada caso.'],
  ['¿Cómo publico mi propiedad?', 'Entra a "Publica tu propiedad", llena el formulario con los datos del inmueble y, si quieres, una foto. No necesitas crear una cuenta: nuestro equipo te contacta para completar la publicación.'],
  ['¿Cuánto cuesta publicar?', 'Escríbenos o llámanos y te explicamos las condiciones según el tipo de inmueble y si lo quieres en arriendo o en venta.'],
  ['¿Las fotos y los precios son reales?', 'Sí. Verificamos la información con el propietario. Las propiedades con la insignia "Verificada" fueron revisadas por nuestro equipo.'],
  ['¿Cómo protegen mis datos?', 'Usamos tus datos solo para contactarte sobre lo que solicitaste y para gestionar el servicio. Puedes ver todos los detalles en nuestra política de tratamiento de datos y pedirnos su actualización o eliminación cuando quieras.'],
  ['¿Qué pasa cuando una propiedad se arrienda o se vende?', 'Deja de aparecer en el portal automáticamente. Si alguien la había guardado en favoritos, verá que ya no está disponible.'],
];

export function PreguntasFrecuentes() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: PREGUNTAS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  return (
    <Pagina titulo="Preguntas frecuentes" descripcion="Lo que más nos preguntan sobre arrendar, comprar y publicar." ruta="/preguntas-frecuentes" jsonLd={jsonLd}>
      <div className="space-y-3">
        {PREGUNTAS.map(([pregunta, respuesta]) => (
          <details key={pregunta} className="group rounded-2xl border border-gray-200 bg-white p-5">
            <summary className="cursor-pointer list-none font-semibold text-gray-900 marker:hidden">{pregunta}</summary>
            <p className="mt-3 leading-relaxed text-gray-700">{respuesta}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-gray-700">¿No encontraste tu respuesta? <Link to="/contacto" className="font-semibold text-fuchsia-900">Escríbenos</Link> y con gusto te ayudamos.</p>
    </Pagina>
  );
}

// ------------------------------------------------------------------ Terminos y condiciones
export function Terminos() {
  const responsable = EMPRESA.razonSocial || EMPRESA.nombre;
  return (
    <Pagina titulo="Términos y condiciones" descripcion={`Condiciones de uso del portal de ${EMPRESA.nombre}. Última actualización: ${ACTUALIZADO}.`} ruta="/terminos-y-condiciones">
      <Texto titulo="1. Aceptación">
        <p>Al usar este portal aceptas estos términos. Si no estás de acuerdo, te pedimos no utilizarlo. {responsable} (en adelante, &ldquo;la Inmobiliaria&rdquo;) puede actualizarlos; la versión vigente es la publicada aquí.</p>
      </Texto>
      <Texto titulo="2. Qué ofrece el portal">
        <p>El portal permite consultar propiedades en arriendo y en venta, contactar a la Inmobiliaria, solicitar visitas, publicar una propiedad para su gestión y, para usuarios registrados, gestionar solicitudes y contratos de arrendamiento.</p>
      </Texto>
      <Texto titulo="3. Información de las propiedades">
        <p>Procuramos que la información (precio, medidas, fotos, características) sea exacta y esté actualizada, pero puede variar o contener errores involuntarios. Los datos son informativos y no constituyen una oferta vinculante hasta que se formalice el contrato correspondiente. La disponibilidad se confirma con la Inmobiliaria.</p>
      </Texto>
      <Texto titulo="4. Propietarios que publican">
        <p>Quien envía una propiedad declara ser su propietario o estar autorizado para ofrecerla, y que la información suministrada es veraz. La Inmobiliaria revisa cada solicitud y puede aceptarla, pedir ajustes o rechazarla, sin que ello genere derecho a indemnización. Enviar el formulario no implica la publicación inmediata.</p>
      </Texto>
      <Texto titulo="5. Uso adecuado">
        <p>No está permitido usar el portal para fines ilícitos, enviar información falsa, suplantar a otras personas, intentar acceder a áreas restringidas o extraer datos de forma masiva. Podemos limitar o bloquear el acceso ante un uso abusivo.</p>
      </Texto>
      <Texto titulo="6. Contenido">
        <p>Los textos, diseños, marcas y logos del portal pertenecen a la Inmobiliaria o a sus titulares. Las fotos y descripciones enviadas por los propietarios se usan con su autorización para promocionar la propiedad.</p>
      </Texto>
      <Texto titulo="7. Responsabilidad">
        <p>La Inmobiliaria no responde por interrupciones del servicio, fallas de internet ni por decisiones tomadas únicamente con base en la información del portal sin verificar con nuestro equipo. Los contratos de arrendamiento o compraventa se rigen por la ley colombiana y por los documentos que las partes firmen.</p>
      </Texto>
      <Texto titulo="8. Datos personales">
        <p>El tratamiento de tus datos se describe en la <Link to="/politica-de-privacidad" className="font-semibold text-fuchsia-900">política de tratamiento de datos personales</Link>.</p>
      </Texto>
      <Texto titulo="9. Ley aplicable y contacto">
        <p>Estos términos se rigen por las leyes de la República de Colombia. Para cualquier consulta escríbenos a {EMPRESA.correo || EMPRESA.telefono}.</p>
      </Texto>
    </Pagina>
  );
}

// ------------------------------------------------------------------ Politica de tratamiento de datos
export function Privacidad() {
  const responsable = EMPRESA.razonSocial || EMPRESA.nombre;
  const contacto = [EMPRESA.correo, EMPRESA.telefono].filter(Boolean).join(' · ');
  return (
    <Pagina titulo="Política de tratamiento de datos personales" descripcion={`Cómo recolectamos, usamos y protegemos tus datos. Última actualización: ${ACTUALIZADO}.`} ruta="/politica-de-privacidad">
      <Texto titulo="1. Responsable del tratamiento">
        <p>{responsable}{EMPRESA.nit ? `, NIT ${EMPRESA.nit}` : ''}, {EMPRESA.ciudad}. Contacto para temas de datos: {contacto}.</p>
        <p>Esta política se expide en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas sobre protección de datos personales en Colombia.</p>
      </Texto>
      <Texto titulo="2. Datos que recolectamos">
        <p>Nombre, teléfono, correo electrónico, datos del inmueble (dirección, características, fotos) y el contenido de los mensajes que nos envías. Si te registras como usuario, también la información necesaria para gestionar solicitudes y contratos de arrendamiento. Si usas el portal, podemos registrar datos técnicos de navegación (por ejemplo, páginas visitadas) de forma agregada.</p>
      </Texto>
      <Texto titulo="3. Finalidades">
        <ul className="list-disc space-y-1 pl-5">
          <li>Responder tus consultas y coordinar visitas.</li>
          <li>Gestionar la publicación, promoción, arriendo o venta de inmuebles.</li>
          <li>Tramitar solicitudes, estudios y contratos de arrendamiento.</li>
          <li>Mejorar el portal y medir su uso.</li>
          <li>Cumplir obligaciones legales y contractuales.</li>
        </ul>
      </Texto>
      <Texto titulo="4. Autorización">
        <p>Al enviar un formulario del portal y marcar la casilla de autorización, nos autorizas de manera previa, expresa e informada para tratar tus datos con las finalidades descritas. Guardamos la constancia de esa autorización (fecha y hora del envío).</p>
      </Texto>
      <Texto titulo="5. Tus derechos">
        <p>Como titular puedes conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización; ser informado del uso que se les da; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización y solicitar la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos. Escríbenos a {contacto} y atenderemos tu solicitud dentro de los plazos legales.</p>
      </Texto>
      <Texto titulo="6. Compartir datos">
        <p>No vendemos tus datos. Podemos compartirlos con el propietario del inmueble de tu interés, con proveedores que nos prestan servicios técnicos (alojamiento, correo, mapas, analítica) y con autoridades cuando la ley lo exija. Los datos se alojan en servidores seguros.</p>
      </Texto>
      <Texto titulo="7. Conservación y seguridad">
        <p>Conservamos los datos el tiempo necesario para las finalidades descritas y las obligaciones legales. Aplicamos medidas técnicas y administrativas razonables para protegerlos contra acceso no autorizado, pérdida o alteración.</p>
      </Texto>
      <Texto titulo="8. Cookies y analítica">
        <p>El portal guarda en tu navegador información básica para funcionar (por ejemplo, tus propiedades favoritas). Si se activa la analítica de visitas, se usa de forma anonimizada para entender qué páginas son útiles.</p>
      </Texto>
      <Texto titulo="9. Cambios">
        <p>Podemos actualizar esta política; publicaremos la versión vigente en esta página con su fecha de actualización.</p>
      </Texto>
    </Pagina>
  );
}
