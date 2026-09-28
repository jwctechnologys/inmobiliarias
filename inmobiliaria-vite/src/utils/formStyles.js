// Estilos compartidos de formularios. Antes cada pantalla declaraba sus propias clases sueltas
// (algunas con Tailwind, la mayoria sin nada), asi que no se veian parejas entre si. Este es el
// mismo "look" que ya se usaba en los formularios de registro (RegisterArrendatario y similares),
// ahora en un solo lugar para que cualquier formulario nuevo o viejo se vea igual de cuidado.
//
// Importante: cada clase de cada color va escrita completa (ej. "from-purple-50"), nunca armada
// por partes con un template string. Tailwind lee el codigo como texto para saber que clases
// generar; una clase construida en tiempo de ejecucion (`from-${color}`) nunca aparece completa en
// ningun archivo, y Tailwind no la genera: el estilo se perderia en silencio.
const ESTILOS_POR_COLOR = {
  purpura: {
    fondo: 'from-purple-50 to-pink-100',
    anillo: 'focus:ring-purple-500',
    borde: 'border-purple-200',
    boton: 'bg-purple-600 hover:bg-purple-700',
  },
  azul: {
    fondo: 'from-blue-50 to-indigo-100',
    anillo: 'focus:ring-blue-500',
    borde: 'border-blue-200',
    boton: 'bg-blue-600 hover:bg-blue-700',
  },
  verde: {
    fondo: 'from-green-50 to-emerald-100',
    anillo: 'focus:ring-green-500',
    borde: 'border-green-200',
    boton: 'bg-green-600 hover:bg-green-700',
  },
  indigo: {
    fondo: 'from-indigo-50 to-blue-100',
    anillo: 'focus:ring-indigo-500',
    borde: 'border-indigo-200',
    boton: 'bg-indigo-600 hover:bg-indigo-700',
  },
};

// color: una clave de ESTILOS_POR_COLOR (por defecto "purpura", el que ya usaban los formularios
// del arrendatario). Cada formulario puede usar un color distinto para diferenciarse a simple vista.
export const estilosFormulario = (color = 'purpura') => {
  const c = ESTILOS_POR_COLOR[color] || ESTILOS_POR_COLOR.purpura;
  return {
    pagina: `min-h-screen bg-gradient-to-br ${c.fondo} py-8 px-4 sm:px-6 lg:px-8`,
    contenedor: 'max-w-4xl mx-auto',
    tarjeta: 'bg-white rounded-xl shadow-2xl p-6 md:p-8',
    titulo: 'text-2xl sm:text-3xl font-bold text-gray-900 mb-6',
    seccionTitulo: `text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 ${c.borde}`,
    label: 'block text-sm font-medium text-gray-700 mb-1',
    input: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${c.anillo} focus:border-transparent transition duration-200 bg-white`,
    select: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${c.anillo} focus:border-transparent transition duration-200 bg-white`,
    textarea: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${c.anillo} focus:border-transparent transition duration-200 bg-white min-h-[100px]`,
    checkboxFila: 'flex items-center gap-2 text-sm font-medium text-gray-700',
    grupo: 'space-y-4',
    grid2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    botonPrimario: `w-full sm:w-auto px-6 py-2.5 ${c.boton} text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`,
    botonSecundario: 'px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm border border-gray-300 transition-colors',
    archivo: 'block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200',
  };
};
