import React, { useState, useEffect } from "react";
import { getCsrfToken } from '../../utils/csrf';
import { API_URL } from '../../config';
import { estilosFormulario } from '../../utils/formStyles';

const st = estilosFormulario('azul');

const SubirPagoRecibosSeparados = () => {
  const [contratos, setContratos] = useState([]);
  const [reciboTipo, setReciboTipo] = useState("imagenReciboLuz");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [contratoId, setContratoId] = useState(""); // Contrato seleccionado

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')) || {};

    // Este endpoint exige sesion iniciada (IsAuthenticated): sin "credentials: include" no manda la
    // cookie de sesion, el servidor responde 403 y el cuerpo del error (un objeto, no una lista)
    // terminaba haciendo fallar el .map() del <select> de contratos.
    fetch(`${API_URL}/api/contratos-arrendatario/${userData.id}/`, { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || data.error || 'No se pudieron cargar los contratos');
        return data;
      })
      .then((data) => setContratos(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error('Error al cargar contratos:', error);
        setContratos([]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || !contratoId) {
      setMensaje("Seleccione un archivo y un contrato.");
      return;
    }

    const formData = new FormData();
    formData.append("reportePagoReciboContrato", contratoId);
    formData.append("reciboTipo", reciboTipo);
    formData.append(reciboTipo, selectedFile);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}/api/reporte-pago-recibos/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        setMensaje("Recibo subido con éxito.");
        setSelectedFile(null); // Limpiar archivo seleccionado
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.error || "No se pudo subir el recibo."}`);
      }
    } catch (error) {
      setMensaje("Error de red o al obtener el CSRF token.");
    }
  };

  return (
    <div className={st.pagina}>
      <div className={st.contenedor}>
        <h1 className={st.titulo}>Subir Recibo de Pago</h1>
        <div className={st.tarjeta}>
          <form onSubmit={handleSubmit} className={st.grupo}>
            <div>
              <label htmlFor="contratoNum" className={st.label}>Número de Contrato</label>
              <select
                id="contratoNum"
                value={contratoId}
                onChange={(e) => setContratoId(e.target.value)}
                required
                className={st.select}
              >
                <option value="">Seleccione un contrato</option>
                {contratos.map((contrato) => (
                  <option key={contrato.id} value={contrato.id}>
                    Contrato #{contrato.id} - {contrato.inmueble}
                    {contrato.inmuebleTipo ? ` (${contrato.inmuebleTipo})` : ''}
                    {contrato.inmuebleBarrio ? `, Barrio ${contrato.inmuebleBarrio}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reciboTipo" className={st.label}>Tipo de Recibo</label>
              <select
                id="reciboTipo"
                value={reciboTipo}
                onChange={(e) => setReciboTipo(e.target.value)}
                className={st.select}
              >
                <option value="imagenReciboLuz">Recibo Luz</option>
                <option value="imagenReciboAgua">Recibo Agua</option>
                <option value="imagenReciboGas">Recibo Gas</option>
                <option value="imagenReciboBioagricola">Recibo Bioagricola</option>
              </select>
            </div>

            <div>
              <label className={st.label}>Archivo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                required
                className={st.archivo}
              />
            </div>

            <button type="submit" className={st.botonPrimario}>Subir Recibo</button>
          </form>

          {mensaje && (
            <p className={`mt-4 text-sm font-medium ${mensaje.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubirPagoRecibosSeparados;
