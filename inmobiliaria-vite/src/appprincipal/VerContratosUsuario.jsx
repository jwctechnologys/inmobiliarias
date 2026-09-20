import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCsrfToken } from './csrf'; // Ajusta la ruta

const VerContratosUsuario = () => {
  const [contratos, setContratos] = useState([]);
  const [contratosOtrosi, setContratosOtrosi] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Verificar usuario autenticado
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchData = async () => {
      // Validar autenticación
      if (!user || !user.id) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Obtener token CSRF
        const csrfToken = await getCsrfToken();

        // Fetch contratos principales
        const contratosResponse = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/contratosActivosArrendatario/?arrendatario_id=${user.id}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
          }
        );

        if (!contratosResponse.ok) {
          throw new Error(`Error al cargar contratos: ${contratosResponse.status}`);
        }

        const contratosData = await contratosResponse.json();
        setContratos(Array.isArray(contratosData) ? contratosData : []);

        // Fetch contratos otrosi
        const otrosiResponse = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/contra_arrendatarios_otrosi/${user.id}/`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
          }
        );

        if (!otrosiResponse.ok) {
          if (otrosiResponse.status === 404) {
            console.warn('Endpoint de otrosí no encontrado');
            setContratosOtrosi([]);
          } else {
            throw new Error(`Error al cargar otrosí: ${otrosiResponse.status}`);
          }
        } else {
          const otrosiData = await otrosiResponse.json();
          setContratosOtrosi(Array.isArray(otrosiData) ? otrosiData : []);
          console.log('Contratos otrosi:', otrosiData);
        }

      } catch (err) {
        console.error('Error al cargar datos:', err.message);
        setError(err.message);
        setContratos([]);
        setContratosOtrosi([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]); // Dependencia correcta

  const handleSeleccionarOtroSi = (id) => {
    if (id) {
      navigate(`/OtroSiArrendatarioImprimir/${id}`);
    }
  };

  const handleSeleccionarContrato = (id) => {
    const contrato = contratos.find((c) => c.id === id);
    setContratoSeleccionado(contrato);
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
      <div className="ver-contratos">
        {/* Tabla de contratos principales */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Seleccionar contrato Local/Vivienda:
          </h2>
          
          {contratos.length === 0 ? (
            <p className="text-gray-500">No hay contratos disponibles</p>
          ) : (
            <>
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Nombre</th>
                    <th className="px-4 py-2 border">Estado</th>
                    <th className="px-4 py-2 border">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {contratos.map((contrato) => (
                    <tr
                      key={contrato.id}
                      className={contrato.estaFirmadoArrendatario ? "" : "font-bold"}
                    >
                      <td className="px-4 py-2 border">{contrato.id}</td>
                      <td className="px-4 py-2 border">
                        {contrato.nombre || `Contrato ${contrato.id}`}
                      </td>
                      <td className="px-4 py-2 border">
                        {contrato.estaFirmadoArrendatario
                          ? "✅ Firmado"
                          : "⏳ No firmado por arrendatario"}
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleSeleccionarContrato(contrato.id)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {contratoSeleccionado && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-bold mb-2">Enlaces del contrato:</h3>
                  {contratoSeleccionado.tipoContrato === "vivienda" && (
                    <Link 
                      to={`/imprime-contrato/${contratoSeleccionado.id}`}
                      className="text-blue-500 hover:underline block"
                    >
                      Ver Contrato de Vivienda
                    </Link>
                  )}
                  {contratoSeleccionado.tipoContrato === "localvivienda" && (
                    <Link 
                      to={`/imprimir-contrato/${contratoSeleccionado.id}`}
                      className="text-blue-500 hover:underline block"
                    >
                      Ver Contrato Local/Vivienda
                    </Link>
                  )}
                  {contratoSeleccionado.tipoContrato === "local comercial" && (
                    <Link 
                      to={`/imprimio-contrato/${contratoSeleccionado.id}`}
                      className="text-blue-500 hover:underline block"
                    >
                      Ver Contrato Local Comercial
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Tabla para contratos Otrosi */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Seleccionar OtroSi:
          </h2>
          
          {contratosOtrosi.length === 0 ? (
            <p className="text-gray-500">Sin contratos otro si para firmar</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nombre Contrato</th>
                  <th className="px-4 py-2 border">Nombre Otrosi</th>
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
          )}
        </div>

        <p>
          <Link to="/VerContratosOtrosiUsuario" className="text-blue-500 hover:underline">
            Ver contratos Otrosi Firmados
          </Link>
        </p>
        
        <p className="mt-4">
          <Link to="/" className="text-blue-500 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerContratosUsuario;