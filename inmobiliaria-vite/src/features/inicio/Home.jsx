// Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [casas, setCasas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/casas/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al cargar las propiedades');
        }
        return response.json();
      })
      .then((data) => {
        const casasDisponibles = data.filter(
          (casa) => !casa.solicitudAceptada
        );
        setCasas(casasDisponibles);
        setCargando(false);
        //console.log('Datos de casas:', data);
      })
      .catch((error) => {
        console.error("Error al cargar las casas:", error);
        setError(error.message);
        setCargando(false);
      });
  }, []);

  const handleCasaClick = (id) => {
    navigate(`/info/Casas/${id}`);
  };

  // Formatear precio en COP
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              ¡Bienvenidos a Inmobiliaria CL!
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
              Tu aliado de confianza en la búsqueda del hogar o inversión ideal. 
              Estamos aquí para ayudarte a encontrar el espacio perfecto que se 
              ajuste a tus sueños y necesidades.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                <span className="font-semibold">{casas.length}</span> propiedades disponibles
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                <span className="font-semibold">¡Contactanos!</span> para más información
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de propiedades */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Propiedades Destacadas
          </h2>
          <p className="text-gray-600">
            {casas.length} {casas.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
          </p>
        </div>

        {casas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay propiedades disponibles
            </h3>
            <p className="text-gray-500">
              Pronto tendremos nuevas propiedades para ti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {casas.map((casa) => (
              <div
                key={casa.id}
                onClick={() => handleCasaClick(casa.id)}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
              >
                {/* Imagen con overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={casa.fotoPrincipal || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}
                    alt={casa.descripcion || 'Propiedad'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                    }}
                  />
                  
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatearPrecio(casa.canonmensual)}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">/mes</span>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                    {casa.descripcion || 'Propiedad en arriendo'}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {casa.direccion}, {casa.barrio}, {casa.ciudad}
                  </p>

                  {/* Características rápidas */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {casa.habitaciones && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {casa.habitaciones} hab
                      </span>
                    )}
                    {casa.banos && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {casa.banos} baños
                      </span>
                    )}
                    {casa.area && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        {casa.area} m²
                      </span>
                    )}
                  </div>

                  {/* Botón ver detalles */}
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700">
                      Ver detalles
                    </span>
                    <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con información de contacto */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              ¿Tienes preguntas? Contáctanos para ayudarte a encontrar tu hogar ideal.
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-700">
                📞 +57 123 456 7890
              </a>
              <span className="text-gray-300">|</span>
              <a href="mailto:info@inmobiliaria.cl" className="text-blue-600 hover:text-blue-700">
                ✉️ info@inmobiliaria.cl
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;