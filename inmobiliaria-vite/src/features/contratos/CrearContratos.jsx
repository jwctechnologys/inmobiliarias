import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../utils/csrf';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const CrearContratos = () => {
    const [solicitudesAceptadas, setSolicitudesAceptadas] = useState([]);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    const [cargando, setCargando] = useState(false);
    const [tipoContratoSeleccionado, setTipoContratoSeleccionado] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    useEffect(() => {
        cargarSolicitudesAceptadas();
    }, []);

    const cargarSolicitudesAceptadas = () => {
        setCargando(true);
        fetch(`${API_URL}/api/obtener-aceptadas/`)
            .then((response) => response.json())
            .then((data) => {
                setSolicitudesAceptadas(data);
                console.log('Solicitudes aceptadas', data);
                setCargando(false);
            })
            .catch((error) => {
                console.error("Error al obtener solicitudes aceptadas:", error);
                setCargando(false);
            });
    };

    const handleSeleccionarSolicitud = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setTipoContratoSeleccionado('');
    };

    // En CrearContratos.jsx, actualiza la función handleCrearContrato
    const handleCrearContrato = (tipoContrato) => {
        if (!solicitudSeleccionada) {
            alert('Por favor, selecciona una solicitud primero');
            return;
        }

        // Solo enviamos el ID de la solicitud
        const contratoData = {
            solicitudId: solicitudSeleccionada.id
        };

        switch (tipoContrato) {
            case 'localVivienda':
                navigate('/contratos/nuevoLocalVivienda', { state: { solicitud: contratoData } });
                break;
            case 'vivienda':
                navigate('/contratos/nuevoVivienda', { state: { solicitud: contratoData } });
                break;
            case 'comercial':
                navigate('/contratos/nuevoComercial', { state: { solicitud: contratoData } });
                break;
            default:
                break;
        }
    };

    const formatTipoPropiedad = (tipo) => {
        const tipos = {
            'vivienda': 'Vivienda',
            'local': 'Local Comercial',
            'oficina': 'Oficina',
            'bodega': 'Bodega'
        };
        return tipos[tipo] || tipo;
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 font-sans">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Crear Nuevo Contrato
                </h1>
                <p className="text-gray-500 text-base">
                    Selecciona una solicitud aceptada para generar el contrato
                </p>
            </div>

            {cargando ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500">Cargando solicitudes...</p>
                </div>
            ) : (
                <>
                    {/* Solicitudes Aceptadas */}
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <h2 className="text-2xl font-bold text-gray-700">
                                Solicitudes Aceptadas
                            </h2>
                            <button
                                onClick={cargarSolicitudesAceptadas}
                                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium"
                                title="Actualizar lista"
                            >
                                🔄 Actualizar
                            </button>
                        </div>

                        {solicitudesAceptadas.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {solicitudesAceptadas.map((solicitud) => (
                                    <div
                                        key={solicitud.id}
                                        className={`bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${solicitudSeleccionada?.id === solicitud.id
                                            ? 'border-green-500 bg-gradient-to-br from-white to-green-50 shadow-md'
                                            : 'border-gray-200 hover:border-blue-400'
                                            }`}
                                        onClick={() => handleSeleccionarSolicitud(solicitud)}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                {formatTipoPropiedad(solicitud.tipo)}
                                            </span>
                                            {solicitudSeleccionada?.id === solicitud.id && (
                                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-fadeIn">
                                                    ✓ Seleccionada
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                                                    Dirección
                                                </label>
                                                <p className="text-gray-800 font-medium mt-1">
                                                    {solicitud.direccion}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                                                    Arrendatario
                                                </label>
                                                <p className="text-gray-800 mt-1">
                                                    {solicitud.nombres_arrendatario} {solicitud.apellidos_arrendatario}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                                                        Teléfono
                                                    </label>
                                                    <p className="text-gray-800 mt-1">
                                                        {solicitud.celular}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                                                        Email
                                                    </label>
                                                    <p className="text-gray-800 mt-1 truncate">
                                                        {solicitud.email || 'No especificado'}
                                                    </p>
                                                </div>
                                            </div>

                                            {solicitud.fecha_aceptacion && (
                                                <div>
                                                    <label className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                                                        Fecha de aceptación
                                                    </label>
                                                    <p className="text-gray-800 mt-1">
                                                        {new Date(solicitud.fecha_aceptacion).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <div className="text-6xl mb-4">📋</div>
                                <p className="text-gray-500 text-lg mb-2">
                                    No hay solicitudes aceptadas disponibles
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Las solicitudes aceptadas aparecerán aquí para crear contratos
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tipos de Contrato */}
                    {solicitudSeleccionada && (
                        <div className="mt-12 animate-fadeIn">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                                    Seleccionar Tipo de Contrato
                                </h2>
                                <p className="text-gray-600">
                                    Contrato para: <strong className="text-gray-800">
                                        {solicitudSeleccionada.nombres_arrendatario} {solicitudSeleccionada.apellidos_arrendatario}
                                    </strong>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Local/Vivienda */}
                                <div
                                    className={`bg-white border-2 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${tipoContratoSeleccionado === 'localVivienda'
                                        ? 'border-blue-500 bg-gradient-to-br from-white to-blue-50'
                                        : 'border-gray-200 hover:border-blue-400'
                                        }`}
                                    onClick={() => setTipoContratoSeleccionado('localVivienda')}
                                    onDoubleClick={() => handleCrearContrato('localVivienda')}
                                >
                                    <div className="text-5xl mb-3">🏠</div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Local / Vivienda
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Contrato para local comercial o vivienda particular
                                    </p>
                                    <button
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                                        onClick={() => handleCrearContrato('localVivienda')}
                                    >
                                        Crear Contrato →
                                    </button>
                                </div>

                                {/* Vivienda */}
                                <div
                                    className={`bg-white border-2 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${tipoContratoSeleccionado === 'vivienda'
                                        ? 'border-blue-500 bg-gradient-to-br from-white to-blue-50'
                                        : 'border-gray-200 hover:border-blue-400'
                                        }`}
                                    onClick={() => setTipoContratoSeleccionado('vivienda')}
                                    onDoubleClick={() => handleCrearContrato('vivienda')}
                                >
                                    <div className="text-5xl mb-3">🏘️</div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Vivienda
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Contrato exclusivo para vivienda residencial
                                    </p>
                                    <button
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                                        onClick={() => handleCrearContrato('vivienda')}
                                    >
                                        Crear Contrato →
                                    </button>
                                </div>

                                {/* Comercial */}
                                <div
                                    className={`bg-white border-2 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${tipoContratoSeleccionado === 'comercial'
                                        ? 'border-blue-500 bg-gradient-to-br from-white to-blue-50'
                                        : 'border-gray-200 hover:border-blue-400'
                                        }`}
                                    onClick={() => setTipoContratoSeleccionado('comercial')}
                                    onDoubleClick={() => handleCrearContrato('comercial')}
                                >
                                    <div className="text-5xl mb-3">🏢</div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Comercial
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Contrato para locales comerciales y oficinas
                                    </p>
                                    <button
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                                        onClick={() => handleCrearContrato('comercial')}
                                    >
                                        Crear Contrato →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CrearContratos;