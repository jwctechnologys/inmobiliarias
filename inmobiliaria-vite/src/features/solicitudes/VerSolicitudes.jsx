// VerSolicitudes.jsx - Versión modificada
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCsrfToken } from "../../utils/csrf";
import SolicitudDetalle from './SolicitudDetalle';

function VerSolicitudes() {
    const { user } = useAuth();

    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    const [tipoVista, setTipoVista] = useState('casa'); // 'casa' o 'usuario'
    const [debugInfo, setDebugInfo] = useState(null);

    // Estados de expansión - usando objetos para soportar múltiples elementos abiertos
    const [expandedGrupos, setExpandedGrupos] = useState({});
    const [expandedSolicitudes, setExpandedSolicitudes] = useState({});
    const [expandedDetalles, setExpandedDetalles] = useState({});

    // modal para cambio de estado
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [comentario, setComentario] = useState('');
    const [casaActual, setCasaActual] = useState(null);

    // Modal de confirmación para cancelar
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [solicitudToCancel, setSolicitudToCancel] = useState(null);
    const [cancelComentario, setCancelComentario] = useState('');

    // ==================== FUNCIONES EXISTENTES ====================
    const [solicitudDetalles, setSolicitudDetalles] = useState({});

    const obtenerDetalleSolicitud = async (solicitudId) => {
        // Si ya tenemos los detalles, solo alternar la visibilidad
        if (solicitudDetalles[solicitudId]) {
            toggleDetalle(solicitudId);
            return;
        }

        try {
            console.log(`Obteniendo detalles de solicitud ID: ${solicitudId}`);

            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/solicitud-publica/${solicitudId}/`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            // Verificar si la respuesta es OK
            if (!response.ok) {
                // Intentar obtener el mensaje de error del backend
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                    if (errorData.details) {
                        errorMessage += ` - ${errorData.details}`;
                    }
                } catch (e) {
                    // Si no se puede parsear el JSON, usar el mensaje por defecto
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Datos obtenidos:', data);

            setSolicitudDetalles(prev => ({
                ...prev,
                [solicitudId]: data
            }));

            // Expandir el detalle
            setExpandedDetalles(prev => ({
                ...prev,
                [solicitudId]: true
            }));

        } catch (error) {
            console.error('Error al obtener detalles:', error);
            alert(`❌ Error al cargar los detalles de la solicitud:\n${error.message}`);
        }
    };
    const getUserRole = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            const role = userData.groups ? userData.groups[0] : null;
            setUserRole(role);
            return role;
        }
        return null;
    };

    const formatFecha = (fechaString) => {
        if (!fechaString) return 'Fecha no disponible';
        try {
            let fecha;
            if (typeof fechaString === 'string') {
                fecha = new Date(fechaString);
            } else if (fechaString instanceof Date) {
                fecha = fechaString;
            } else if (typeof fechaString === 'number') {
                fecha = new Date(fechaString);
            } else {
                return 'Fecha no disponible';
            }
            if (isNaN(fecha.getTime())) {
                return 'Fecha no disponible';
            }
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha no disponible';
        }
    };

    const getFechaSolicitud = (solicitud) => {
        return solicitud.fecha_solicitud ||
            solicitud.created_at ||
            solicitud.fecha_creacion ||
            solicitud.fecha ||
            solicitud.date_created ||
            solicitud.timestamp;
    };

    const ordenarPorFecha = (solicitudesArray) => {
        if (!solicitudesArray || !Array.isArray(solicitudesArray)) return [];
        return [...solicitudesArray].sort((a, b) => {
            const fechaA = new Date(getFechaSolicitud(a) || 0);
            const fechaB = new Date(getFechaSolicitud(b) || 0);
            return fechaB - fechaA;
        });
    };

    const filtrarNoRevisadas = (solicitudesArray) => {
        if (!solicitudesArray || !Array.isArray(solicitudesArray)) return [];
        return solicitudesArray.filter(s => {
            return s.solicitudRevisada === false || s.solicitudRevisada === null || s.solicitudRevisada === undefined;
        });
    };

    // ==================== NUEVAS FUNCIONES DE AGRUPACIÓN ====================

    const agruparPorCasa = (data) => {
        if (!data || !Array.isArray(data)) return [];
        const agrupadas = {};

        data.forEach((s) => {
            if (!s.direccion) return;

            if (!agrupadas[s.direccion]) {
                agrupadas[s.direccion] = {
                    id: s.direccion,
                    direccion: s.direccion,
                    casa_id: s.casa_id,
                    disponible: s.disponible,
                    casa_arrendada: s.casa_arrendada || false,
                    total: 0,
                    solicitudes: []
                };
            }

            agrupadas[s.direccion].total += 1;
            agrupadas[s.direccion].solicitudes.push(s);
        });

        Object.values(agrupadas).forEach(casa => {
            casa.solicitudes = ordenarPorFecha(casa.solicitudes);
        });

        return Object.values(agrupadas);
    };

    const agruparPorUsuario = (data) => {
        if (!data || !Array.isArray(data)) return [];
        const agrupadas = {};

        data.forEach((s) => {
            const key = `${s.nombres_arrendatario || 'Usuario'} ${s.apellidos_arrendatario || ''}`;
            const userId = s.arrendatario_id || s.usuario_id || 'unknown';
            const fullKey = `${key}_${userId}`;

            if (!agrupadas[fullKey]) {
                agrupadas[fullKey] = {
                    id: fullKey,
                    nombre: key,
                    usuario_id: userId,
                    total: 0,
                    solicitudes: []
                };
            }

            agrupadas[fullKey].total += 1;
            agrupadas[fullKey].solicitudes.push(s);
        });

        Object.values(agrupadas).forEach(usuario => {
            usuario.solicitudes = ordenarPorFecha(usuario.solicitudes);
        });

        return Object.values(agrupadas);
    };

    const tieneSolicitudAceptada = (solicitudes) => {
        return solicitudes.some(s => s.estado === 'aceptada');
    };

    const getSolicitudAceptada = (solicitudes) => {
        return solicitudes.find(s => s.estado === 'aceptada');
    };

    // ==================== FUNCIONES DE EXPANSIÓN ====================

    const toggleGrupo = (grupoId) => {
        setExpandedGrupos(prev => ({
            ...prev,
            [grupoId]: !prev[grupoId]
        }));
    };

    const toggleSolicitud = (solicitudId) => {
        setExpandedSolicitudes(prev => ({
            ...prev,
            [solicitudId]: !prev[solicitudId]
        }));
    };

    const toggleDetalle = (solicitudId) => {
        setExpandedDetalles(prev => ({
            ...prev,
            [solicitudId]: !prev[solicitudId]
        }));
    };

    const cerrarTodos = () => {
        setExpandedGrupos({});
        setExpandedSolicitudes({});
        setExpandedDetalles({});
    };

    // ==================== FETCH SOLICITUDES ====================

    const fetchSolicitudes = async () => {
        const role = getUserRole();
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setLoading(true);
        setError(null);

        try {
            let url;
            let response;
            let data;

            if (role === 'arrendatario') {
                url = `${import.meta.env.VITE_BASE_URL}/api/mis-solicitudes/?usuario_id=${userData?.id}`;
                if (estadoFiltro) {
                    url += `&estado=${estadoFiltro}`;
                }

                response = await fetch(url, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Error al cargar tus solicitudes: ${response.status}`);
                }

                data = await response.json();
                let solicitudesArray = Array.isArray(data) ? data : (data.results || []);
                solicitudesArray = filtrarNoRevisadas(solicitudesArray);
                const solicitudesOrdenadas = ordenarPorFecha(solicitudesArray);
                setSolicitudes(solicitudesOrdenadas);
                setDebugInfo({
                    total: solicitudesOrdenadas.length,
                    filtro: 'solicitudRevisada=False'
                });
            }
            else if (role === 'administrador' || role === 'propietario') {
                url = `${import.meta.env.VITE_BASE_URL}/api/solicitudes/`;
                const params = new URLSearchParams();
                if (estadoFiltro) {
                    params.append('estado', estadoFiltro);
                }
                if ([...params].length > 0) {
                    url += `?${params.toString()}`;
                }

                response = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Error al cargar solicitudes: ${response.status}`);
                }

                data = await response.json();
                let solicitudesArray = data.results || data;
                if (!Array.isArray(solicitudesArray)) {
                    console.error('Los datos no son un array:', solicitudesArray);
                    setSolicitudes([]);
                    setDebugInfo({ error: 'Formato de datos incorrecto', data: solicitudesArray });
                    return;
                }

                const solicitudesFiltradas = filtrarNoRevisadas(solicitudesArray);

                let solicitudesAgrupadas;
                if (tipoVista === 'usuario') {
                    solicitudesAgrupadas = agruparPorUsuario(solicitudesFiltradas);
                } else {
                    solicitudesAgrupadas = agruparPorCasa(solicitudesFiltradas);
                }

                setSolicitudes(solicitudesAgrupadas);
                setDebugInfo({
                    totalSolicitudes: solicitudesFiltradas.length,
                    totalGrupos: solicitudesAgrupadas.length,
                    tipoVista: tipoVista,
                    filtro: 'solicitudRevisada=False'
                });
            }

        } catch (err) {
            console.error('Error en fetchSolicitudes:', err);
            setError(err.message);
            setDebugInfo({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, [estadoFiltro, tipoVista]);

    // ==================== FUNCIONES DE ESTADO (existentes) ====================

    const cambiarEstado = async () => {
        // Verificar si ya existe una solicitud aceptada para esta casa
        if (nuevoEstado === 'aceptada') {
            const casa = getCasaDeSolicitud(selectedSolicitud.id);
            if (casa && tieneSolicitudAceptada(casa.solicitudes)) {
                const solicitudAceptada = getSolicitudAceptada(casa.solicitudes);
                if (solicitudAceptada && solicitudAceptada.id !== selectedSolicitud.id) {
                    alert(`❌ Esta casa ya tiene una solicitud aceptada (${solicitudAceptada.nombres_arrendatario} ${solicitudAceptada.apellidos_arrendatario}). No se puede aceptar otra solicitud para la misma casa.`);
                    return;
                }
            }
            const confirmar = window.confirm('¿Deseas continuar?');
            if (!confirmar) return;
        }

        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                alert('No se pudo obtener CSRF');
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/solicitudes/${selectedSolicitud.id}/cambiar_estado/`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        estado: nuevoEstado,
                        solicitudAtendida: true,
                        comentario: comentario || '',
                        solicitudRevisada: true
                    })
                }
            );

            const data = await response.json();
            if (!response.ok) {
                console.error('Error backend:', data);
                alert(data.error || 'Error al cambiar estado');
                return;
            }

            alert(data.message || 'Estado actualizado correctamente');
            setModalOpen(false);
            setNuevoEstado('');
            setComentario('');
            setCasaActual(null);
            fetchSolicitudes();

        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        }
    };

    const cancelarSolicitud = async () => {
        if (!solicitudToCancel) return;
        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                alert('No se pudo obtener CSRF');
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/solicitudes/${solicitudToCancel.id}/cambiar_estado/`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        estado: 'cancelada',
                        comentario_estado: cancelComentario || 'Cancelada por el arrendatario',
                        solicitudRevisada: true
                    })
                }
            );

            const data = await response.json();
            if (!response.ok) {
                console.error('Error backend:', data);
                alert(data.error || 'Error al cancelar la solicitud');
                return;
            }

            alert('✅ Solicitud cancelada correctamente');
            setCancelModalOpen(false);
            setSolicitudToCancel(null);
            setCancelComentario('');
            fetchSolicitudes();

        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la cancelación');
        }
    };

    const getCasaDeSolicitud = (solicitudId) => {
        // Buscar en el array actual de solicitudes (agrupadas)
        for (const grupo of solicitudes) {
            if (grupo.solicitudes && grupo.solicitudes.some(s => s.id === solicitudId)) {
                return grupo;
            }
        }
        return null;
    };

    const isButtonDisabled = (solicitud, casa) => {
        if (casa?.casa_arrendada && solicitud.estado === 'pendiente') return true;
        if (solicitud.solicitudContratada) return true;
        return false;
    };

    const canCancel = (solicitud) => {
        return solicitud.estado === 'pendiente' && !solicitud.solicitudContratada && !solicitud.casa_arrendada;
    };

    const canChangeState = (solicitud, casa) => {
        return !isButtonDisabled(solicitud, casa);
    };

    const isAceptarDisabled = () => {
        if (!selectedSolicitud || !casaActual) return false;
        if (tieneSolicitudAceptada(casaActual.solicitudes)) {
            const solicitudAceptada = getSolicitudAceptada(casaActual.solicitudes);
            if (solicitudAceptada && solicitudAceptada.id !== selectedSolicitud.id) {
                return true;
            }
        }
        return false;
    };

    const getCasaStatusMessage = (casa) => {
        if (casa.casa_arrendada) {
            return {
                text: '🏠 CASA ARRENDADA',
                bgColor: 'bg-red-100',
                textColor: 'text-red-800',
                borderColor: 'border-red-300'
            };
        }
        if (casa.disponible === false) {
            return {
                text: '⚠️ Casa no disponible',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800',
                borderColor: 'border-yellow-300'
            };
        }
        return {
            text: '✅ Casa disponible',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            borderColor: 'border-green-300'
        };
    };

    const getCasaStatusForArrendatario = (solicitud) => {
        if (solicitud.casa_arrendada) {
            return {
                text: '🏠 Esta casa ya está arrendada',
                bgColor: 'bg-red-100',
                textColor: 'text-red-700'
            };
        }
        if (solicitud.disponible === false) {
            return {
                text: '⚠️ Esta casa no está disponible temporalmente',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-700'
            };
        }
        return null;
    };

    // ==================== RENDER ====================

    if (loading) return <div className="text-center mt-10">Cargando...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Solicitudes
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={cerrarTodos}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                    >
                        Cerrar todos
                    </button>
                </div>
            </div>

            {/* Selector de vista para admin/propietario */}
            {(userRole === 'administrador' || userRole === 'propietario') && (
                <div className="mb-4 flex flex-wrap gap-3 items-center">
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setTipoVista('casa')}
                            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${tipoVista === 'casa'
                                ? 'bg-purple-600 text-white'
                                : 'bg-transparent text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            🏠 Por casa
                        </button>
                        <button
                            onClick={() => setTipoVista('usuario')}
                            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${tipoVista === 'usuario'
                                ? 'bg-purple-600 text-white'
                                : 'bg-transparent text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            👤 Por usuario
                        </button>
                    </div>
                    <span className="text-sm text-gray-500">
                        {solicitudes.length} {tipoVista === 'casa' ? 'casas' : 'usuarios'} con solicitudes
                    </span>
                </div>
            )}

            {/* Indicador de filtro activo */}
            <div className="mb-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    🔍 Mostrando solicitudes pendientes de revisión
                </span>
            </div>

            {/* FILTRO */}
            <div className="mb-6">
                <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none p-2 rounded-lg shadow-sm"
                >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">📋 Pendiente</option>
                    <option value="aceptada">✅ Aceptada</option>
                    <option value="rechazada">❌ Rechazada</option>
                    <option value="cancelada">🚫 Cancelada</option>
                </select>
            </div>

            {/* ADMIN / PROPIETARIO */}
            {(userRole === 'administrador' || userRole === 'propietario') && (
                <>
                    {solicitudes.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No hay solicitudes pendientes de revisión
                        </div>
                    ) : (
                        solicitudes.map((grupo, index) => {
                            const grupoId = grupo.id || index;
                            const isExpanded = expandedGrupos[grupoId] || false;
                            const esCasa = tipoVista === 'casa';
                            const status = esCasa ? getCasaStatusMessage(grupo) : null;
                            const tieneAceptada = esCasa ? tieneSolicitudAceptada(grupo.solicitudes) : false;
                            const solicitudAceptada = esCasa ? getSolicitudAceptada(grupo.solicitudes) : null;

                            return (
                                <div
                                    key={grupoId}
                                    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 mb-5 ${status?.borderColor || 'border border-gray-200'}`}
                                >
                                    {/* Cabecera del grupo - click para expandir/colapsar */}
                                    <div
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => toggleGrupo(grupoId)}
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-700">
                                                {esCasa
                                                    ? (grupo.direccion || 'Dirección no disponible')
                                                    : (grupo.nombre || 'Usuario no identificado')
                                                }
                                                {!esCasa && (
                                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                                        (ID: {grupo.usuario_id})
                                                    </span>
                                                )}
                                            </h3>
                                            {esCasa && status && (
                                                <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                                                    {status.text}
                                                </div>
                                            )}
                                            {esCasa && tieneAceptada && (
                                                <div className="mt-1 inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✅ Solicitud Aceptada
                                                </div>
                                            )}
                                            {!esCasa && (
                                                <div className="mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {grupo.total} solicitud{grupo.total !== 1 ? 'es' : ''}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                                                {grupo.total} solicitud{grupo.total !== 1 ? 'es' : ''}
                                            </span>
                                            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido expandido del grupo */}
                                    {isExpanded && (
                                        <div className="mt-4 space-y-3">
                                            {grupo.solicitudes.map((s) => {
                                                const solicitudId = s.id;
                                                const isSolicitudExpanded = expandedSolicitudes[solicitudId] || false;
                                                const isDetalleExpanded = expandedDetalles[solicitudId] || false;

                                                return (
                                                    <div
                                                        key={solicitudId}
                                                        className={`border rounded-lg p-4 ${s.estado === 'aceptada' ? 'bg-green-50 border-green-300' :
                                                            s.solicitudContratada ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                                                            } transition`}
                                                    >
                                                        {/* Cabecera de la solicitud - click para expandir/colapsar */}
                                                        <div
                                                            className="flex justify-between items-start cursor-pointer"
                                                            onClick={() => toggleSolicitud(solicitudId)}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                                    <p className="font-medium text-gray-800">
                                                                        {tipoVista === 'casa'
                                                                            ? `${s.nombres_arrendatario || 'Nombre no disponible'} ${s.apellidos_arrendatario || ''}`
                                                                            : `${s.direccion || 'Dirección no disponible'}`
                                                                        }
                                                                        {s.estado === 'aceptada' && (
                                                                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                                                                ✅ Aceptada
                                                                            </span>
                                                                        )}
                                                                        {s.solicitudContratada && (
                                                                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                                                                Contrato Activo
                                                                            </span>
                                                                        )}
                                                                        {s.solicitudRevisada === false && (
                                                                            <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                                                                                Pendiente Revisión
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        📅 {formatFecha(getFechaSolicitud(s))}
                                                                    </p>
                                                                </div>

                                                                <p className="text-sm mt-1">
                                                                    Estado:
                                                                    <span className={`ml-2 px-2 py-1 rounded text-white text-xs
                                                                        ${s.estado === 'pendiente' && 'bg-yellow-500'}
                                                                        ${s.estado === 'aceptada' && 'bg-green-600'}
                                                                        ${s.estado === 'rechazada' && 'bg-red-600'}
                                                                        ${s.estado === 'cancelada' && 'bg-gray-500'}
                                                                    `}>
                                                                        {s.estado || 'Desconocido'}
                                                                    </span>
                                                                </p>

                                                                {s.comentario_estado && (
                                                                    <p className="text-xs text-gray-500 mt-2">
                                                                        💬 {s.comentario_estado}
                                                                    </p>
                                                                )}

                                                                {tipoVista === 'casa' && tieneAceptada && s.estado === 'aceptada' && (
                                                                    <p className="text-xs text-green-600 mt-1 font-medium">
                                                                        ✓ Esta es la solicitud aceptada para esta casa
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="flex gap-2 ml-4">
                                                                {/* Botón ver detalle completo */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (expandedDetalles[solicitudId]) {
                                                                            toggleDetalle(solicitudId);
                                                                        } else {
                                                                            obtenerDetalleSolicitud(solicitudId);
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition"
                                                                >
                                                                    {expandedDetalles[solicitudId] ? '📄 Ocultar detalle' : '📄 Ver detalle'}
                                                                </button>

                                                                {/* Botón cambiar estado */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Buscar la casa para pasar al modal
                                                                        const casa = getCasaDeSolicitud(s.id);
                                                                        setSelectedSolicitud(s);
                                                                        setCasaActual(casa);
                                                                        setModalOpen(true);
                                                                        setNuevoEstado('');
                                                                        setComentario('');
                                                                    }}
                                                                    disabled={!canChangeState(s, grupo)}
                                                                    className={`px-3 py-1 rounded-lg text-sm transition ${!canChangeState(s, grupo)
                                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                                        : s.estado === 'aceptada'
                                                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        }`}
                                                                    title={s.estado === 'aceptada' ? 'Cambiar estado de solicitud aceptada' : 'Cambiar estado de solicitud'}
                                                                >
                                                                    Cambiar Estado
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Detalle completo de la solicitud (anidado) */}
                                                        {isDetalleExpanded && solicitudDetalles[solicitudId] && (
                                                            <SolicitudDetalle
                                                                solicitud={solicitudDetalles[solicitudId]}
                                                                casaInfo={tipoVista === 'casa' ? grupo : null}
                                                                onClose={() => toggleDetalle(solicitudId)}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </>
            )}

            {/* ARRENDATARIO */}
            {/* ARRENDATARIO */}
            {userRole === 'arrendatario' && (
                <div className="space-y-4">
                    {solicitudes.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No tienes solicitudes pendientes de revisión
                        </div>
                    ) : (
                        solicitudes.map((s) => {
                            const solicitudId = s.id;
                            const isDetalleExpanded = expandedDetalles[solicitudId] || false;
                            const casaStatus = getCasaStatusForArrendatario(s);

                            return (
                                <div
                                    key={solicitudId}
                                    className={`bg-white rounded-xl shadow-md p-5 border hover:shadow-lg transition ${s.estado === 'aceptada' ? 'border-green-300 bg-green-50' :
                                        s.solicitudContratada ? 'border-blue-300 bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                <h3 className="font-semibold text-gray-800">
                                                    {s.direccion || 'Dirección no disponible'}
                                                    {s.estado === 'aceptada' && (
                                                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                                            ✅ Aceptada
                                                        </span>
                                                    )}
                                                    {s.solicitudContratada && (
                                                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                                            Contrato Activo
                                                        </span>
                                                    )}
                                                    {s.solicitudRevisada === false && (
                                                        <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                                                            Pendiente Revisión
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    📅 {formatFecha(getFechaSolicitud(s))}
                                                </p>
                                            </div>

                                            {casaStatus && (
                                                <div className={`mb-2 inline-block px-2 py-1 rounded text-xs font-medium ${casaStatus.bgColor} ${casaStatus.textColor}`}>
                                                    {casaStatus.text}
                                                </div>
                                            )}

                                            <p className="text-sm mt-2">
                                                Estado:
                                                <span className={`ml-2 px-2 py-1 rounded text-white text-xs
                                        ${s.estado === 'pendiente' && 'bg-yellow-500'}
                                        ${s.estado === 'aceptada' && 'bg-green-600'}
                                        ${s.estado === 'rechazada' && 'bg-red-600'}
                                        ${s.estado === 'cancelada' && 'bg-gray-500'}
                                    `}>
                                                    {s.estado || 'Desconocido'}
                                                </span>
                                            </p>

                                            {s.comentario_estado && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    💬 {s.comentario_estado}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => {
                                                    if (expandedDetalles[solicitudId]) {
                                                        toggleDetalle(solicitudId);
                                                    } else {
                                                        obtenerDetalleSolicitud(solicitudId);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition"
                                            >
                                                {expandedDetalles[solicitudId] ? '📄 Ocultar detalle' : '📄 Ver detalle'}
                                            </button>

                                            {canCancel(s) && (
                                                <button
                                                    onClick={() => {
                                                        setSolicitudToCancel(s);
                                                        setCancelModalOpen(true);
                                                        setCancelComentario('');
                                                    }}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                                                >
                                                    Cancelar Solicitud
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* ============================================== */}
                                    {/* DETALLE COMPLETO PARA ARRENDATARIO - CORREGIDO */}
                                    {/* ============================================== */}
                                    {isDetalleExpanded && solicitudDetalles[solicitudId] && (
                                        <SolicitudDetalle
                                            solicitud={solicitudDetalles[solicitudId]}
                                            casaInfo={solicitudDetalles[solicitudId]?.casa || null}
                                            onClose={() => toggleDetalle(solicitudId)}
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* MODAL DE CAMBIO DE ESTADO (existentes) */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-96 p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Cambiar estado de solicitud
                        </h2>

                        <p className="text-sm text-gray-600 mb-3">
                            Para: {selectedSolicitud?.nombres_arrendatario} {selectedSolicitud?.apellidos_arrendatario}
                        </p>

                        <p className="text-xs text-gray-500 mb-3">
                            📅 Fecha: {formatFecha(getFechaSolicitud(selectedSolicitud))}
                        </p>

                        <p className="text-xs text-gray-500 mb-3">
                            Estado actual:
                            <span className={`ml-2 px-2 py-0.5 rounded text-white text-xs
                                ${selectedSolicitud?.estado === 'pendiente' && 'bg-yellow-500'}
                                ${selectedSolicitud?.estado === 'aceptada' && 'bg-green-600'}
                                ${selectedSolicitud?.estado === 'rechazada' && 'bg-red-600'}
                                ${selectedSolicitud?.estado === 'cancelada' && 'bg-gray-500'}
                            `}>
                                {selectedSolicitud?.estado || 'Desconocido'}
                            </span>
                        </p>

                        {casaActual && tieneSolicitudAceptada(casaActual.solicitudes) && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm text-yellow-700">
                                ⚠️ Esta casa ya tiene una solicitud aceptada. No puedes aceptar otra solicitud para esta misma casa.
                            </div>
                        )}

                        <select
                            value={nuevoEstado}
                            onChange={(e) => setNuevoEstado(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                        >
                            <option value="">Seleccione nuevo estado</option>

                            {!isAceptarDisabled() ? (
                                <option value="aceptada">✅ Aceptar solicitud</option>
                            ) : (
                                <option value="aceptada" disabled className="text-gray-400">
                                    ✅ Aceptar solicitud (No disponible - ya hay una aceptada)
                                </option>
                            )}

                            <option value="rechazada">❌ Rechazar solicitud</option>
                            <option value="cancelada">🚫 Cancelar solicitud</option>
                        </select>

                        <textarea
                            placeholder="Comentario (opcional)"
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                            rows="3"
                        />

                        {nuevoEstado === 'aceptada' && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm text-yellow-700">
                                ⚠️ Al aceptar, la casa se marcará como ARRENDADA y las demás solicitudes pendientes serán RECHAZADAS
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setModalOpen(false);
                                    setCasaActual(null);
                                    setNuevoEstado('');
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={cambiarEstado}
                                disabled={!nuevoEstado}
                                className={`px-4 py-2 rounded-lg transition ${nuevoEstado ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CANCELACIÓN (existente) */}
            {cancelModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-96 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cancelar Solicitud</h2>
                        <p className="text-sm text-gray-600 mb-2">¿Cancelar solicitud para:</p>
                        <p className="font-medium text-gray-800 mb-3">{solicitudToCancel?.direccion}</p>
                        <p className="text-xs text-gray-500 mb-3">📅 Fecha: {formatFecha(getFechaSolicitud(solicitudToCancel))}</p>

                        <textarea
                            placeholder="Motivo (opcional)"
                            value={cancelComentario}
                            onChange={(e) => setCancelComentario(e.target.value)}
                            className="w-full border rounded-lg p-2 mb-4"
                            rows="3"
                        />

                        <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 text-sm text-red-700">
                            ⚠️ Esta acción no se puede deshacer
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setCancelModalOpen(false);
                                    setSolicitudToCancel(null);
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                            >
                                Volver
                            </button>
                            <button
                                onClick={cancelarSolicitud}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            >
                                Sí, Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VerSolicitudes;