import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../../utils/csrf'; // Ajusta la ruta según tu estructura
import { API_URL } from '../../config';

const VerContratosOtrosiUsuario = () => {
  const [contratosOtrosi, setContratosOtrosi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Verificar si el usuario está logueado
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchContratos = async () => {
      // Verificar autenticación
      if (!user || !user.id) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Obtener token CSRF
        const csrfToken = await getCsrfToken();
        
        const response = await fetch(
          `${API_URL}/api/contra_arrendatarios_otrosi_firmado/${user.id}/`,
          {
            method: 'GET',
            credentials: 'include', // Importante para enviar cookies
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Error de autenticación - Token CSRF inválido');
          }
          if (response.status === 404) {
            throw new Error('Endpoint no encontrado');
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Contratos otrosi:', data);
        
        // Asegurar que data sea un array
        setContratosOtrosi(Array.isArray(data) ? data : []);
        setError(null);
        
      } catch (err) {
        console.error('Error al cargar contratos:', err.message);
        setError(err.message);
        setContratosOtrosi([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, [user?.id]); // Dependencia en user.id

  const handleSeleccionarOtroSi = (contratoId) => {
    if (contratoId) {
      navigate(`/OtroSiArrendataImprFirm/${contratoId}`);
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Cargando contratos...</div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Otrosíes</h1>
      
      {contratosOtrosi.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No hay contratos otrosí firmados</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nombre Contrato</th>
                  <th className="px-4 py-2 border">Nombre Otrosí</th>
                  <th className="px-4 py-2 border">Estado</th>
                  <th className="px-4 py-2 border">Acción</th>
                </tr>
              </thead>
              <tbody>
                {contratosOtrosi.map((otrosi) => (
                  <tr 
                    key={otrosi.id} 
                    className={otrosi.aceptaOtroSiArrendatario ? "" : "font-bold"}
                  >
                    <td className="px-4 py-2 border">{otrosi.id}</td>
                    <td className="px-4 py-2 border">
                      Contrato NRO {otrosi.contrato}
                    </td>
                    <td className="px-4 py-2 border">
                      {otrosi.aceptaOtroSiArrendatario === false
                        ? otrosi.nombre || `OtroSi NRO ${(otrosi.numOtrosi || 0) + 1}`
                        : otrosi.nombre || `OtroSi NRO ${otrosi.numOtrosi || 0}`}
                    </td>
                    <td className="px-4 py-2 border">
                      {otrosi.aceptaOtroSiArrendatario
                        ? "✅ Aceptado por arrendatario"
                        : "⏳ No aceptado por arrendatario"}
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleSeleccionarOtroSi(otrosi.contrato)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link to="/" className="text-blue-500 hover:underline">
              Volver
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default VerContratosOtrosiUsuario;