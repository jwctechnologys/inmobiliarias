// VerUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const VerUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [grupo, setGrupo] = useState('arrendatario');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const baseUrl = API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (grupo) {
      setCargando(true);
      setError(null);
      
      fetch(`${baseUrl}/api/usuarios_por_grupo/${grupo}/`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error al cargar usuarios del grupo ${grupo}`);
          }
          return response.json();
        })
        .then((data) => {
          setUsuarios(data);
          setCargando(false);
        })
        .catch((error) => {
          console.error('Error al cargar usuarios:', error);
          setError(error.message);
          setCargando(false);
        });
    }
  }, [grupo, baseUrl]);

  const handleUpdate = (id) => {
    navigate(`/EditarUsuarios/${grupo}/${id}`);
  };

  const handleDisable = (id) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar este usuario?')) {
      console.log(`Deshabilitar usuario con ID: ${id}`);
      // Aquí iría la lógica para deshabilitar
    }
  };

  const handleActivate = (id) => {
    if (window.confirm('¿Estás seguro de que deseas activar este usuario?')) {
      console.log(`Activar usuario con ID: ${id}`);
      // Aquí iría la lógica para activar
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            
            {/* Selector de grupo */}
            <div className="flex items-center gap-3">
              <label htmlFor="grupo" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filtrar por:
              </label>
              <select
                id="grupo"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                className="block w-full sm:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="administrador">Administradores</option>
                <option value="arrendatario">Arrendatarios</option>
                <option value="propietario">Propietarios</option>
                <option value="proveedor">Proveedores</option>
              </select>
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-blue-50 rounded-lg px-4 py-2">
              <span className="text-sm text-blue-600 font-medium">
                Total: {usuarios.length} usuarios
              </span>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-2">
              <span className="text-sm text-green-600 font-medium">
                Activos: {usuarios.filter(u => u.is_active).length}
              </span>
            </div>
            <div className="bg-red-50 rounded-lg px-4 py-2">
              <span className="text-sm text-red-600 font-medium">
                Inactivos: {usuarios.filter(u => !u.is_active).length}
              </span>
            </div>
          </div>
        </div>

        {/* Estado de carga */}
        {cargando && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error al cargar usuarios</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tabla de usuarios */}
        {!cargando && !error && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Versión móvil: tarjetas */}
            <div className="block sm:hidden">
              {usuarios.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay usuarios en este grupo</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {`${usuario.first_name} ${usuario.last_name}`}
                          </h3>
                          <p className="text-sm text-gray-600">{usuario.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          usuario.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">ID:</span>
                          <span className="ml-1 text-gray-900">{usuario.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Celular:</span>
                          <span className="ml-1 text-gray-900">{usuario.celular || 'N/A'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Ocupación:</span>
                          <span className="ml-1 text-gray-900">{usuario.ocupacion || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(usuario.id)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                        {usuario.is_active ? (
                          <button
                            onClick={() => handleDisable(usuario.id)}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Deshabilitar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(usuario.id)}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Versión desktop: tabla */}
            <div className="hidden sm:block">
              {usuarios.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay usuarios en este grupo</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ocupación
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Celular
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usuario.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {`${usuario.first_name} ${usuario.last_name}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.ocupacion || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.celular || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            usuario.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {usuario.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(usuario.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                            >
                              Editar
                            </button>
                            {usuario.is_active ? (
                              <button
                                onClick={() => handleDisable(usuario.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
                              >
                                Deshabilitar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(usuario.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
                              >
                                Activar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerUsuarios;