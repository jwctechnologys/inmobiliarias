import React, { useState, useEffect } from "react";
import { API_URL } from '../../config';

const RevisarPagosServicios = () => {
  const [arrendatarios, setArrendatarios] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar los arrendatarios desde el backend
  useEffect(() => {
    fetch(`${API_URL}/api/arrendatarios/`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo cargar los arrendatarios.`);
        }
        return response.json();
      })
      .then((data) => {
        setArrendatarios(data);
        console.log('info arrendatarios',data)
      })
      .catch((error) => {
        console.error("Error al cargar los arrendatarios:", error);
        setMensaje("Error al cargar los arrendatarios.");
      });
  }, []);

  // Supervisar pagos del arrendatario seleccionado
  const supervisarPagos = (arrendatarioId) => {
    console.log("Arrendatario seleccionado:", arrendatarioId);
    setLoading(true);

    fetch(`${API_URL}/api/ver-pagos-servicios/${arrendatarioId}/`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo cargar los pagos.`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPagos(data);
          console.log('probamdo', data)
          setMensaje("");
        } else {
          setMensaje("No se encontraron pagos para este arrendatario.");
          setPagos([]);
        }
      })
      .catch((error) => {
        console.error("Error al cargar los pagos:", error);
        setMensaje("Error al cargar los pagos de servicios.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h2>Revisar Pagos de Servicios</h2>
      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      {/* Listar arrendatarios */}
      {arrendatarios.length > 0 ? (
        <div>
          <h3>Arrendatarios</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {arrendatarios.map((arrendatario) => (
                <tr key={arrendatario.id}>
                  <td>
                    {arrendatario.user.first_name} {arrendatario.user.last_name}
                  </td>
                  <td>
                    <button onClick={() => supervisarPagos(arrendatario.id)}>
                      Supervisar Pagos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No se han encontrado arrendatarios.</p>
      )}

      {/* Mostrar pagos */}
      {loading ? (
        <p>Cargando pagos...</p>
      ) : pagos.length > 0 ? (
        <div>
          <h3>Pagos de Servicios</h3>
          <table>
            <thead>
              <tr>
                <th>Contrato ID</th>
                <th>Recibo Luz</th>
                <th>Recibo Agua</th>
                <th>Recibo Gas</th>
                <th>Recibo Bioagricola</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id}>
                  <td>{pago.reportePagoReciboContrato}</td>
                  <td>
                    <img
                      src={`${API_URL}/${pago.imagenReciboLuz}`}
                      alt="Imagen principal"
                      style={{ width: '100px', height: '100px' }}
                    />
                  </td>
                  <td>
                    <img
                      src={`${API_URL}/${pago.imagenReciboAgua}`}
                      alt="Imagen principal"
                      style={{ width: '100px', height: '100px' }}
                    />
                  </td>
                  <td>
                    <img
                      src={`${API_URL}/${pago.imagenReciboGas}`}
                      alt="Imagen principal"
                      style={{ width: '100px', height: '100px' }}
                    />

                  </td>
                  <td>
                    <img
                      src={`${API_URL}/${pago.imagenReciboBioagricola}`}
                      alt="Imagen principal"
                      style={{ width: '100px', height: '100px' }}
                    />

                  </td>
                
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !mensaje && <p>No se han encontrado pagos de servicios.</p>
      )}
    </div>
  );
};

export default RevisarPagosServicios;
