import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function VerContratoVivienda() {
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const navigate = useNavigate();
  // Cargar contratos desde el servidor
  useEffect(() => {
    // Si quieres filtrar por tipoContrato, puedes agregar el parámetro en la URL
    fetch(`${import.meta.env.VITE_BASE_URL}/api/Contrato_Local_viviendaViewSet/?tipoContrato=vivienda`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Datos de contratos filtrados:', data);
        setContratos(data);
      })
      .catch((error) => console.error('Error al cargar contratos:', error));
  }, []);

  const handleSeleccionarContrato = (e) => {
    const id = e.target.value;
    const contrato = contratos.find((c) => c.id === Number(id));
    setContratoSeleccionado(contrato);
  };

  const handleVerVistaImpresion = () => {
    // Implementar la vista de impresión
    navigate(`/imprime-contrato/${contratoSeleccionado.id}`);
  };

  const handleEditarContrato = () => {
    // Navegar o mostrar la vista de edición
    console.log('Editar contrato', contratoSeleccionado);
    navigate(`/editarcontratovivienda/${contratoSeleccionado.id}`);
  };

  const handleVerPDF = () => {
    // Implementar la lógica para ver el PDF
    console.log('Ver contrato en PDF', contratoSeleccionado);
  };

  return (
    <div className="ver-contratos">
      <Link to="/Revisar/Contratos">Ir a Revisar Contratos</Link>
      <h2>Ver Contratos</h2>
      <div>
        <label htmlFor="contrato">Seleccionar contrato de vivienda:</label>
        <select id="contrato" onChange={handleSeleccionarContrato}>
          <option value="">-- Seleccionar --</option>
          {contratos.map((contrato) => (
            <option key={contrato.id} value={contrato.id}>
              {contrato.nombre || `Contrato ${contrato.id}`}
            </option>
          ))}
        </select>
      </div>

      {contratoSeleccionado && (
        <div className="detalles-contrato">
          <h3>Detalles del Contrato</h3>
          <p><strong>Arrendador:</strong> {contratoSeleccionado.userAdministrador.user.first_name || 'N/A'} {contratoSeleccionado.userAdministrador.user.last_name}</p>
          <p><strong>Arrendatario:</strong> {contratoSeleccionado.userArrendatario.user.first_name || 'N/A'} {contratoSeleccionado.userArrendatario.user.last_name || 'N/A'}</p>
          <p><strong>Coarrendatario:</strong> {contratoSeleccionado.coarrendatario.first_name || 'N/A'} {contratoSeleccionado.coarrendatario.last_name}</p>
          <p><strong>Fecha de Inicio:</strong> {contratoSeleccionado.fechainicio || 'N/A'}</p>
          <p><strong>Fecha Final:</strong> {contratoSeleccionado.fechafin || 'N/A'}</p>

          <div className="opciones-contrato">
            <button onClick={handleVerVistaImpresion}>Ver en vista de impresión</button>
            {!contratoSeleccionado.estaFirmado && (
              <button onClick={handleEditarContrato}>Editar contrato</button>
            )}
            {contratoSeleccionado.estaFirmado && (
              <>            
              {contratoSeleccionado.pdf_firmado === null ? (
                <>Ve a vista de impresion para subir el contrato en PDF</>
              ) : (
                <button
                  className="view-pdf-button"
                  onClick={() => window.open(contratoSeleccionado.pdf_firmado, "_blank")}
                >
                  Ver PDF
                </button>
              )}</>)}
          </div>
        </div>
      )}
    </div>
  );
}

export default VerContratoVivienda;
