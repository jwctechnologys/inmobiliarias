import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../../utils/csrf';

const RevisarContratos = () => {
    const [contratos, setContratos] = useState([]);
    const [contratosActivos, setContratosActivos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState('todos');
    const [csrfToken, setCsrfToken] = useState('');
    const navigate = useNavigate();

    // Obtener CSRF token
    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    // ============================================================
    // CARGAR DATOS CON AUTENTICACIÓN
    // ============================================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                setCargando(true);
                
                // 🔥 IMPORTANTE: Incluir credenciales y token CSRF
                const options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    credentials: 'include', // ← Enviar cookies de sesión
                };

                // 1. Cargar contratos con inconformidades
                const responseInconformes = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/api/contratos-inconformes/`,
                    options
                );
                
                if (responseInconformes.ok) {
                    const dataInconformes = await responseInconformes.json();
                    console.log("📋 Contratos con inconformidad:", dataInconformes);
                    setContratos(dataInconformes || []);
                } else {
                    console.error('❌ Error al cargar inconformes:', await responseInconformes.text());
                    setContratos([]);
                }

                // 2. Cargar todos los contratos activos
                const responseActivos = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/api/contratos/activos/`,
                    options
                );
                
                if (responseActivos.ok) {
                    const dataActivos = await responseActivos.json();
                    console.log("📋 Contratos activos:", dataActivos);
                    setContratosActivos(dataActivos || []);
                } else {
                    console.error('❌ Error al cargar activos:', await responseActivos.text());
                    setContratosActivos([]);
                }
            } catch (error) {
                console.error('❌ Error al cargar los datos:', error);
                setContratos([]);
                setContratosActivos([]);
            } finally {
                setCargando(false);
            }
        };

        // Solo ejecutar si tenemos el CSRF token
        if (csrfToken) {
            fetchData();
        }
    }, [csrfToken]);

    // ============================================================
    // FILTRAR CONTRATOS
    // ============================================================
    const contratosFiltrados = () => {
        // Asegurar que contratosActivos sea un array
        const activos = Array.isArray(contratosActivos) ? contratosActivos : [];
        const inconformes = Array.isArray(contratos) ? contratos : [];
        
        if (filtro === 'todos') return activos;
        if (filtro === 'activos') return activos.filter(c => c.contrato_Activo === true);
        if (filtro === 'inconformes') return inconformes;
        if (filtro === 'vencidos') {
            const hoy = new Date();
            return activos.filter(c => {
                const fechaFin = new Date(c.fechafin);
                return fechaFin < hoy;
            });
        }
        return activos;
    };

    // ============================================================
    // NAVEGAR A EDICIÓN
    // ============================================================
    const handleEditarContrato = (contratoId) => {
        navigate(`/editarcontratovivienda/${contratoId}`);
    };

    // ============================================================
    // NAVEGAR A VER DETALLE
    // ============================================================
    const handleVerDetalle = (contratoId) => {
        navigate(`/imprime-contrato/${contratoId}`);
    };

    // ============================================================
    // MARCAR INCONFORMIDAD COMO SOLUCIONADA
    // ============================================================
    const handleMarcarSolucionada = async (inconformidadId) => {
        if (!inconformidadId) {
            alert('❌ No se puede marcar: falta el ID de la inconformidad');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/reporte-inconformidad/${inconformidadId}/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify({
                        inconformidadSolucionada: true,
                    }),
                    credentials: 'include',
                }
            );

            if (response.ok) {
                alert('✅ Inconformidad marcada como solucionada.');
                // Recargar la lista
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error('❌ Error al actualizar la inconformidad:', errorData);
                alert(`❌ Error: ${errorData.detail || 'No se pudo marcar como solucionada'}`);
            }
        } catch (error) {
            console.error('❌ Error al actualizar la inconformidad:', error);
            alert('❌ Error de conexión al servidor');
        }
    };

    // ============================================================
    // FORMATEAR FECHA
    // ============================================================
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return fechaString;
        }
    };

    // ============================================================
    // OBTENER ESTADO DEL CONTRATO
    // ============================================================
    const obtenerEstado = (contrato) => {
        const hoy = new Date();
        const fechaFin = new Date(contrato.fechafin);
        
        if (!contrato.contrato_Activo) return { texto: 'Inactivo', color: 'gray' };
        if (fechaFin < hoy) return { texto: 'Vencido', color: 'red' };
        return { texto: 'Activo', color: 'green' };
    };

    // ============================================================
    // RENDER
    // ============================================================
    if (cargando) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando contratos...</p>
                </div>
            </div>
        );
    }

    const contratosMostrar = contratosFiltrados();
    const totalInconformes = Array.isArray(contratos) ? contratos.length : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                📋 Revisión de Contratos
            </h1>

            {/* ============================================================
                FILTROS
                ============================================================ */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFiltro('todos')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filtro === 'todos'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        📋 Todos
                    </button>
                    <button
                        onClick={() => setFiltro('activos')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filtro === 'activos'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        ✅ Activos
                    </button>
                    <button
                        onClick={() => setFiltro('inconformes')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filtro === 'inconformes'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        ⚠️ Con Inconformidad ({totalInconformes})
                    </button>
                    <button
                        onClick={() => setFiltro('vencidos')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filtro === 'vencidos'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        📅 Vencidos
                    </button>
                </div>
            </div>

            {/* ============================================================
                LISTA DE CONTRATOS
                ============================================================ */}
            {!contratosMostrar || contratosMostrar.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500 text-lg">
                        {filtro === 'inconformes'
                            ? '🎉 No hay contratos con inconformidades pendientes'
                            : '📭 No hay contratos para mostrar'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contratosMostrar.map((contrato) => {
                        const estado = obtenerEstado(contrato);
                        // Buscar inconformidad asociada (si existe)
                        const inconformidad = Array.isArray(contratos) 
                            ? contratos.find(c => c.id === contrato.id) 
                            : null;
                        
                        return (
                            <div
                                key={contrato.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4"
                                style={{
                                    borderColor:
                                        estado.color === 'green'
                                            ? '#22c55e'
                                            : estado.color === 'red'
                                            ? '#ef4444'
                                            : '#9ca3af'
                                }}
                            >
                                {/* Cabecera */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">
                                            Contrato #{contrato.id}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {contrato.tipoContrato || 'Vivienda'}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            estado.color === 'green'
                                                ? 'bg-green-100 text-green-800'
                                                : estado.color === 'red'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {estado.texto}
                                    </span>
                                </div>

                                {/* Información del contrato */}
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <span className="font-medium">Arrendatario:</span>{' '}
                                        {contrato.arrendatario_nombre_completo || 
                                         contrato.nombres_arrendatario || 
                                         'N/A'}
                                    </p>
                                    <p>
                                        <span className="font-medium">Inmueble:</span>{' '}
                                        {contrato.inmueble_direccion || 
                                         contrato.inmueble?.direccion || 
                                         'N/A'}
                                    </p>
                                    <p>
                                        <span className="font-medium">Canon:</span> $
                                        {contrato.canonArrendamiento?.toLocaleString('es-CO') || 
                                         contrato.canonmensual?.toLocaleString('es-CO') || 
                                         '0'}
                                    </p>
                                    <p>
                                        <span className="font-medium">Inicio:</span>{' '}
                                        {formatearFecha(contrato.fechainicio)}
                                    </p>
                                    <p>
                                        <span className="font-medium">Fin:</span>{' '}
                                        {formatearFecha(contrato.fechafin)}
                                    </p>
                                    {contrato.estaFirmado && (
                                        <p className="text-green-600 text-xs">
                                            ✅ Firmado por administrador
                                        </p>
                                    )}
                                    {contrato.estaFirmadoArrendatario && (
                                        <p className="text-green-600 text-xs">
                                            ✅ Firmado por arrendatario
                                        </p>
                                    )}
                                </div>

                                {/* Inconformidad (si existe) */}
                                {inconformidad?.inconformidad && (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-sm font-medium text-red-700">
                                            ⚠️ Inconformidad:
                                        </p>
                                        <p className="text-sm text-red-600">
                                            {inconformidad.inconformidad}
                                        </p>
                                        {!inconformidad.inconformidadSolucionada && (
                                            <button
                                                onClick={() => handleMarcarSolucionada(
                                                    inconformidad.inconformidad_id
                                                )}
                                                className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded-lg transition"
                                            >
                                                ✅ Marcar como Solucionada
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleVerDetalle(contrato.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
                                    >
                                        👁️ Ver Detalle
                                    </button>
                                    <button
                                        onClick={() => handleEditarContrato(contrato.id)}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
                                    >
                                        ✏️ Editar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ============================================================
                RESUMEN
                ============================================================ */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                        {Array.isArray(contratosActivos) ? contratosActivos.length : 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Contratos</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                        {Array.isArray(contratosActivos) 
                            ? contratosActivos.filter(c => c.contrato_Activo).length 
                            : 0}
                    </p>
                    <p className="text-sm text-gray-600">Activos</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">
                        {Array.isArray(contratos) ? contratos.length : 0}
                    </p>
                    <p className="text-sm text-gray-600">Con Inconformidad</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                        {Array.isArray(contratosActivos) 
                            ? contratosActivos.filter(c => {
                                const hoy = new Date();
                                const fechaFin = new Date(c.fechafin);
                                return fechaFin < hoy;
                            }).length 
                            : 0}
                    </p>
                    <p className="text-sm text-gray-600">Vencidos</p>
                </div>
            </div>
        </div>
    );
};

export default RevisarContratos;