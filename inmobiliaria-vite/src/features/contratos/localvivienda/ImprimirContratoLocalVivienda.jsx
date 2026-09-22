import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCsrfToken } from '../../../utils/csrf';
import '../ImprimirContrato.css'; // Importar el CSS de impresión
import { API_URL } from '../../../config';

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

// Función para convertir números en palabras
function convertirNumeroAPalabras(numero) {
  if (numero === 0) return 'cero';

  const unidades = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  function convertirCentenas(numero) {
    if (numero === 100) return 'cien';
    const centena = Math.floor(numero / 100);
    const resto = numero % 100;

    return `${centenas[centena]} ${convertirDecenas(resto)}`.trim();
  }

  function convertirDecenas(numero) {
    if (numero < 10) return unidades[numero];
    if (numero >= 10 && numero < 20) return especiales[numero - 10];
    const decena = Math.floor(numero / 10);
    const unidad = numero % 10;

    return unidad === 0 ? decenas[decena] : `${decenas[decena]} y ${unidades[unidad]}`;
  }

  function convertirMiles(numero) {
    const miles = Math.floor(numero / 1000);
    const resto = numero % 1000;

    const milesPalabra = miles === 1 ? 'mil' : `${convertirCentenas(miles)} mil`;
    return `${milesPalabra} ${convertirCentenas(resto)}`.trim();
  }

  function convertirMillones(numero) {
    const millones = Math.floor(numero / 1000000);
    const resto = numero % 1000000;

    const millonesPalabra = millones === 1 ? 'un millón' : `${convertirCentenas(millones)} millones`;
    return `${millonesPalabra} ${convertirMiles(resto)}`.trim();
  }

  if (numero < 100) {
    return convertirDecenas(numero);
  } else if (numero < 1000) {
    return convertirCentenas(numero);
  } else if (numero < 1000000) {
    return convertirMiles(numero);
  } else {
    return convertirMillones(numero);
  }
}

// Función para convertir el año a palabras
function convertirAñoAPalabras(año) {
  const miles = Math.floor(año / 1000);
  const resto = año % 1000;

  return `dos mil ${convertirNumeroAPalabras(resto)}`;
}
function formatoNumeroConSeparadores(numero) {
  return numero.toLocaleString('es-ES'); // Formatea el número con separadores de miles
}
const ImprimirContratoLocalVivienda = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [estaFirmado, setEstaFirmado] = useState(false);
  const [contratopdf, setContratoPDF] = useState(null);
  const [estaFirmadoArrendatario, setEstaFirmadoArrendatario] = useState(false);


  // Función para cargar el contrato desde la API
  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const response = await fetch(`${API_URL}/api/Contrato_Local_viviendaViewSet/${id}/`);
        const data = await response.json();
        console.log("la carga", data)
        setContrato(data);
        setEstaFirmado(data.estaFirmado); // Configurar el estado inicial
        setEstaFirmadoArrendatario(data.estaFirmadoArrendatario);
      } catch (error) {
        console.error('Error al cargar el contrato:', error);
      }
    };

    fetchContrato();
  }, [id]);
  // Función para manejar la firma del contrato
  const handleAceptarContrato = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contratos/${id}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estaFirmado: true }),
      });

      if (response.ok) {
        alert('El contrato ha sido aceptado.');
        window.location.reload();
      } else {
        console.error('Error al aceptar el contrato.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  const handleAceptarContratoArrendatario = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contratos/${id}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estaFirmadoArrendatario: true }),
      });

      if (response.ok) {
        const response = await fetch(`${API_URL}/api/casas/${casaId}/`, {
          method: 'PATCH',
          headers: {
            'X-CSRFToken': csrfToken,
          },
          body: JSON.stringify({ arrendada: true }),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          alert('El contrato ha sido aceptado.');
          window.location.reload();
        } else {
          const errorData = await response.json();
          console.error(errorData);
          alert(`Error: ${errorData.detail || 'Algo salió mal'}`);
        }
      } else {
        console.error('Error al aceptar el contrato.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };


  // Función para editar el contrato
  const handleEditarContrato = () => {
    // Implementación futura
    alert('te estamos redirigiendo');
    navigate(`/editarcontrato/${id}`)

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
    formDataToSend.append('contratoId', id);  // ID del contrato

    try {
      const response = await fetch(`${API_URL}/api/uploadContrato-pdf/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken, // Asegúrate de incluir el token CSRF si es necesario
        },
        body: formDataToSend,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        alert("PDF subido exitosamente");
        navigate(`/imprime-contrato/${id}`);
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


  // Función para agregar negritas a palabras clave
  const destacarTexto = (texto, cuentas) => {
    const palabrasEnNegritas = [
      'LA ARRENDATARIA', 'EL ARRENDATARIO', 'LA ARRENDADORA', 'EL ARRENDADOR',
      'Cláusula 23: Exclusión de responsabilidad por daños a terceros:',
      'Cláusula 22: Notificaciones:', 'Cláusula 21: Deudores solidarios:',
      'Cláusula 20: Actividad comercial:', 'Cláusula 19: Suspensión de servicios:',
      'Cláusula 18: Gastos:', 'Cláusula 17: Gestión de cobro:',
      'Cláusula 16: Mérito ejecutivo:', 'Cláusula 15: Autorizaciones:',
      'Cláusula 14: Exención de responsabilidad:', 'Cláusula 13: Otras causales de terminación del contrato:',
      'Cláusula 12: Depósito:', 'Cláusula 11: Subarriendo y cesión:',
      'Cláusula 10: Servicios públicos:', 'Cláusula 9: Reparaciones y mejoras:',
      'Cláusula 8: Recibo y entrega:', 'Cláusula 7: Inspección:',
      'Cláusula 6: Clausula penal:', 'Cláusula 5: Prorroga del contrato y aumento del canon:',
      'Cláusula 4: Remuneración mensual o canon de arrendamiento:', 'Cláusula 3: Término del contrato:',
      'Cláusula 2: Destino del inmueble:', 'Cláusula 1: Objeto del contrato:'
    ];

    // Agregar cuentas a las palabras en negrita
    const cuentasEnNegritas = [
      `Cuenta Daviplata N. ${cuentas.cuentaDaviplata}`,
      `y/o cuenta Nequi N. ${cuentas.cuentaNequi}`,
      `y Cuenta de ahorros Bancolombia N. ${cuentas.cuentaBancolombia}`,
      `${cuentas.nombresco}`,
      `${cuentas.apellidosco}`,
      `${cuentas.direccionadmi}`,
      `Barrio ${cuentas.barrioadmi}`,
    ];

    const todasLasPalabrasEnNegritas = palabrasEnNegritas.concat(cuentasEnNegritas);

    let textoProcesado = texto;

    todasLasPalabrasEnNegritas.forEach((palabra) => {
      // Utiliza un regex que respete la palabra completa con posibles espacios
      const regex = new RegExp(`(${palabra})`, 'g');
      textoProcesado = textoProcesado.replace(regex, '<strong>$1</strong>');
    });

    return textoProcesado;
  };
  const [estaInconforme, setEstaInconforme] = useState(false);
  const [inconformidadTexto, setInconformidadTexto] = useState("");

  // Manejar cambios en el texto de inconformidad
  const handleChangeTexto = (e) => {
    const texto = e.target.value;
    setInconformidadTexto(texto);

    // Activar checkbox si hay texto en el área de inconformidad
    if (texto.trim()) {
      setEstaInconforme(true);
    } else {
      setEstaInconforme(false);
    }
  };

  // Manejar cambios en el checkbox
  const handleChangeCheckbox = () => {
    if (!estaInconforme) {
      setEstaInconforme(true);
    } else {
      setEstaInconforme(false);
      setInconformidadTexto(""); // Limpiar texto si desactivan el checkbox
    }
  };


  const handleActualizarContrato = async () => {
    if (!estaInconforme) return;

    const datosActualizados = {
      reporteinconformidad: id,
      estaInconforme,
      Inconformidad: inconformidadTexto,
      estaFirmado: false, // Automáticamente se establece como no firmado
    };

    try {
      const response = await fetch(`${API_URL}/api/reporte-inconformidad/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indica que el contenido es JSON
          'X-CSRFToken': csrfToken, // Solo incluye esto si necesitas CSRF (según tus configuraciones de Django)
        },
        body: JSON.stringify(datosActualizados), // Serializa el cuerpo como JSON
        credentials: 'include', // Incluye las cookies, si es necesario
      });

      const data = await response.json();
      console.log("la inconformidad", data);

      if (response.ok) {
        alert("Inconformidad Enviada");
        navigate(`/`);
        window.location.reload();

      } else {
        console.error("Error al enviar la inconformidad", data);
        alert(`Error al enviar la inconformidad: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error al enviar la inconformidad", error);
    }
  };



  const user = JSON.parse(localStorage.getItem("user"));





  if (!contrato) {
    return <div>Cargando...</div>;
  }
  const cuentas = {
    cuentaDaviplata: contrato.userAdministrador.cuentaDaviplata,
    cuentaNequi: contrato.userAdministrador.cuentaNequi,
    cuentaBancolombia: contrato.userAdministrador.CuentaBancolombia,
    nombresco: contrato.coarrendatario.first_name,
    apellidosco: contrato.coarrendatario.last_name,
    direccionadmi: contrato.userAdministrador.direccion,
    barrioadmi: contrato.userAdministrador.barrio
  };


  return (
    <div className="contrato">
      {(user.groups[0] === 'administrador' || estaFirmado) && (<>
        <header className="header">
          <img src="/images/logoLaverde.png" alt="Logo Laverde" className="logo" style={{ maxHeight: '100px' }} />
        </header>

        <main>
          <h4>CONTRATO DE ARRENDAMIENTO PARA LOCAL COMERCIAL Y VIVIENDA</h4>
          <p>
            En Villavicencio, {fechaFirmaEnPalabras || 'fecha no disponible'}, por una parte, en
            calidad de <b>{contrato.userAdministrador.genero === 'M' ? 'arrendador' : 'arrendadora'}</b>, {contrato.userAdministrador.genero === 'M' ? 'el señor' : 'la señora'} <b>{contrato.userAdministrador.user.first_name} {contrato.userAdministrador.user.last_name}</b>,
            identificad{contrato.userAdministrador.genero === 'M' ? 'o' : 'a'} con cédula de ciudadanía Nro. {formatoNumeroConSeparadores(contrato.userAdministrador.doc_identificacion)} de
            {contrato.userAdministrador.lugarExpCedula}, y, por otra parte, en calidad
            de <b>{contrato.userArrendatario.genero === 'M' ? 'arrendatario' : 'arrendataria'}</b>,
            {contrato.userArrendatario.genero === 'M' ? 'el señor' : 'la señora'} <b>{contrato.userArrendatario.user.first_name} {contrato.userArrendatario.user.last_name}</b>,
            identificad{contrato.userArrendatario.genero === 'M' ? 'o' : 'a'} con cédula de ciudadanía Nro. {formatoNumeroConSeparadores(contrato.userArrendatario.doc_identificacion)} de
            {contrato.userArrendatario.lugarExpCedula}, acuerdan celebrar el presente contrato de arrendamiento
            para local comercial con vivienda que se rige por la ley colombiana y las siguientes
            cláusulas:
          </p>

          {contrato.clausulas.map((clausula) => (
            <div key={clausula.id}>
              <p dangerouslySetInnerHTML={{ __html: destacarTexto(clausula.texto, cuentas) }}></p>
            </div>
          ))}

          <p>
            En constancia de lo anterior el arrendatario y la deudora solidaria manifiestan que han
            recibido copia del presente contrato con las firmas originales.
            <br /><br />
            Para constancia firman,
          </p>

          <br /><br />

          <div className="column-container">
            <div className="column">
              <p>
                <b>{contrato.userAdministrador.user.first_name.toUpperCase()} {contrato.userAdministrador.user.last_name.toUpperCase()}</b>
                <br />C.C. {contrato.userAdministrador.doc_identificacion} de {contrato.userAdministrador.lugarExpCedula}
                <br />{contrato.userAdministrador.direccion} Barrio {contrato.userAdministrador.barrio}
                <br />Cel. {contrato.userAdministrador.celular} - {contrato.userAdministrador.celularDos}
                <br /><b>{contrato.userAdministrador.genero === 'M' ? 'ARRENDADOR' : 'ARRENDADORA'}</b>
                <br /><img src="/images/Campohuella.png" alt="Huella arrendadora" />
              </p>
            </div>

            <div className="column">
              <p>
                <b>{contrato.userArrendatario.user.first_name.toUpperCase()} {contrato.userArrendatario.user.last_name.toUpperCase()}</b>
                <br />C.C. {contrato.userArrendatario.doc_identificacion} de {contrato.userArrendatario.lugarExpCedula}
                <br />{contrato.inmueble.direccion} Barrio {contrato.inmueble.barrio}
                <br />Cel. {contrato.userArrendatario.celular}
                <br /><b>{contrato.userArrendatario.genero === 'M' ? 'ARRENDATARIO' : 'ARRENDATARIA'}</b>
                <br /><img src="/images/Campohuella.png" alt="Huella arrendadora" />
              </p>
            </div>
          </div>
          <p>
            <b>{contrato.coarrendatario.first_name.toUpperCase()} {contrato.coarrendatario.last_name.toUpperCase()}</b>
            <br />C.C. {contrato.coarrendatario.doc_identificacion} de {contrato.coarrendatario.lugarExpCedula}
            <br />{contrato.coarrendatario.direccion} Barrio {contrato.coarrendatario.barrio}
            <br />Cel. {contrato.coarrendatario.celular}
            <br /><b>{contrato.coarrendatario.genero === 'M' ? 'ARRENDATARIO' : 'ARRENDATARIA'} -
              {contrato.coarrendatario.genero === 'M' ? 'COARRENDATARIO' : 'COARRENDATARIA'}</b>
            <br /><img src="/images/Campohuella.png" alt="Huella arrendadora" />
          </p>
        </main>

        {/* Botones condicionales */}
        <div className="acciones-contrato">
          {user.groups[0] === 'administrador' && (<>
            {!estaFirmado && (
              <>
                <button onClick={handleEditarContrato} className="btn-editar">
                  Editar Contrato
                </button>
                <button onClick={handleAceptarContrato} className="btn-aceptar">
                  Aceptar Contrato
                </button>
              </>
            )}

            {estaFirmado && (
              <>
                {contrato.pdf_firmado === null ? (
                  <>
                    <input
                      className="upload-pdf"
                      type="file"
                      name="inventario"
                      accept=".pdf"
                      onChange={handleFileChange} // Esta función manejará el archivo seleccionado
                    />
                    <button className="upload-pdf-button" onClick={handleUploadPDF}>
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
                          onClick={handleUploadPDF}
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
            )}
          </>
          )}
          {user.groups[0] === 'arrendatario' && (<>
            {!estaFirmadoArrendatario && (
              <>
                <button onClick={handleAceptarContratoArrendatario} className="btn-aceptar">
                  Aceptar Contrato
                </button>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={estaInconforme}
                      onChange={handleChangeCheckbox}
                    />
                    Manifestar inconformidad
                  </label>
                </div>

                <div>
                  <textarea
                    placeholder="Describe tu inconformidad"
                    value={inconformidadTexto}
                    onChange={handleChangeTexto}
                    rows={4}
                    cols={50}
                    disabled={!estaInconforme}
                  />
                </div>
                <button onClick={handleActualizarContrato} disabled={!estaInconforme && !inconformidadTexto.trim()}>
                  Envia la inconformidad
                </button>
                {contrato.pdf_inventario === null ? (
                  <>
                    <p className="print-no-mostrar">El inventario no se ha subido </p>
                  </>
                ) : (
                  <>
                    <button
                      className="view-pdf-button"
                      onClick={() => window.open(contrato.pdf_inventario, "_blank")}
                    >
                      Ver Inventario PDF
                    </button>
                  </>
                )}
              </>
            )}

            {estaFirmadoArrendatario && (
              <>
                {contrato.pdf_firmado === null ? (
                  <>
                    <p className="print-no-mostrar">El archivo en Pdf no se ha subido aun</p>
                  </>
                ) : (
                  <>
                    <button
                      className="view-pdf-button"
                      onClick={() => window.open(contrato.pdf_firmado, "_blank")}
                    >
                      Ver contrato PDF
                    </button>
                  </>
                )}
                {contrato.pdf_inventario === null ? (
                  <>
                    <p className="print-no-mostrar">El inventario no se ha subido </p>
                  </>
                ) : (
                  <>
                    <button
                      className="view-pdf-button"
                      onClick={() => window.open(contrato.pdf_inventario, "_blank")}
                    >
                      Ver inventario PDF
                    </button>
                  </>
                )}
                <button className="print-button" onClick={() => window.print()}>
                  Imprimir Contrato
                </button>
              </>
            )}
          </>
          )}
        </div>
      </>)}
    </div>

  );
};

export default ImprimirContratoLocalVivienda;