// NavBar.jsx - Versión corregida (sin duplicación)
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getCsrfToken } from "./csrf";

function NavBar() {
  const { isLoggedIn, user, handleLogout } = useAuth();
  const [localUser, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [estaFirmadoArrendatario, setEstaFirmadoArrendatario] = useState([]);
  const [isOtrosi, setIsOtrosi] = useState(false);
  const [isOtrosiArrendatario, setIsOtrosiArrendatario] = useState(false);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);
  const [solicitudesPendientesContrato, setSolicitudesPendientesContrato] = useState(0);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [itemsToShow, setItemsToShow] = useState([]);
  const [itemsInMore, setItemsInMore] = useState([]);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  
  const navItemsRef = useRef(null);

  // Obtener el usuario actual combinando context y localStorage
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    }
    return user;
  };

  const currentUser = getCurrentUser();
  const groups = currentUser?.groups || [];
  const belongsToGroup = (group) => groups.includes(group);

  // Función para obtener todos los items del menú como objetos
  const getMenuItems = () => {
    const items = [];

    items.push({
      id: 'home',
      label: 'Inicio',
      path: '/',
      priority: 1
    });

    // ARRENDATARIO
    if (belongsToGroup('arrendatario')) {
      items.push(
        { id: 'coarrendatario', label: 'Registrar Coarrendatario', path: '/register/coarrendatario', priority: 2 },
        { id: 'dependientes', label: 'Registrar Dependiente', path: '/register/dependientes', priority: 3 },
        { 
          id: 'solicitudes', 
          label: 'Gestionar Solicitudes', 
          path: '/ver-solicitudes',
          badge: solicitudesPendientes > 0 ? solicitudesPendientes : null,
          priority: 4
        },
        { id: 'referencias', label: 'Registrar Referencia', path: '/registrarReferencia', priority: 5 },
        { 
          id: 'contratos', 
          label: `Ver Contratos${isOtrosiArrendatario ? ' (Otrosi)' : ''}`, 
          path: '/VerContratosUsuario',
          badge: estaFirmadoArrendatario?.filter(c => !c?.estaFirmadoArrendatario)?.length || null,
          priority: 6
        },
        { id: 'novedades', label: 'Reportar Percances', path: '/ReporteNovedades', priority: 7 },
        { id: 'pagos', label: 'Subir Pagos', path: '/SubirPagoRecibosSeparados', priority: 8 }
      );
    }

    // ADMINISTRADOR activo
    if (belongsToGroup('administrador') && isAdminActive) {
      items.push(
        { id: 'register', label: 'Registrar Usuarios', path: '/register', priority: 2 },
        { 
          id: 'crearContratos', 
          label: 'Crear Contratos', 
          path: '/Crear/Contratos',
          badge: solicitudesPendientesContrato > 0 ? solicitudesPendientesContrato : null,
          badgeColor: 'green',
          priority: 3
        },
        { 
          id: 'gestionarSolicitudes', 
          label: 'Gestionar Solicitudes', 
          path: '/ver-solicitudes',
          badge: solicitudesPendientes > 0 ? solicitudesPendientes : null,
          badgeColor: 'red',
          priority: 4
        },
        { 
          id: 'revisarContratos', 
          label: 'Revisar Contratos', 
          path: '/Revisar/Contratos',
          badge: estaFirmadoArrendatario?.filter(c => c?.inconformidad_id)?.length || null,
          badgeColor: 'yellow',
          priority: 5
        },
        { id: 'reportesNovedades', label: 'Reportes Novedades', path: '/VerReporteNovedades', priority: 6 },
        { id: 'pagosServicios', label: 'Pagos Servicios', path: '/RevisarPagosServicios', priority: 7 },
        { 
          id: 'seguimientoPagos', 
          label: `Seguimiento Pagos${isOtrosi ? ' (Otrosi)' : ''}`, 
          path: '/SeguimientoApagos',
          priority: 8
        },
        { id: 'registrarCasas', label: 'Registrar Casas', path: '/register/Casas', priority: 9 }
      );
    }

    // PROPIETARIO
    if (belongsToGroup('propietario')) {
      items.push(
        { id: 'registrarCasasProp', label: 'Registrar Casas', path: '/register/Casas', priority: 2 },
        { id: 'verSolicitudesProp', label: 'Ver Solicitudes', path: '/ver-solicitudes', priority: 3 },
        { id: 'verCalificaciones', label: 'Ver Calificaciones', path: '/ver-calificaciones-arrendatario', priority: 4 },
        { id: 'calificar', label: 'Calificar Arrendatarios', path: '/calificar-arrendatarios', priority: 5 },
        { id: 'calificacionesProveedores', label: 'Calificaciones Proveedores', path: '/ver-calificaciones-proveedores', priority: 6 },
        { id: 'verReportesProp', label: 'Ver Reportes', path: '/ver-reportes', priority: 7 },
        { id: 'verPercances', label: 'Ver Percances', path: '/ver-percances', priority: 8 }
      );
    }

    // PROVEEDOR
    if (belongsToGroup('proveedor')) {
      items.push(
        { id: 'verReportesProv', label: 'Ver Reportes', path: '/ver-reportes', priority: 2 },
        { id: 'cotizar', label: 'Cotizar Reparaciones', path: '/cotizar-reparaciones', priority: 3 }
      );
    }

    return items.sort((a, b) => a.priority - b.priority);
  };

  // Función para calcular qué items mostrar y cuáles van al menú "Más"
  const calculateVisibleItems = () => {
    if (!navItemsRef.current) return;

    const container = navItemsRef.current;
    const containerWidth = container.offsetWidth;
    
    // Medir el ancho de cada item (aproximado)
    const items = getMenuItems();
    
    // Ancho reservado para el menú de usuario y espacios (aproximadamente 200px)
    const RESERVED_WIDTH = 200;
    // Ancho promedio de cada botón (aproximadamente 120-150px)
    const AVG_ITEM_WIDTH = 130;
    
    let availableWidth = containerWidth - RESERVED_WIDTH;
    let itemsThatFit = 0;
    let totalWidth = 0;
    
    for (let i = 0; i < items.length; i++) {
      // Estimación del ancho basada en la longitud del texto
      const estimatedWidth = Math.min(200, Math.max(80, items[i].label.length * 12));
      if (totalWidth + estimatedWidth <= availableWidth) {
        totalWidth += estimatedWidth;
        itemsThatFit++;
      } else {
        break;
      }
    }
    
    // Mostrar al menos 2 items
    itemsThatFit = Math.max(2, itemsThatFit);
    
    if (itemsThatFit >= items.length) {
      // Todos los items caben
      setItemsToShow(items);
      setItemsInMore([]);
      setShowMoreButton(false);
    } else {
      // Algunos items no caben
      setItemsToShow(items.slice(0, itemsThatFit - 1));
      setItemsInMore(items.slice(itemsThatFit - 1));
      setShowMoreButton(true);
    }
  };

  // Efecto para manejar el resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(calculateVisibleItems, 100);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    const observer = new ResizeObserver(handleResize);
    if (navItemsRef.current) {
      observer.observe(navItemsRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [solicitudesPendientes, solicitudesPendientesContrato, userRole, isAdminActive, isOtrosi, isOtrosiArrendatario, estaFirmadoArrendatario]);

  // Contar solicitudes aceptadas pendientes
  const contarSolicitudesAceptadasPendientes = async () => {
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) return;

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/solicitudes/aceptadas/no-atendidas/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSolicitudesPendientesContrato(data.total || 0);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Verificar estado del administrador
  useEffect(() => {
    if (belongsToGroup('administrador')) {
      const isActive = currentUser?.is_active === true || currentUser?.activo === true;
      setIsAdminActive(isActive);
    } else {
      setIsAdminActive(false);
    }
  }, [currentUser, belongsToGroup]);

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem('user')) || {};
        const role = userData.groups ? userData.groups[0] : null;
        const id = userData.id;

        setUserRole(role);
        setUserId(id);

        if (role === 'administrador') {
          try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/solicitudes-pendientes/`, {
              headers: { 'Authorization': `Token ${localStorage.getItem('token')}` },
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              setSolicitudesPendientes(data.solicitudes_pendientes || 0);
            }
            await contarSolicitudesAceptadasPendientes();
          } catch (error) {
            console.error(error);
          }
        }

        if (role === 'arrendatario' && id) {
          try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/solicitudes/arrendatario/${id}/pendientes/`, {
              headers: { 'Authorization': `Token ${localStorage.getItem('token')}` },
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              setSolicitudesPendientes(data.solicitudes_pendientes || 0);
            }
          } catch (error) {
            console.error(error);
          }

          try {
            const contratosResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/contratosActivosArrendatario/?arrendatario_id=${id}`, {
              headers: { 'Authorization': `Token ${localStorage.getItem('token')}` },
              credentials: 'include',
            });
            if (contratosResponse.ok) {
              const data = await contratosResponse.json();
              setEstaFirmadoArrendatario(data);
            }
          } catch (error) {
            console.error(error);
          }

          try {
            const otrosiResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/contratos_arrendatarios_otrosi/${id}`, {
              headers: { 'Authorization': `Token ${localStorage.getItem('token')}` },
              credentials: 'include',
            });
            if (otrosiResponse.ok) {
              const data = await otrosiResponse.json();
              setIsOtrosiArrendatario(data.existe_contrato || false);
            }
          } catch (error) {
            console.error(error);
          }
        }

        if (role === 'administrador') {
          try {
            const inconformesResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/contratos-inconformes/`, {
              headers: { 'Authorization': `Token ${localStorage.getItem('token')}` },
              credentials: 'include',
            });
            if (inconformesResponse.ok) {
              const data = await inconformesResponse.json();
              setEstaFirmadoArrendatario(data);
            }
          } catch (error) {
            console.error(error);
          }

          try {
            const otrosiActivosResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/contratos-activos-otrosi/`, {
              headers: { 'Authorization': `Token ${localStorage.getItem('token')}` },
              credentials: 'include',
            });
            if (otrosiActivosResponse.ok) {
              const data = await otrosiActivosResponse.json();
              setIsOtrosi(data.existe_contrato || false);
            }
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn || localStorage.getItem('user')) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Recalcular cuando cambian los datos
  useEffect(() => {
    setTimeout(calculateVisibleItems, 100);
  }, [solicitudesPendientes, solicitudesPendientesContrato, isAdminActive, isOtrosi, isOtrosiArrendatario, estaFirmadoArrendatario]);

  // Cargar usuario de localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setLocalUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const handleSalir = () => {
    handleLogout();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setMoreMenuOpen(false);
    navigate("/");
  };

  const handleUpdate = (id) => {
    if (id && userRole) {
      navigate(`/EditarUsuarios/${userRole}/${id}`);
      setMobileMenuOpen(false);
      setUserMenuOpen(false);
      setMoreMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setUserMenuOpen(false);
      setMoreMenuOpen(false);
    }
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setMoreMenuOpen(false);
  };

  const toggleMoreMenu = () => {
    setMoreMenuOpen(!moreMenuOpen);
    setUserMenuOpen(false);
  };

  // Componente de item del menú
  const MenuItemLink = ({ item, onClick, isMobile = false }) => {
    const badgeColor = item.badgeColor === 'green' ? 'bg-green-500' : 
                      item.badgeColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500';
    
    if (isMobile) {
      return (
        <Link
          to={item.path}
          className="relative block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClick}
        >
          {item.label}
          {item.badge && item.badge > 0 && (
            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor} text-white`}>
              {item.badge}
            </span>
          )}
        </Link>
      );
    }

    return (
      <Link
        to={item.path}
        className="relative text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
        onClick={onClick}
      >
        {item.label}
        {item.badge && item.badge > 0 && (
          <span className={`absolute -top-1 -right-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor} text-white`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-white font-bold text-xl">Inmobiliaria CL</div>
            <div className="animate-pulse bg-white/20 h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (!currentUser && !isLoggedIn) {
    return (
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-white font-bold text-xl">
                Inmobiliaria CL
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium">Inicio</Link>
              <Link to="/registerBasico/" className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium">Registrarse</Link>
              <Link to="/login" className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium shadow-md">Iniciar Sesión</Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const username = currentUser?.username || user?.username || 'Usuario';
  const userInitial = username.charAt(0).toUpperCase();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fila única para desktop - Logo + items + usuario */}
        <div className="hidden md:flex justify-between items-center h-16">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl">
              Inmobiliaria CL
            </Link>
          </div>

          {/* Contenedor de items del menú - VISIBLE SOLO UNA VEZ */}
          <div className="flex items-center space-x-1 flex-1 justify-end" ref={navItemsRef}>
            {itemsToShow.map((item) => (
              <MenuItemLink 
                key={item.id} 
                item={item} 
                onClick={() => setMobileMenuOpen(false)} 
              />
            ))}
            
            {/* Botón "Más" para items ocultos */}
            {showMoreButton && itemsInMore.length > 0 && (
              <div className="relative">
                <button
                  onClick={toggleMoreMenu}
                  className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <span>Más</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown de items ocultos */}
                {moreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                    {itemsInMore.map((item) => (
                      <MenuItemLink 
                        key={item.id} 
                        item={item} 
                        isMobile 
                        onClick={() => {
                          setMoreMenuOpen(false);
                          setMobileMenuOpen(false);
                        }} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="relative flex-shrink-0 ml-4">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{userInitial}</span>
              </div>
              <span className="hidden lg:inline">{username}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-600">Bienvenido,</p>
                  <p className="font-semibold text-gray-800">{username}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Rol: <span className="font-medium">{groups.join(', ') || 'sin rol'}</span>
                  </p>
                  {belongsToGroup('administrador') && (
                    <p className="text-xs mt-1">
                      Estado: <span className={`font-medium ${isAdminActive ? 'text-green-600' : 'text-red-600'}`}>
                        {isAdminActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  )}
                </div>

                {userId && (
                  <button 
                    onClick={() => handleUpdate(userId)} 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Actualizar mi información
                  </button>
                )}

                <div className="border-t border-gray-100 mt-1">
                  <button 
                    onClick={handleSalir} 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button y menú móvil */}
        <div className="md:hidden flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              Inmobiliaria CL
            </Link>
          </div>
          
          <button 
            onClick={toggleMobileMenu} 
            className="text-white hover:bg-white/10 p-2 rounded-md transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white rounded-lg shadow-xl mt-2 py-2 max-h-96 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">Bienvenido,</p>
              <p className="font-semibold text-gray-800">{username}</p>
              <p className="text-xs text-gray-500 mt-1">
                Rol: <span className="font-medium">{groups.join(', ') || 'sin rol'}</span>
              </p>
              {belongsToGroup('administrador') && (
                <p className="text-xs mt-1">
                  Estado: <span className={`font-medium ${isAdminActive ? 'text-green-600' : 'text-red-600'}`}>
                    {isAdminActive ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              {getMenuItems().map((item) => (
                <MenuItemLink key={item.id} item={item} isMobile onClick={() => setMobileMenuOpen(false)} />
              ))}

              {userId && (
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button 
                    onClick={() => handleUpdate(userId)} 
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Actualizar mi información
                  </button>
                </div>
              )}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button 
                  onClick={handleSalir} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;