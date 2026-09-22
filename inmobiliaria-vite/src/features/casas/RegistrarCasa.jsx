import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../config';

const RegistrarCasa = () => {
  const [casas, setCasas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [filterType, setFilterType] = useState('todas'); // 'todas', 'disponibles', 'ocupadas'
  const navigate = useNavigate();

  useEffect(() => {
    cargarCasas();
  }, []);

  const cargarCasas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener el usuario desde localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(user);

      if (!user) {
        setError("No hay usuario autenticado");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/casas/`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar casas: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);

      // Filtrar según el rol del usuario
      let casasFiltradas = data;
      
      if (user.groups && user.groups[0] === 'propietario') {
        casasFiltradas = data.filter(casa => casa.propietario === user.id);
      }

      setCasas(casasFiltradas);
    } catch (error) {
      console.error("Error al cargar las casas:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = (casaId) => {
    navigate(`/imagenes/Casas/${casaId}`);
  };

  const handleUploadVideos = (casaId) => {
    navigate(`/video/Casas/${casaId}`);
  };

  const handleEditCasa = (casaId) => {
    navigate(`/actualizar/Casas/${casaId}`);
  };

  const handleViewDetails = (casaId) => {
    navigate(`/detalle/Casa/${casaId}`);
  };

  const handleDeleteCasa = async (casaId) => {
    if (window.confirm('¿Está seguro de eliminar esta casa?')) {
      try {
        const response = await fetch(`${API_URL}/api/casas/${casaId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Recargar la lista de casas
          cargarCasas();
        } else {
          throw new Error('Error al eliminar la casa');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la casa');
      }
    }
  };

  // Función para verificar si una casa está disponible
  // arrendada = false -> disponible, arrendada = true -> no disponible
  const isCasaDisponible = (casa) => {
    return casa.arrendada === false;
  };

  // Filtrar casas por búsqueda y estado
  const casasFiltradas = casas.filter(casa => {
    const matchesSearch = casa.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (casa.propietario_nombre && casa.propietario_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'todas') return matchesSearch;
    if (filterType === 'disponibles') return matchesSearch && isCasaDisponible(casa);
    if (filterType === 'ocupadas') return matchesSearch && !isCasaDisponible(casa);
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={cargarCasas}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userRole = currentUser?.groups?.[0] || '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Casas</h1>
          <p className="mt-2 text-sm text-gray-600">
            {userRole === 'administrador' 
              ? 'Administra todas las casas del sistema' 
              : 'Administra tus propiedades'}
          </p>
        </div>

        {/* Enlaces de acción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/register/CasasBasico"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Registro Básico</h3>
                <p className="text-sm text-gray-500">Registrar información básica de una casa</p>
              </div>
            </div>
          </Link>

          <Link
            to="/actualizar/CasasBasico"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Modificar Casa</h3>
                <p className="text-sm text-gray-500">Actualizar información de casas existentes</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por dirección o propietario..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por estado
              </label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas las casas</option>
                <option value="disponibles">Disponibles</option>
                <option value="ocupadas">Ocupadas</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={cargarCasas}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de casas</p>
            <p className="text-2xl font-bold text-gray-900">{casas.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Disponibles</p>
            <p className="text-2xl font-bold text-green-600">
              {casas.filter(c => isCasaDisponible(c)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Ocupadas</p>
            <p className="text-2xl font-bold text-orange-600">
              {casas.filter(c => !isCasaDisponible(c)).length}
            </p>
          </div>
        </div>

        {/* Tabla de casas */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Canon Mensual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {casasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No se encontraron casas
                    </td>
                  </tr>
                ) : (
                  casasFiltradas.map((casa) => (
                    <tr key={casa.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {casa.direccion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {casa.propietario_nombre || `ID: ${casa.propietario}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isCasaDisponible(casa) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isCasaDisponible(casa) ? 'Disponible' : 'No disponible'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {casa.tipoInmueble || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {casa.canonmensual ? `$${new Intl.NumberFormat('es-CO').format(casa.canonmensual)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(casa.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleUploadImages(casa.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Subir imágenes"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleUploadVideos(casa.id)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                            title="Subir videos"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleEditCasa(casa.id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {userRole === 'administrador' && (
                            <button
                              onClick={() => handleDeleteCasa(casa.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Eliminar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarCasa;