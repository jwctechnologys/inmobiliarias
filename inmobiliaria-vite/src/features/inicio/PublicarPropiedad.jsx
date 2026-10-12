import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
import { IconoCasa, IconoEscudo, IconoFlecha, IconoMegafono, IconoPersonas, IconoWhatsapp } from './iconosInicio';

const TIPOS = ['Casa', 'Apartamento', 'Local', 'Habitación', 'Oficina', 'Lote', 'Otro'];
const FOTO_MAX_MB = 5;
const VACIO = {
  nombre: '', telefono: '', correo: '', modalidad: 'arriendo', tipoInmueble: '', direccion: '', barrio: '', ciudad: '',
  precio: '', descripcion: '',
};

const claseCampo = (conError) =>
  `w-full rounded-lg border px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 ${conError ? 'border-red-400' : 'border-gray-300'}`;

function Campo({ etiqueta, obligatorio, error, ayuda, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-gray-800">
        {etiqueta} {obligatorio && <span className="text-red-500">*</span>}
      </span>
      {children}
      {ayuda && !error && <span className="mt-1 block text-xs text-gray-500">{ayuda}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

// Primer mensaje de error que devuelve la API para un campo (llega como lista o como texto).
const primerError = (valor) => (Array.isArray(valor) ? valor[0] : valor);

function PublicarPropiedad() {
  const [datos, setDatos] = useState(VACIO);
  const [foto, setFoto] = useState(null);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  const cambiar = (e) => setDatos((previos) => ({ ...previos, [e.target.name]: e.target.value }));

  const elegirFoto = (e) => {
    const archivo = e.target.files[0] || null;
    if (archivo && archivo.size > FOTO_MAX_MB * 1024 * 1024) {
      setErrores((previos) => ({ ...previos, foto: `La foto no puede pesar más de ${FOTO_MAX_MB} MB.` }));
      e.target.value = '';
      setFoto(null);
      return;
    }
    setErrores((previos) => ({ ...previos, foto: undefined }));
    setFoto(archivo);
  };

  // Validacion previa en el navegador: la API vuelve a validar todo, esto solo ahorra una ida y vuelta.
  const validar = () => {
    const nuevos = {};
    if (datos.nombre.trim().length < 3) nuevos.nombre = 'Escribe tu nombre.';
    if (datos.telefono.replace(/\D/g, '').length < 7) nuevos.telefono = 'Escribe un teléfono válido.';
    if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) nuevos.correo = 'Escribe un correo válido.';
    if (!datos.direccion.trim()) nuevos.direccion = 'Escribe la dirección del inmueble.';
    if (!datos.ciudad.trim()) nuevos.ciudad = 'Escribe la ciudad.';
    return nuevos;
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    const form = new FormData();
    Object.entries(datos).forEach(([clave, valor]) => { if (valor !== '') form.append(clave, valor); });
    if (foto) form.append('foto', foto);
    form.append('sitio_web', e.target.elements.sitio_web.value); // campo trampa: vacio para las personas

    setEnviando(true);
    try {
      const respuesta = await fetch(`${API_URL}/api/publicar_propiedad/`, { method: 'POST', body: form });
      if (respuesta.ok) {
        setEnviada(true);
        window.scrollTo(0, 0);
      } else if (respuesta.status === 429) {
        setErrorGeneral('Hemos recibido muchas solicitudes desde tu conexión. Inténtalo de nuevo en un rato.');
      } else if (respuesta.status === 400) {
        const api = await respuesta.json();
        setErrores(Object.fromEntries(Object.entries(api).map(([clave, valor]) => [clave, primerError(valor)])));
      } else {
        setErrorGeneral('No pudimos enviar tu solicitud. Inténtalo de nuevo.');
      }
    } catch {
      setErrorGeneral('No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (enviada) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-800">
            <IconoEscudo className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">¡Recibimos tu propiedad!</h1>
          <p className="mt-3 text-gray-600">
            Nuestro equipo revisará la información y se comunicará contigo al <strong>{datos.telefono}</strong> para
            continuar con la publicación.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-6 py-2.5 font-semibold text-white no-underline hover:bg-fuchsia-900">
              Volver al inicio <IconoFlecha className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => { setDatos(VACIO); setFoto(null); setErrores({}); setEnviada(false); }}
              className="rounded-full border border-fuchsia-800 px-6 py-2.5 font-semibold text-fuchsia-900 hover:bg-fuchsia-50"
            >
              Registrar otra propiedad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-[#1b0a26] via-[#3b1052] to-[#7a1f8e] text-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-200">
            <IconoMegafono className="w-5 h-5" /> Publica con nosotros
          </p>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Registra tu propiedad <span className="text-fuchsia-300">en minutos</span>
          </h1>
          <p className="mt-3 max-w-xl text-gray-200">
            Llena este formulario con los datos de tu inmueble. No necesitas crear una cuenta: nuestro equipo la revisa y
            te contacta para publicarla.
          </p>
        </div>
      </header>

      <form onSubmit={enviar} noValidate className="mx-auto -mt-6 max-w-3xl space-y-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8 mb-12">
        {/* Campo trampa contra robots: las personas no lo ven */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>No llenar este campo <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
        </div>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <IconoPersonas className="w-5 h-5 text-fuchsia-800" /> Tus datos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre completo" obligatorio error={errores.nombre}>
              <input name="nombre" value={datos.nombre} onChange={cambiar} className={claseCampo(errores.nombre)} autoComplete="name" />
            </Campo>
            <Campo etiqueta="Teléfono / WhatsApp" obligatorio error={errores.telefono}>
              <input name="telefono" type="tel" value={datos.telefono} onChange={cambiar} className={claseCampo(errores.telefono)} autoComplete="tel" placeholder="Ej: 300 123 4567" />
            </Campo>
            <div className="sm:col-span-2">
              <Campo etiqueta="Correo electrónico" error={errores.correo} ayuda="Opcional.">
                <input name="correo" type="email" value={datos.correo} onChange={cambiar} className={claseCampo(errores.correo)} autoComplete="email" />
              </Campo>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <IconoCasa className="w-5 h-5 text-fuchsia-800" /> Tu propiedad
          </h2>

          <div role="radiogroup" aria-label="Se ofrece" className="mb-4 inline-flex rounded-full border border-fuchsia-200 p-1">
            {[['arriendo', 'En arriendo'], ['venta', 'En venta']].map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={datos.modalidad === valor}
                onClick={() => setDatos((previos) => ({ ...previos, modalidad: valor }))}
                className={`rounded-full px-6 py-2 text-sm font-semibold ${datos.modalidad === valor ? 'bg-fuchsia-800 text-white' : 'text-fuchsia-900 hover:bg-fuchsia-50'}`}
              >
                {texto}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Tipo de inmueble" error={errores.tipoInmueble}>
              <select name="tipoInmueble" value={datos.tipoInmueble} onChange={cambiar} className={claseCampo(errores.tipoInmueble)}>
                <option value="">Selecciona...</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Campo>
            <Campo etiqueta={datos.modalidad === 'venta' ? 'Precio de venta ($)' : 'Canon mensual ($)'} error={errores.precio} ayuda="Opcional: un valor aproximado nos ayuda.">
              <input name="precio" type="number" min="0" value={datos.precio} onChange={cambiar} className={claseCampo(errores.precio)} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo etiqueta="Dirección" obligatorio error={errores.direccion}>
                <input name="direccion" value={datos.direccion} onChange={cambiar} className={claseCampo(errores.direccion)} autoComplete="street-address" />
              </Campo>
            </div>
            <Campo etiqueta="Barrio" error={errores.barrio}>
              <input name="barrio" value={datos.barrio} onChange={cambiar} className={claseCampo(errores.barrio)} />
            </Campo>
            <Campo etiqueta="Ciudad" obligatorio error={errores.ciudad}>
              <input name="ciudad" value={datos.ciudad} onChange={cambiar} className={claseCampo(errores.ciudad)} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo etiqueta="Descripción" error={errores.descripcion} ayuda="Habitaciones, baños, parqueadero, estado, qué incluye...">
                <textarea name="descripcion" rows="4" value={datos.descripcion} onChange={cambiar} className={claseCampo(errores.descripcion)} />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <Campo etiqueta="Foto principal" error={errores.foto} ayuda={`Opcional. Máximo ${FOTO_MAX_MB} MB.`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={elegirFoto}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-fuchsia-50 file:px-4 file:py-2 file:font-semibold file:text-fuchsia-900 hover:file:bg-fuchsia-100"
                />
              </Campo>
            </div>
          </div>
        </section>

        {errorGeneral && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorGeneral}</p>}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-sm text-xs text-gray-500">
            Al enviar autorizas que te contactemos para gestionar la publicación. Usaremos tus datos solo para eso.
          </p>
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex items-center gap-2 rounded-full bg-fuchsia-800 px-8 py-3 font-semibold text-white hover:bg-fuchsia-900 disabled:opacity-60"
          >
            {enviando ? 'Enviando...' : 'Enviar mi propiedad'} {!enviando && <IconoFlecha className="w-4 h-4" />}
          </button>
        </div>

        <p className="flex items-center justify-center gap-2 border-t border-gray-100 pt-5 text-sm text-gray-600">
          <IconoWhatsapp className="w-4 h-4 text-[#1fa855]" />
          ¿Prefieres hablar con alguien?{' '}
          <a
            href={`https://wa.me/573144568091?text=${encodeURIComponent('Hola, quisiera publicar mi propiedad con Inmobiliaria CL.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#178a45]"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </form>
    </div>
  );
}

export default PublicarPropiedad;
