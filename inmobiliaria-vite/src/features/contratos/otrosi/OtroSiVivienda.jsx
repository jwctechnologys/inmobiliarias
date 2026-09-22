import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getCsrfToken } from '../../../utils/csrf';
import '../ImprimirContrato.css'; // Importar el CSS de impresión

function OtroSiVivienda() {
  const { id } = useParams(); // Obtener el ID de la URL
  const [contratos, setContratos] = useState([]);
  const [fechafinal, setFechafinal] = useState("");
  const [opcion, setOpcion] = useState(""); // Opciones: "meses" o "fecha"
  const [meses, setMeses] = useState(0);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [contratoOtrosi, setContratoOtrosi] = useState([]);
  const navigate = useNavigate(); // Hook para la navegación
  const [canonMensualOtrosii, setCanonMensualOtrosii] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  function formatoNumeroConSeparadores(numero) {
    const num = Number(numero); // Convertir el valor a número
    if (isNaN(num)) {
      return "Número inválido"; // Manejo de errores si no es un número
    }
    return num.toLocaleString('es-ES'); // Formatea el número con separadores de miles
  }

  useEffect(() => {
    const contratoId = Number(id); // Convertir id a número
    fetch(`${import.meta.env.VITE_BASE_URL}/api/contratos/activos/`)
      .then((response) => response.json())
      .then((data) => {
        const filteredContratos = data.filter((contrato) => contrato.id === contratoId);
        setContratos(filteredContratos);
        console.log("Contratos Cargado:", filteredContratos);

      })
      .catch((error) => console.error("Error al cargar contratos:", error));
    fetch(`${import.meta.env.VITE_BASE_URL}/api/otroSi/`)
      .then((response) => response.json())
      .then((data) => {
        const filteredContratoOtrosi = data.filter(
          (otroSi) =>
            otroSi.contrato === contratoId &&
            otroSi.aceptaOtroSi === false &&
            otroSi.aceptaOtroSiArrendatario === false
        );

        setContratoOtrosi(filteredContratoOtrosi);
        console.log("Contratos otroSi:", filteredContratoOtrosi);

      })
      .catch((error) => console.error("Error al cargar contratos:", error));
  }, []);

  const handleCanonChange = (e) => {
    const canonarrendamiento = parseInt(e.target.value, 10);
    setCanonMensualOtrosii(canonarrendamiento);
  }

  const handleOpcionChange = (e) => {
    setOpcion(e.target.value);
    setFechafinal(""); // Reiniciar el estado al cambiar la opción
  };



  const handleMesesChange = (e) => {
    const mesesSeleccionados = parseInt(e.target.value, 10);
    setMeses(mesesSeleccionados);

    if (contratos[0]?.fechafin) {
      const fechafinContrato = new Date(contratos[0].fechafin); // Convertir fecha a objeto Date
      fechafinContrato.setMonth(fechafinContrato.getMonth() + mesesSeleccionados); // Sumar meses
      setFechafinal(fechafinContrato.toISOString().split("T")[0]); // Guardar en formato YYYY-MM-DD
    }
  };

  const handleFechaSeleccionadaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaSeleccionada(nuevaFecha);
    setFechafinal(nuevaFecha); // Guardar la fecha seleccionada directamente
  };

  const handleGuardar = async () => {
    const idOtrosi= contratoOtrosi[0]?.id
    const fechaParaGuardar =
      fechafinal || contratoOtrosi[0]?.fechafin; // Usa la fecha sugerida si no se cambia
const canonmensualOtros=canonMensualOtrosii || contratos[0]?.canonmensual;
      // Actualizar en el backend si hay cambios
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/otroSi/${idOtrosi}/`, // URL del endpoint
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fechafin: fechaParaGuardar,
              vistaImpresion:true,
              canonmensualOtrosi:canonmensualOtros,
            }),
          }
        );

        if (response.ok) {
          console.log("Fecha actualizada correctamente");
        } else {
          console.error("Error al actualizar la fecha");
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
      }
    

    // Redirigir a la vista de impresión
    navigate(`/OtroSiViviendaImprimir/${id}`);
  };

  return (
    <>
      {contratos.length > 0 ? (
        <>
          <p><b>Editar Contrato OtroSi NRO {contratos[0].numOtrosi + 1}</b></p>
          <p>Entre {contratos[0].genero_arrendador === 'M' ? 'el arrendador' : 'la arrendadora'} <b>{contratos[0].nombres_arrendador.toUpperCase()} {contratos[0].apellidos_arrendador.toUpperCase()} </b> y {contratos[0].genero_arrendatario === 'M' ? 'el arrendatario' : 'la arrendataria'} <b>{contratos[0].nombres_arrendatario.toUpperCase()} {contratos[0].apellidos_arrendatario.toUpperCase()}</b></p>
          <p>Otro si para el Contrato No. {contratos[0].id}</p>
          <p>Fecha Fin Contrato Original {contratos[0].fechafin}</p>
          {!contratos[0].numOtrosi === 0 && (
            <p>Fecha Fin OtroSi Nro {contratos[0].numOtrosi} {contratos[0].fechafinOtrosi} </p>
          )}
          <p>Fecha inicio OtroSi NRO {contratos[0].numOtrosi + 1} {contratoOtrosi[0].fechainicio} </p>
          <p>Fecha OtroSi NRO {contratos[0].numOtrosi + 1} final sugerida a 6 meses {contratoOtrosi[0].fechafin} </p>
          <p>Canon de arrendamiento ${formatoNumeroConSeparadores(contratos[0].canonmensual)}</p>
          <label>
                  Si desea modificar el Canon de Arrendamiento escribe el nuevo Valor:{" "}
                  <input
                    type="number"
                    onChange={handleCanonChange}
                    min="0"
                  />
                </label>


          <br/>
          <div>
            <p>
              Si desea modificar la fecha final del otro si, seleccione una opción:
            </p>

            <label>
              <input
                type="radio"
                value="meses"
                checked={opcion === "meses"}
                onChange={handleOpcionChange}
              />
              Indicar número de meses
            </label>

            <label>
              <input
                type="radio"
                value="fecha"
                checked={opcion === "fecha"}
                onChange={handleOpcionChange}
              />
              Indicar fecha
            </label>

            {opcion === "meses" && (
              <div>
                <label>
                  Número de meses:{" "}
                  <input
                    type="number"
                    value={meses}
                    onChange={handleMesesChange}
                    min="0"
                  />
                </label>
              </div>
            )}

            {opcion === "fecha" && (
              <div>
                <label>
                  Seleccionar fecha:{" "}
                  <input
                    type="date"
                    value={fechaSeleccionada}
                    onChange={handleFechaSeleccionadaChange}
                  />
                </label>
              </div>
            )}

            <p>
              Fecha final sugerida:{" "}
              {fechafinal || contratoOtrosi[0]?.fechafin || "No definida"}
            </p>

            <button onClick={handleGuardar}>Guardar y Ver Impresión</button>
          </div>
        </>
      ) : (
        <p>Cargando información del contrato...</p>
      )}
    </>
  );
};

export default OtroSiVivienda;