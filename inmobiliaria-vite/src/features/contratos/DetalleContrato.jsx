import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

function DetalleContrato() {
  const { id } = useParams();
  const [detalle, setDetalle] = useState(null);
  const [contratosOtrosi, setContratosOtrosi] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar el detalle del contrato
    fetch(`${API_URL}/api/contratos/${id}/`)
      .then((response) => response.json())
      .then((data) => {
        setDetalle(data);
        console.log('Detalle del contrato:', data);
      })
      .catch((error) => console.error('Error al cargar detalle del contrato:', error));
  }, [id]);

  useEffect(() => {
    // Verificar que el detalle tenga contenido antes de continuar
    if (detalle && detalle.arrendatarioId) {
      const arrId = Number(detalle.arrendatarioId);
  
      fetch(`${API_URL}/api/contra_arrendatarios_otrosi_firmado/${arrId}`)
        .then((response) => {
          if (!response.ok) {
            // Manejar errores de respuesta no exitosa
            return response.json().then((error) => {
              throw new Error(error.message || 'Error al cargar contratos otrosi');
            });
          }
          return response.json();
        })
        .then((data) => {
          // Filtrar los contratos para que cumplan las condiciones necesarias
          console.log('Contratos otrosi antes:', data);
          const contratosFiltrados = data.filter(
            (contrato) =>
              contrato.contrato === detalle.id && // ID del contrato actual
              contrato.aceptaOtroSi === true &&
              contrato.aceptaOtroSiArrendatario === true
          );
  
          // Guardar los contratos filtrados en el estado
          setContratosOtrosi(contratosFiltrados);
          console.log('Contratos otrosi filtrados:', contratosFiltrados);
        })
        .catch((error) => {
          console.error('Error al cargar contratos otrosi:', error.message);
          setContratosOtrosi([]); // Si hay error, asegurarse de que sea un array vacío
        });
    }
  }, [detalle]); // Ejecutar este efecto cuando cambie 'detalle'


  const handleSeleccionarOtroSi = (id) => {
    // Maneja la selección del OtroSi (por ejemplo, redirigir o mostrar detalles)
    navigate(`/OtroSiArrendadorImpr/${id} `);
  };

  if (!detalle) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Detalles de comportamiento de pagos de {detalle.nombres_arrendatario} {detalle.apellidos_arrendatario}</h2>
      <b>Contrato NRO {detalle.id}</b>
      <table className="contratos-tabla">
        <thead>
          <tr>
            <th>Fecha de Pago</th>
            <th>Fecha en que se pagó</th>
            <th>Ritmo de pago</th>
          </tr>
        </thead>
        <tbody>
          {detalle.fechas_pago_realizadas.map((fecha) => {
            // Convertir las fechas a objetos Date
            const fechaPago = new Date(fecha.fecha_pago);
            const fechaRealPago = new Date(fecha.fechadeMesaPagar);

            // Calcular la diferencia en milisegundos y luego en días
            const diffTime = fechaRealPago - fechaPago;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Milisegundos a días

            // Determinar el mensaje según el valor de diffDays
            const mensaje =
              diffDays > 0
                ? `Adelantado ${diffDays} días`
                : diffDays < 0
                  ? `Atrasado ${Math.abs(diffDays)} días`
                  : "Pagado a tiempo";

            return (
              <tr key={fecha.fecha_pago}>
                <td>{fecha.fechadeMesaPagar}</td>
                <td>{fecha.fecha_pago}</td>
                <td>{mensaje}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
      <h2>OtroSi firmados por de {detalle.nombres_arrendatario} {detalle.apellidos_arrendatario} para el Contrato NRO {detalle.id}</h2>
      <div>
        {/* Tabla para contratosOtrosi */}
        <div>
          <h2>
            <label htmlFor="contratosOtrosi">Seleccionar OtroSi:</label>
          </h2>
          {contratosOtrosi.length === 0 ? (
            <p>No hay contratos otro si firmados</p>
          ) : (
            <table className="otrosi-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Contrato</th>
                  <th>Nombre Otrosi</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {contratosOtrosi.map((otrosi) => (
                  <tr
                    key={otrosi.id}
                    style={{
                      fontWeight: otrosi.aceptaOtroSiArrendatario ? "normal" : "bold",
                    }}
                  >
                    <td>{otrosi.id}</td>
                    <td>Contrato NRO {otrosi.contrato}</td>
                    <td>
                      {otrosi.aceptaOtroSiArrendatario === false
                        ? otrosi.nombre || `OtroSi NRO ${otrosi.numOtrosi + 1}`
                        : otrosi.nombre || `OtroSi NRO ${otrosi.numOtrosi}`}
                    </td>
                    <td>
                      {otrosi.aceptaOtroSiArrendatario
                        ? "Aceptado por arrendatario"
                        : "No aceptado por arrendatario"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleSeleccionarOtroSi(otrosi.contrato)}
                        className="seleccionar-btn"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p>
          <Link to="/">Volver</Link>
        </p>
      </div>
    
    
    </div >
  );
}

export default DetalleContrato;
