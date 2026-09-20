import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCsrfToken } from '../../appprincipal/csrf';
import '../ImprimirContrato.css'; // Importar el CSS de impresión

function calcularDiferenciaMeses(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  const años = fin.getFullYear() - inicio.getFullYear();
  const meses = fin.getMonth() - inicio.getMonth();

  return años * 12 + meses; // Total de meses
}

function formatearFechaConPalabras(fechaString) {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const [year, month, day] = fechaString.split('-');  // Asumiendo que el formato de fecha es 'YYYY-MM-DD'
  const dia = parseInt(day);  // Asegúrate de convertir el día a número
  const mes = meses[parseInt(month) - 1];  // Convierte el mes a índice
  const año = parseInt(year);

  const diaEnPalabras = convertirNumeroAPalabras(dia);
  const añoEnPalabras = convertirAñoAPalabras(año);

  return `el día ${diaEnPalabras} (${dia}) de ${mes} de ${añoEnPalabras} (${año})`;
}
function formatearFecha(fechaString) {
  const [year, month, day] = fechaString.split('-');  // Asumiendo que el formato de fecha es 'YYYY-MM-DD'
  const dia = parseInt(day);  // Asegúrate de convertir el día a número
  const mes = parseInt(month);  // Convierte el mes a índice
  const año = parseInt(year);
  return ` día (${dia}) mes (${mes}) año (${año})`;
}
// Función para convertir números en palabras
function convertirNumeroAPalabras(numero) {
  if (numero === 0) return 'Cero';

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
  return numero.toLocaleString('es-ES'); // Formatea el número con separadores de miles
}

// Función para convertir el año a palabras
function convertirAñoAPalabras(año) {
  const miles = Math.floor(año / 1000);
  const resto = año % 1000;

  return `dos mil ${convertirNumeroAPalabras(resto)}`;
}
const OtroSiViviendaImprimir = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [groups, setGoups] = useState(null);
  const [contrato, setContrato] = useState(null);
  const [contratoOtrosi, setContratoOtrosi] = useState(null);
  const [estaFirmado, setEstaFirmado] = useState(false);
  const [contratopdf, setContratoPDF] = useState(null);





  // Función para cargar el contrato desde la API
  useEffect(() => {
    const fetchContrato = async () => {
      const contratoId = Number(id);
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Contrato_Local_viviendaViewSet/${id}/`);
        const data = await response.json();
        console.log("la carga", data);
        setContrato(data);
        const responsedos = await fetch(`${import.meta.env.VITE_BASE_URL}/api/otroSi/`);
        const datados = await responsedos.json();
        const filteredContratoOtrosi = datados.filter(
          (otroSi) =>
            otroSi.contrato === contratoId &&
            (otroSi.aceptaOtroSi === false ||
              otroSi.aceptaOtroSiArrendatario === false)
        );
        setContratoOtrosi(filteredContratoOtrosi);
        console.log("Contratos otroSi:", filteredContratoOtrosi);
      } catch (error) {
        console.error('Error al cargar el contrato:', error);
      }
      try {

      } catch (error) {
        console.error('Error al cargar el contratoOtrosi:', error);
      }

    };
    fetchContrato();
  }, [id]);
  // Función para manejar la firma del contrato

  const handleAceptarContrato = async () => {
    const contratoId = contratoOtrosi[0]?.id
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/otroSi/${contratoId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aceptaOtroSi: true }),
      });

      if (response.ok) {
        alert('El contrato OtroSi ha sido aceptado.');
        window.location.reload();

      } else {
        console.error('Error al aceptar el contrato.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  // Función para editar el contrato
  const handleEditarContrato = (id) => {
    navigate(`/OtroSiVivienda/${id}`);
  };
  // Verifica que el contrato y la fecha existen antes de formatear
  const fechaFirmaEnPalabras = contrato && contrato.fecha ? formatearFechaConPalabras(contrato.fecha) : '';
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);


  const handleUploadPDF = async (contratoId) => {
    // Abre un input para subir un archivo o redirige a un formulario de subida
    console.log("Subiendo PDF...");
    if (!contratopdf) {
      alert("No se ha seleccionado un archivo PDF.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('pdf_firmado', contratopdf);  // Archivo PDF
    formDataToSend.append('contratoId', contratoId);  // ID del contrato

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploadContratoOtrosi-pdf/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken, // Asegúrate de incluir el token CSRF si es necesario
        },
        body: formDataToSend,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        alert("PDF OtroSi subido exitosamente");
        navigate(`/OtroSiViviendaImprimir/${id}`);
        window.location.reload();

      } else {
        console.error("Error al subir el PDF:", data);
        alert(`Error al subir el PDF: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al subir el PDF:", error);
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Obtener el archivo seleccionado
    if (file && file.type === "application/pdf") {
      // Guardar el archivo PDF en el estado
      setContratoPDF(file);
    } else {
      alert("Por favor, selecciona un archivo PDF.");
      // Limpiar el archivo en caso de que el usuario seleccione uno no válido
      setContratoPDF(null);
    }
  };



  const user = JSON.parse(localStorage.getItem("user"));


  if (!contrato || !contratoOtrosi) {
    return <div>Cargando...</div>;
  }

  return (

    <div className="contrato">
      {(() => {
        // Calcular la cantidad de meses entre las fechas
        const fechainicio = contratoOtrosi[0]?.fechainicio;
        const fechafin = contratoOtrosi[0]?.fechafin;
        const meses = fechainicio && fechafin ? calcularDiferenciaMeses(fechainicio, fechafin) : 0;
        const mesesFormateados = meses < 10 ? `0${meses}` : meses;
        return (
          (user.groups[0] === 'administrador' || estaFirmado) && (<>
            <header className="header">
              <img src="/images/logoLaverde.png" alt="Logo Laverde" className="logo" style={{ maxHeight: '100px' }} />
            </header>

            <main>
              <h4>OTROSI NRO {(contrato.numOtrosi + 1) < 10 ? `0${contrato.numOtrosi + 1}` : contrato.numOtrosi + 1}</h4>

              <h4>
                {contrato.tipoContrato === 'vivienda' ? (
                  `AL CONTRATO DE ARRENDAMIENTO DE ${contrato.inmueble.tipoInmueble.toUpperCase()} PARA VIVIENDA`
                ) : contrato.tipoContrato === 'local comercial' ? (
                  'AL CONTRATO DE ARRENDAMIENTO DE LOCAL COMERCIAL'
                ) : contrato.tipoContrato === 'localvivienda' ? (
                  'AL CONTRATO DE ARRENDAMIENTO DE LOCAL/VIVIENDA'
                ) : null}
              </h4>
              <p>En Villavicencio, Meta, a los {formatearFechaConPalabras(contratoOtrosi[0].fechainicio)}, las partes que suscriben:</p>
              <p>
                1. <b>{contrato.userAdministrador.user.first_name.toUpperCase()} {contrato.userAdministrador.user.last_name.toUpperCase()}</b> mayor de edad,
                identificada con C.C. {formatoNumeroConSeparadores(contrato.userAdministrador.doc_identificacion)} Expedida en {contrato.userAdministrador.lugarExpCedula} quien actúa en calidad
                de <b>{contrato.userAdministrador.genero === 'M' ? 'ARRENDADOR' : 'ARRENDADORA'}</b>, con domicilio en la {contrato.userAdministrador.direccion} Barrio {contrato.userAdministrador.barrio} y correo electrónico {contrato.userAdministrador.user.email}.
              </p>
              <p>
                2. <b>{contrato.userArrendatario.user.first_name.toUpperCase()} {contrato.userArrendatario.user.last_name.toUpperCase()}</b>,
                identificado con C.C. {formatoNumeroConSeparadores(contrato.userArrendatario.doc_identificacion)} Expedida en {contrato.userArrendatario.lugarExpCedula},
                quien actúa como <b>{contrato.userArrendatario.genero === 'M' ? 'ARRENDATARIO' : 'ARRENDATARIA'}</b>, domiciliad{contrato.userArrendatario.genero === 'M' ? 'o' : 'a'} en
                la {contrato.inmueble.direccion} Barrio {contrato.inmueble.barrio}, correo electrónico  {contrato.userArrendatario.user.email}.
              </p>
              <p>3. <b>{contrato.coarrendatario.first_name.toUpperCase()} {contrato.coarrendatario.last_name.toUpperCase()}</b>, identificada con
                C.C. {formatoNumeroConSeparadores(contrato.coarrendatario.doc_identificacion)} Expedida en {contrato.coarrendatario.lugarExpCedula}, quien actúa como <b>{contrato.coarrendatario.genero === 'M' ? 'COARRENDATARIO' : 'COARRENDATARIA'} </b>
                domiciliad{contrato.coarrendatario.genero === 'M' ? 'o' : 'a'} en la {contrato.coarrendatario.direccion} Barrio {contrato.coarrendatario.barrio}, correo electrónico {contrato.coarrendatario.email}.
              </p>
              <p><b>ACUERDAN:</b></p>

              <p><b>PRIMERO: Renovación del Contrato,</b> Las partes acuerdan renovar el Contrato de
                Arrendamiento de {contrato.inmueble.tipoInmueble} para Vivienda  suscrito el {fechaFirmaEnPalabras || 'fecha no disponible'},
                por un período adicional de ({mesesFormateados}) meses, contados a partir del día {formatearFechaConPalabras(contratoOtrosi[0].fechainicio)} hasta el día {formatearFechaConPalabras(contratoOtrosi[0].fechafin)}.
              </p>
              <p><b>SEGUNDO: Canon de Arrendamiento,</b> El canon mensual de arrendamiento será de {convertirNumeroAPalabras(contratoOtrosi[0].canonmensualOtrosi)} pesos M/cte. (${formatoNumeroConSeparadores(contratoOtrosi[0].canonmensualOtrosi)}), pagaderos en las mismas condiciones
                estipuladas en la Cláusula Primera del contrato original.
              </p>
              <p><b>TERCERO: Obligaciones y Condiciones,</b> Se mantienen las mismas obligaciones,
                condiciones y cláusulas pactadas en el contrato inicial, salvo las modificaciones
                expresamente contempladas en el presente OTROSI.
              </p>
              <p><b>CUARTO: Estado del Inmueble,</b> <b>{contrato.userArrendatario.genero === 'M' ? 'EL ARRENDATARIO' : 'LA ARRENDATARIA'}</b> y <b>{contrato.coarrendatario.genero === 'M' ? 'EL COARRENDATARIO' : 'LA COARRENDATARIA'} </b> declaran
                haber recibido el inmueble en buen estado, conforme al inventario inicial firmado y anexado al contrato original.</p>
              <p><b>QUINTO: Notificaciones,</b> Las notificaciones continuarán realizándose en las direcciones físicas y correos electrónicos suministrados por las partes en el contrato original. </p>
              <p><b>SEXTO: Firma Electrónica,</b> Las partes acuerdan que el presente OTROSI puede ser firmado mediante el uso de firma electrónica, en cumplimiento de la Ley 527 de 1999 y
                normas aplicables en Colombia. Las firmas electrónicas tendrán la misma validez y efectos jurídicos que las firmas manuscritas. Las partes aceptan que este mecanismo garantiza la
                autenticidad, integridad y no repudio del presente documento. </p>
              <p><b>SÉPTIMO: Ratificación del Contrato Original,</b> Las partes ratifican su aceptación y continuidad de  todas las cláusulas y condiciones estipuladas en el contrato de arrendamiento inicial,
                excepto las  modificadas expresamente en el presente documento.
              </p>
              <p>En constancia, las partes firman el presente OTROSI en dos (2) ejemplares del mismo tenor y contenido.</p>

              <br /><br />
              <div className="column-container">
                <div className="column">
                  <p>
                    <b>{contrato.userAdministrador.user.first_name.toUpperCase()} {contrato.userAdministrador.user.last_name.toUpperCase()}</b>
                    <br />C.C. {formatoNumeroConSeparadores(contrato.userAdministrador.doc_identificacion)} de {contrato.userAdministrador.lugarExpCedula}
                    <br />{contrato.userAdministrador.direccion} Barrio {contrato.userAdministrador.barrio}
                    <br />Cel. {contrato.userAdministrador.celular} - {contrato.userAdministrador.celularDos}
                    <br /><b>{contrato.userAdministrador.genero === 'M' ? 'ARRENDADOR' : 'ARRENDADORA'}</b>


                  </p>
                </div>

                <div className="column">
                  <p>
                    <b>{contrato.userArrendatario.user.first_name.toUpperCase()} {contrato.userArrendatario.user.last_name.toUpperCase()}</b>
                    <br />C.C. {formatoNumeroConSeparadores(contrato.userArrendatario.doc_identificacion)} de {contrato.userArrendatario.lugarExpCedula}
                    <br />{contrato.inmueble.direccion} Barrio {contrato.inmueble.barrio}
                    <br />Cel. {contrato.userArrendatario.celular}
                    <br /><b>{contrato.userArrendatario.genero === 'M' ? 'ARRENDATARIO' : 'ARRENDATARIA'}</b>

                  </p>
                </div>
              </div>
              <p>
                <b>{contrato.coarrendatario.first_name.toUpperCase()} {contrato.coarrendatario.last_name.toUpperCase()}</b>
                <br />C.C. {formatoNumeroConSeparadores(contrato.coarrendatario.doc_identificacion)} de {contrato.coarrendatario.lugarExpCedula}
                <br />{contrato.coarrendatario.direccion} Barrio {contrato.coarrendatario.barrio}
                <br />Cel. {contrato.coarrendatario.celular}
                <br /><b>{contrato.coarrendatario.genero === 'M' ? 'ARRENDATARIO' : 'ARRENDATARIA'} - {contrato.coarrendatario.genero === 'M' ? 'COARRENDATARIO' : 'COARRENDATARIA'}</b>

              </p>

            </main>

            {/* Botones condicionales */}
            <div className="acciones-contrato">
              {user.groups[0] === 'administrador' && (<>
                {!contratoOtrosi[0].aceptaOtroSi && (
                  <>
                    <button onClick={handleAceptarContrato} className="btn-aceptar">
                      Aceptar Contrato OTROSI
                    </button>
                    <button onClick={() => handleEditarContrato(contrato.id)} className="btn-editar">
                      Editar Contrato
                    </button>
                  </>
                )}

                {(contratoOtrosi[0].aceptaOtroSi && contratoOtrosi[0].aceptaOtroSiArrendatario) ? (
                  <>
                    {contratoOtrosi[0].pdf_firmado === null ? (
                      <>
                        <input
                          className="upload-pdf"
                          type="file"
                          name="inventario"
                          accept=".pdf"
                          onChange={handleFileChange} // Esta función manejará el archivo seleccionado
                        />
                        <button className="upload-pdf-button" onClick={() => handleUploadPDF(contratoOtrosi[0].id)}>
                          Subir PDF
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="view-pdf-button"
                          onClick={() => window.open(contrato.pdf_firmado, "_blank")}
                        >
                          Ver PDF
                        </button>

                        {/* Botón para cambiar el PDF, visible solo si el usuario es administrador */}
                        {user.groups[0] === 'administrador' && (
                          <>
                            <input
                              className="upload-pdf"
                              type="file"
                              name="cambiarPDF"
                              accept=".pdf"
                              onChange={handleFileChange} // Reutiliza la función para manejar el cambio de archivo
                            />
                            <button
                              className="change-pdf-button"
                              onClick={() => handleUploadPDF(contratoOtrosi[0].id)}
                            >
                              Cambiar PDF
                            </button>
                          </>
                        )}
                      </>
                    )}
                    <button className="print-button" onClick={() => window.print()}>
                      Imprimir Contrato
                    </button>
                  </>
                ) : (
                  <p>El contrato aún no ha sido aceptado por {contrato.userArrendatario.genero === 'M' ? 'EL ARRENDATARIO' : 'LA ARRENDATARIA'}.</p>
                )}

              </>
              )}
            </div>

          </>
          )
        );
      })()}
    </div >

  );
};

export default OtroSiViviendaImprimir;