import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCsrfToken } from '../../appprincipal/csrf';
import '../ImprimirContrato.css';

const calcularDuracionEnMeses = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
};
const formatearFechaCompleta = (fechaString) => {
  if (!fechaString) return 'fecha no disponible';

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const [year, month, day] = fechaString.split('-');
  const dia = parseInt(day);
  const mes = meses[parseInt(month) - 1];
  const año = parseInt(year);

  return `${dia} días del mes de ${mes.charAt(0).toUpperCase() + mes.slice(1)} de ${año}`;
};
function formatearFechaConPalabras(fechaString) {
  if (!fechaString) return 'fecha no disponible';

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const [year, month, day] = fechaString.split('-');
  const dia = parseInt(day);
  const mes = meses[parseInt(month) - 1];
  const año = parseInt(year);

  return `el día ${dia} de ${mes} del ${año}`;
}

function formatearFecha(fechaString) {
  if (!fechaString) return 'fecha no disponible';
  const [year, month, day] = fechaString.split('-');
  return ` día (${parseInt(day)}) mes (${parseInt(month)}) año (${parseInt(year)})`;
}

// Función para convertir números en palabras
function convertirNumeroAPalabras(numero) {
  if (!numero || numero === 0) return 'Cero';

  const unidades = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas = ['', '', 'veinti', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  function convertirCentenas(numero) {
    if (numero === 0) return '';
    if (numero === 100) return 'cien';
    const centena = Math.floor(numero / 100);
    const resto = numero % 100;

    return `${centenas[centena]} ${convertirDecenas(resto)}`.trim();
  }

  function convertirDecenas(numero) {
    if (numero === 0) return '';
    if (numero < 10) return unidades[numero];
    if (numero >= 10 && numero < 20) return especiales[numero - 10];
    if (numero === 20) return 'veinte';
    if (numero > 20 && numero < 30) {
      const decena = Math.floor(numero / 10);
      const unidad = numero % 10;
      return unidad === 0 ? decenas[decena] : `${decenas[decena]}${unidades[unidad]}`;
    }
    const decena = Math.floor(numero / 10);
    const unidad = numero % 10;

    return unidad === 0 ? decenas[decena] : `${decenas[decena]} y ${unidades[unidad]}`;
  }

  function convertirMiles(numero) {
    const miles = Math.floor(numero / 1000);
    const resto = numero % 1000;

    const milesPalabra = miles === 1 ? 'mil' : `${convertirCentenas(miles)} mil`;
    const restoPalabra = convertirCentenas(resto);

    return `${milesPalabra} ${restoPalabra}`.trim();
  }

  function convertirMillones(numero) {
    const millones = Math.floor(numero / 1000000);
    const resto = numero % 1000000;

    const millonesPalabra = millones === 1 ? 'un millón' : `${convertirCentenas(millones)} millones`;
    const restoPalabra = convertirMiles(resto);

    return `${millonesPalabra} ${restoPalabra}`.trim();
  }

  let resultado;

  if (numero < 100) {
    resultado = convertirDecenas(numero);
  } else if (numero < 1000) {
    resultado = convertirCentenas(numero);
  } else if (numero < 1000000) {
    resultado = convertirMiles(numero);
  } else {
    resultado = convertirMillones(numero);
  }

  return capitalizarPrimeraLetra(resultado);
}

function formatoNumeroConSeparadores(numero) {
  if (!numero) return '0';
  return Number(numero).toLocaleString('es-ES');
}

// Función para convertir el año a palabras
function convertirAñoAPalabras(año) {
  const miles = Math.floor(año / 1000);
  const resto = año % 1000;
  return `dos mil ${convertirNumeroAPalabras(resto)}`;
}

const ImprimirContratoVivienda = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [estaFirmado, setEstaFirmado] = useState(false);
  const [contratopdf, setContratoPDF] = useState(null);
  const [estaFirmadoArrendatario, setEstaFirmadoArrendatario] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [estaInconforme, setEstaInconforme] = useState(false);
  const [inconformidadTexto, setInconformidadTexto] = useState("");
  const [cargando, setCargando] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // Obtener CSRF token
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  // Función para cargar el contrato desde la API
  useEffect(() => {
    const fetchContrato = async () => {
      try {
        setCargando(true);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Contrato_Local_viviendaViewSet/${id}/`);
        const data = await response.json();
        console.log("📄 Contrato cargado:", data);
        setContrato(data);
        setEstaFirmado(data.estaFirmado);
        setEstaFirmadoArrendatario(data.estaFirmadoArrendatario);
      } catch (error) {
        console.error('Error al cargar el contrato:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchContrato();
  }, [id]);

  // Función para manejar la firma del contrato (Administrador)
  const handleAceptarContrato = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/contratos/${id}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ estaFirmado: true }),
        credentials: 'include',
      });

      if (response.ok) {
        alert('✅ El contrato ha sido aceptado por el administrador.');
        window.location.reload();
      } else {
        console.error('Error al aceptar el contrato.');
        alert('❌ Error al aceptar el contrato.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  // Función para manejar la firma del contrato (Arrendatario)
  const handleAceptarContratoArrendatario = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/contratos/${id}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ estaFirmadoArrendatario: true }),
        credentials: 'include',
      });

      if (response.ok) {
        alert('✅ El contrato ha sido aceptado por el arrendatario.');
        window.location.reload();
      } else {
        console.error('Error al aceptar el contrato.');
        alert('❌ Error al aceptar el contrato.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  // Función para editar el contrato
  const handleEditarContrato = () => {
    navigate(`/editarcontratovivienda/${id}`);
  };

  // Subir PDF del contrato firmado
  const handleUploadPDF = async () => {
    if (!contratopdf) {
      alert("❌ No se ha seleccionado un archivo PDF.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('pdf_firmado', contratopdf);
    formDataToSend.append('contratoId', id);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploadContrato-pdf/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        body: formDataToSend,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ PDF subido exitosamente");
        window.location.reload();
      } else {
        console.error("Error al subir el PDF:", data);
        alert(`❌ Error al subir el PDF: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error al subir el PDF:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setContratoPDF(file);
    } else {
      alert("❌ Por favor, selecciona un archivo PDF.");
      setContratoPDF(null);
    }
  };

  // Manejar inconformidades
  const handleChangeTexto = (e) => {
    const texto = e.target.value;
    setInconformidadTexto(texto);
    if (texto.trim()) {
      setEstaInconforme(true);
    } else {
      setEstaInconforme(false);
    }
  };

  const handleChangeCheckbox = () => {
    if (!estaInconforme) {
      setEstaInconforme(true);
    } else {
      setEstaInconforme(false);
      setInconformidadTexto("");
    }
  };

  const handleActualizarContrato = async () => {
    if (!estaInconforme || !inconformidadTexto.trim()) return;

    const datosActualizados = {
      reporteinconformidad: id,
      estaInconforme: true,
      Inconformidad: inconformidadTexto,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/reporte-inconformidad/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(datosActualizados),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Inconformidad enviada correctamente");
        window.location.reload();
      } else {
        console.error("Error al enviar la inconformidad", data);
        alert(`❌ Error al enviar la inconformidad: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error al enviar la inconformidad", error);
    }
  };

  const destacarTexto = (texto) => {
    if (!texto) return '';

    let t = texto;

    // ============================================================
    // 1. 🔥 TÍTULOS DE CLÁUSULAS (explícitos, sin duplicar)
    // ============================================================
    const titulosClausulas = [
      'CLAUSULA PRIMERA. Objeto Y sitio',
      'CLAUSULA SEGUNDA. Destinación',
      'CLAUSULA TERCERA. Valor, oportunidad y forma',
      'CLAUSULA CUARTA. Penalidad por Retraso en el Pago del Arriendo',
      'CLÁUSULA QUINTA. Duración',
      'CLÁUSULA SEXTA. Prórroga',
      'CLAUSULA SEPTIMA. Obligaciones de las partes',
      'CLÁUSULA OCTAVA. Terminación Unilateral Del Contrato',
      'CLÁUSULA NOVENA. Preaviso',
      'CLÁUSULA DECIMA. Penal',
      'CLÁUSULA UNDECIMA. Cesión De Cartera',
      'CLÁUSULA DUODECIMA. Gastos',
      'CLÁUSULA DECIMA TERCERA. Servicios Públicos',
      'CLÁUSULA DECIMA CUARTA. Reparaciones indispensables no locativas',
      'CLÁUSULA DECIMA QUINTA. Subarriendo y cesión',
      'CLÁUSULA DECIMA SEXTA. Notificaciones',
      'CLÁUSULA DECIMA SEPTIMA. Hábeas Data y Autorización de Reporte',
      'CLÁUSULA DECIMA OCTAVA. Autorización para Registro y Calificación en Plataforma Camila360',
      'CLÁUSULA DECIMA NOVENA. Cláusulas adicionales'
    ];

    titulosClausulas.forEach(titulo => {
      // Escapar caracteres especiales para regex
      const tituloEscapado = titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      t = t.replace(
        new RegExp(`(${tituloEscapado})`, 'gi'),
        '<strong>$1</strong>'
      );
    });

    // ============================================================
    // 2. PALABRAS CLAVE (sin cláusulas para evitar duplicación)
    // ============================================================
    const palabras = [
      'LA ARRENDATARIA', 'EL ARRENDATARIO', 'LA ARRENDADORA', 'EL ARRENDADOR',
      'Notas: 1).', 'DECIMA OCTAVA:', 'DECIMA SEPTIMA:', 'DECIMA SEXTA:',
      'DECIMA QUINTA:', 'DECIMA CUARTA:', 'DECIMA TERCERA:', 'DECIMA SEGUNDA:',
      'DECIMA PRIMERA:', 'DECIMA:', 'NOVENA:', 'OCTAVA:', 'SEPTIMA:',
      'SEXTA:', 'QUINTA:', 'CUARTA:', 'TERCERA:', 'SEGUNDA:', 'PRIMERA:',
      'Parágrafo 1)', 'Parágrafo 2)', 'Parágrafo 3)', '- 1.', '- 2.', '- 3.', '- 4.'
    ];

    palabras.forEach(p => {
      const pEscapado = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      t = t.replace(
        new RegExp(`(${pEscapado})`, 'gi'),
        '<strong>$1</strong>'
      );
    });

    // ============================================================
    // 3. PARÁGRAFOS (con y sin tilde)
    // ============================================================
    const paragrafos = ['UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ',
      'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO', 'SEPTIMO', 'OCTAVO', 'NOVENO', 'DECIMO'];

    paragrafos.forEach(n => {
      ['PARAGRAFO', 'PARÁGRAFO'].forEach(palabra => {
        const pEscapado = palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const nEscapado = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        t = t
          .replace(new RegExp(`(${pEscapado} ${nEscapado}:)`, 'gi'), '<strong>$1</strong>')
          .replace(new RegExp(`(${pEscapado} ${nEscapado}\\.)`, 'gi'), '<strong>$1</strong>')
          .replace(new RegExp(`(${pEscapado} ${nEscapado} –)`, 'gi'), '<strong>$1</strong>');
      });
    });

    // ============================================================
    // 4. PARÁGRAFO PRIMERO – Prohibiciones:
    // ============================================================
    ['PARAGRAFO PRIMERO – Prohibiciones:', 'PARÁGRAFO PRIMERO – Prohibiciones:'].forEach(p => {
      const pEscapado = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      t = t.replace(new RegExp(`(${pEscapado})`, 'gi'), '<strong>$1</strong>');
    });

    // ============================================================
    // 5. a) b) c)
    // ============================================================
    t = t
      .replace(/(?<!\w)(a)\)(?!\w)/gi, '<strong>a)</strong>')
      .replace(/(?<!\w)(b)\)(?!\w)/gi, '<strong>b)</strong>')
      .replace(/(?<!\w)(c)\)(?!\w)/gi, '<strong>c)</strong>')
      .replace(/(?<!\w)(a)\)\.(?!\w)/gi, '<strong>a).</strong>')
      .replace(/(?<!\w)(b)\)\.(?!\w)/gi, '<strong>b).</strong>')
      .replace(/(?<!\w)(c)\)\.(?!\w)/gi, '<strong>c).</strong>');

    // ============================================================
    // 6. Nombres y direcciones
    // ============================================================
    if (contrato) {
      const nombres = [
        contrato.arrendador_nombre_completo,
        contrato.arrendatario_nombre_completo,
        contrato.coarrendatario_nombre_completo,
        contrato.inmueble_direccion,
        `Barrio ${contrato.inmueble_barrio}`,
      ].filter(Boolean);

      nombres.forEach(nombre => {
        if (nombre?.trim()) {
          const nombreEscapado = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          t = t.replace(
            new RegExp(`(${nombreEscapado})`, 'gi'),
            '<strong>$1</strong>'
          );
        }
      });
    }

    return t;
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando contrato...</p>
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-xl">❌ No se encontró el contrato</p>
        <button
          onClick={() => navigate('/contratos')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Volver a contratos
        </button>
      </div>
    );
  }

  // Calcular si el usuario puede ver el contrato
  const puedeVerContrato = user?.groups?.includes('administrador') || estaFirmado;

  return (
    <div className="contrato">
      {puedeVerContrato && (
        <>
          <header className="header">
            <img src="/images/logoLaverde.png" alt="Logo Laverde" className="logo" style={{ maxHeight: '100px' }} />
          </header>

          <main>
            {/* Título */}
            <div className="text-center mb-4">
              <p className="m-0 p-0 leading-none">
                <span className="text-xl font-bold uppercase tracking-wide">
                  CONTRATO DE ARRENDAMIENTO DE {contrato.inmueble_tipo?.toUpperCase() || 'VIVIENDA'} PARA VIVIENDA URBANA
                </span>
                <br />
                <span className="text-sm font-normal text-gray-600">
                  Aplicado a la Ley 820 de 2003
                </span>
              </p>
            </div>


            {/* ============================================================
                DATOS DEL ARRENDADOR
                ============================================================ */}
            <div className="column-container">
              <div className="column">
                <p>
                  <b>{contrato.arrendador_nombre_completo?.toUpperCase() || 'N/A'}</b>
                  <br />C.C. {formatoNumeroConSeparadores(contrato.arrendador_doc_identificacion)} de {contrato.arrendador_lugar_exp_cedula || 'Villavicencio'}
                  <br />{contrato.arrendador_direccion || ''} Barrio {contrato.arrendador_barrio || ''}
                  <br />Cel. {contrato.arrendador_celular || ''}{contrato.arrendador_celular_dos ? ` - ${contrato.arrendador_celular_dos}` : ''}
                  <br /><b>{contrato.arrendador_genero === 'F' ? 'ARRENDADORA' : 'ARRENDADOR'}</b>
                </p>
              </div>

              {/* ============================================================
                  DATOS DEL ARRENDATARIO
                  ============================================================ */}
              <div className="column">
                <p>
                  <b>{contrato.arrendatario_nombre_completo?.toUpperCase() || 'N/A'}</b>
                  <br />C.C. {formatoNumeroConSeparadores(contrato.arrendatario_doc_identificacion)} de {contrato.arrendatario_lugar_exp_cedula || 'Villavicencio'}
                  <br />{contrato.inmueble_direccion || ''} Barrio {contrato.inmueble_barrio || ''}
                  <br />Cel. {contrato.arrendatario_celular || ''}
                  <br /><b>{contrato.arrendatario_genero === 'F' ? 'ARRENDATARIA' : 'ARRENDATARIO'}</b>
                </p>
              </div>
            </div>

            {/* ============================================================
                DATOS DEL COARRENDATARIO (si existe)
                ============================================================ */}
            {contrato.coarrendatario_nombre_completo && (
              <p>
                <b>{contrato.coarrendatario_nombre_completo?.toUpperCase() || 'N/A'}</b>
                <br />C.C. {formatoNumeroConSeparadores(contrato.coarrendatario_doc_identificacion)} de {contrato.coarrendatario_lugar_exp_cedula || 'Villavicencio'}
                <br />{contrato.coarrendatario_direccion || ''} Barrio {contrato.coarrendatario_barrio || ''}
                <br />Cel. {contrato.coarrendatario_celular || ''}
                <br /><b>{contrato.coarrendatario_genero === 'F' ? 'COARRENDATARIA' : 'COARRENDATARIO'}</b>
              </p>
            )}<br></br>

            {/* ============================================================
                DATOS DEL CONTRATO
                ============================================================ */}
            <p>
              <strong>Canon de arrendamiento:</strong> {convertirNumeroAPalabras(contrato.canonArrendamiento)} pesos M/cte. (${formatoNumeroConSeparadores(contrato.canonArrendamiento)})
              <br /><strong>Duración del Contrato:</strong> ({calcularDuracionEnMeses(contrato.fechainicio, contrato.fechafin)}) Meses
              <br /><strong>Fecha de iniciación:</strong> {formatearFecha(contrato.fechainicio)}
              <br /><strong>Fecha de terminación:</strong> {formatearFecha(contrato.fechafin)}
            </p>
            <br></br>
            {/* ============================================================
                INTRODUCCIÓN DEL CONTRATO
                ============================================================ */}
            <p>
              En Villavicencio-Meta, el {formatearFechaConPalabras(contrato.fecha) || 'fecha no disponible'}, se reunieron los señores: <b>{contrato.arrendador_nombre_completo?.toUpperCase()}</b>
              identificad{contrato.arrendador_genero === 'F' ? 'a' : 'o'} con cédula de ciudadanía Nro. {formatoNumeroConSeparadores(contrato.arrendador_doc_identificacion)} expedida en {contrato.arrendador_lugar_exp_cedula || 'Villavicencio'} quien actúa en calidad de {contrato.arrendador_tipo_usuario === 'administrador' ? 'Administradora' : 'Propietario'} y que para efectos del presente contrato se denominará <b>{contrato.arrendador_genero === 'F' ? 'LA ARRENDADORA' : 'EL ARRENDADOR'}</b>,
              por otra parte, <b>{contrato.arrendatario_nombre_completo?.toUpperCase()}</b>, identificad{contrato.arrendatario_genero === 'F' ? 'a' : 'o'} con cédula de ciudadanía Nro. {formatoNumeroConSeparadores(contrato.arrendatario_doc_identificacion)} expedida en {contrato.arrendatario_lugar_exp_cedula || 'Villavicencio'}, quien en adelante y para efectos del presente contrato se denominará <b>{contrato.arrendatario_genero === 'F' ? 'LA ARRENDATARIA' : 'EL ARRENDATARIO'}</b>, manifestaron que han decidido celebrar el presente documento, con el fin de concretar el siguiente Contrato de Arrendamiento de Vivienda Urbana de común acuerdo aceptando las siguientes cláusulas:
            </p>

            {/* ============================================================
                CLÁUSULAS
                ============================================================ */}
            {contrato.clausulas_copia && contrato.clausulas_copia.length > 0 ? (
              contrato.clausulas_copia.map((clausula, index) => (
                <div key={index}>
                  <p dangerouslySetInnerHTML={{ __html: destacarTexto(clausula.texto) }}></p>
                </div>
              ))
            ) : (
              <p>No hay cláusulas disponibles.</p>
            )}

            {/* ============================================================
                CIERRE DEL CONTRATO
                ============================================================ */}
            <br></br>
            <p>
              En constancia de haber leído, comprendido y aceptado las condiciones del presente contrato las partes firman en la ciudad de {contrato.inmueble_ciudad || 'Villavicencio'} a los {formatearFechaCompleta(contrato.fecha)}.
            </p>

            <br /><br />

            {/* ============================================================
                FIRMAS
                ============================================================ */}
            <div className="column-container">
              <div className="column">
                <p>
                  <b>{contrato.arrendador_nombre_completo?.toUpperCase() || 'N/A'}</b>
                  <br />C.C. {formatoNumeroConSeparadores(contrato.arrendador_doc_identificacion)} de {contrato.arrendador_lugar_exp_cedula || 'Villavicencio'}
                  <br />{contrato.arrendador_direccion || ''} Barrio {contrato.arrendador_barrio || ''}
                  <br />Cel. {contrato.arrendador_celular || ''}{contrato.arrendador_celular_dos ? ` - ${contrato.arrendador_celular_dos}` : ''}
                  <br /><b>{contrato.arrendador_genero === 'F' ? 'ARRENDADORA' : 'ARRENDADOR'}</b>
                  <br /><img src="/images/Campohuella.png" alt="Huella arrendador" />
                </p>
              </div>

              <div className="column">
                <p>
                  <b>{contrato.arrendatario_nombre_completo?.toUpperCase() || 'N/A'}</b>
                  <br />C.C. {formatoNumeroConSeparadores(contrato.arrendatario_doc_identificacion)} de {contrato.arrendatario_lugar_exp_cedula || 'Villavicencio'}
                  <br />{contrato.inmueble_direccion || ''} Barrio {contrato.inmueble_barrio || ''}
                  <br />Cel. {contrato.arrendatario_celular || ''}
                  <br /><b>{contrato.arrendatario_genero === 'F' ? 'ARRENDATARIA' : 'ARRENDATARIO'}</b>
                  <br /><img src="/images/Campohuella.png" alt="Huella arrendatario" />
                </p>
              </div>
            </div>

            {/* Firma del coarrendatario si existe */}
            {contrato.coarrendatario_nombre_completo && (
              <p>
                <b>{contrato.coarrendatario_nombre_completo?.toUpperCase() || 'N/A'}</b>
                <br />C.C. {formatoNumeroConSeparadores(contrato.coarrendatario_doc_identificacion)} de {contrato.coarrendatario_lugar_exp_cedula || 'Villavicencio'}
                <br />{contrato.coarrendatario_direccion || ''} Barrio {contrato.coarrendatario_barrio || ''}
                <br />Cel. {contrato.coarrendatario_celular || ''}
                <br /><b>{contrato.coarrendatario_genero === 'F' ? 'COARRENDATARIA' : 'COARRENDATARIO'}</b>
                <br /><img src="/images/Campohuella.png" alt="Huella coarrendatario" />
              </p>
            )}
          </main>

          {/* ============================================================
              BOTONES DE ACCIÓN
              ============================================================ */}
          <div className="acciones-contrato">
            {/* ADMINISTRADOR */}
            {user?.groups?.includes('administrador') && (
              <>
                {!estaFirmado ? (
                  // Contrato NO firmado por administrador
                  <>
                    <button onClick={handleEditarContrato} className="btn-editar">
                      ✏️ Editar Contrato
                    </button>
                    <button onClick={handleAceptarContrato} className="btn-aceptar">
                      ✅ Aceptar Contrato
                    </button>
                  </>
                ) : (
                  // Contrato YA firmado por administrador
                  <>
                    {contrato.pdf_firmado ? (
                      <>
                        <button
                          className="view-pdf-button"
                          onClick={() => window.open(contrato.pdf_firmado, "_blank")}
                        >
                          📄 Ver PDF Firmado
                        </button>
                        {/* Cambiar PDF solo admin */}
                        <input
                          className="upload-pdf"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                        <button
                          className="change-pdf-button"
                          onClick={handleUploadPDF}
                        >
                          🔄 Cambiar PDF
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          className="upload-pdf"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                        <button className="upload-pdf-button" onClick={handleUploadPDF}>
                          📤 Subir PDF Firmado
                        </button>
                      </>
                    )}
                    <button className="print-button" onClick={() => window.print()}>
                      🖨️ Imprimir Contrato
                    </button>
                  </>
                )}
              </>
            )}

            {/* ARRENDATARIO */}
            {user?.groups?.includes('arrendatario') && (
              <>
                {!estaFirmadoArrendatario ? (
                  // Contrato NO firmado por arrendatario
                  <>
                    <button onClick={handleAceptarContratoArrendatario} className="btn-aceptar">
                      ✅ Aceptar Contrato
                    </button>

                    <div className="mt-4">
                      <label>
                        <input
                          type="checkbox"
                          checked={estaInconforme}
                          onChange={handleChangeCheckbox}
                          className="mr-2"
                        />
                        Manifestar inconformidad
                      </label>
                    </div>

                    <div className="mt-2">
                      <textarea
                        placeholder="Describe tu inconformidad..."
                        value={inconformidadTexto}
                        onChange={handleChangeTexto}
                        rows={4}
                        cols={50}
                        disabled={!estaInconforme}
                        className="border rounded p-2 w-full max-w-md"
                      />
                    </div>

                    <button
                      onClick={handleActualizarContrato}
                      disabled={!estaInconforme || !inconformidadTexto.trim()}
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                    >
                      📤 Enviar Inconformidad
                    </button>

                    {contrato.pdf_inventario ? (
                      <button
                        className="view-pdf-button mt-2"
                        onClick={() => window.open(contrato.pdf_inventario, "_blank")}
                      >
                        📄 Ver Inventario PDF
                      </button>
                    ) : (
                      <p className="text-gray-500 mt-2">📎 El inventario no se ha subido</p>
                    )}
                  </>
                ) : (
                  // Contrato YA firmado por arrendatario
                  <>
                    {contrato.pdf_firmado ? (
                      <button
                        className="view-pdf-button"
                        onClick={() => window.open(contrato.pdf_firmado, "_blank")}
                      >
                        📄 Ver PDF Firmado
                      </button>
                    ) : (
                      <p className="text-gray-500">📎 El PDF firmado aún no está disponible</p>
                    )}

                    {contrato.pdf_inventario ? (
                      <button
                        className="view-pdf-button"
                        onClick={() => window.open(contrato.pdf_inventario, "_blank")}
                      >
                        📄 Ver Inventario PDF
                      </button>
                    ) : (
                      <p className="text-gray-500">📎 El inventario no se ha subido</p>
                    )}

                    <button className="print-button" onClick={() => window.print()}>
                      🖨️ Imprimir Contrato
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Usuario no autorizado */}
      {!puedeVerContrato && (
        <div className="text-center py-20">
          <p className="text-red-600 text-xl">🔒 No tienes permisos para ver este contrato</p>
          <p className="text-gray-600 mt-2">El contrato debe ser aceptado por el administrador para ser visible.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
};

export default ImprimirContratoVivienda;