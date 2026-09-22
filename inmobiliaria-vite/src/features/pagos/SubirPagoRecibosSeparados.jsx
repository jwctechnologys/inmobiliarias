import React, { useState, useEffect } from "react";
import { getCsrfToken } from '../../utils/csrf';

const SubirPagoRecibosSeparados = () => {
  const [contratos, setContratos] = useState([]);
  const [reciboTipo, setReciboTipo] = useState("imagenReciboLuz");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [contratoId, setContratoId] = useState(""); // Contrato seleccionado

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')) || {};

    fetch(`${import.meta.env.VITE_BASE_URL}/api/contratos-arrendatario/${userData.id}/`)
      .then((response) => response.json())
      .then((data) => setContratos(data))
      .catch((error) => console.error('Error al cargar contratos:', error));
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

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/reporte-pago-recibos/`, {
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
    <div>
      <h2>Subir Recibo de Pago</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="contratoNum">Número de Contrato:</label>
          <select
            id="contratoNum"
            value={contratoId}
            onChange={(e) => setContratoId(e.target.value)}
            required
          >
            <option value="">Seleccione un contrato</option>
            {contratos.map((contrato) => (
              <option key={contrato.id} value={contrato.id}>
                {contrato.id} - {contrato.direccion}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Tipo de Recibo:</label>
          <select
            value={reciboTipo}
            onChange={(e) => setReciboTipo(e.target.value)}
          >
            <option value="imagenReciboLuz">Recibo Luz</option>
            <option value="imagenReciboAgua">Recibo Agua</option>
            <option value="imagenReciboGas">Recibo Gas</option>
            <option value="imagenReciboBioagricola">Recibo Bioagricola</option>
          </select>
        </div>
        <div>
          <label>Archivo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit">Subir Recibo</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default SubirPagoRecibosSeparados;
