import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { getCsrfToken } from "../csrf";

const InfoCasas = () => {
    const [casas, setCasas] = useState(null);
    const [videos, setVideos] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [applying, setApplying] = useState(false);
    const [solicitudData, setSolicitudData] = useState(null);
    const navigate = useNavigate();
    const { casaId } = useParams();
    const [csrfToken, setCsrfToken] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    // Verificar si el usuario ya tiene solicitudes para esta casa
    const verificarSolicitudesUsuario = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !casaId) return;

        const userGroups = user.groups || [];
        if (!userGroups.includes("arrendatario")) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/solicitudes/verificar/?casa=${casaId}&usuario=${user.id}`
            );

            if (response.ok) {
                const data = await response.json();
                console.log("Datos de verificación:", data);
                setSolicitudData(data);
            } else {
                setSolicitudData(null);
            }
        } catch (error) {
            console.error("Error al verificar solicitudes:", error);
            setSolicitudData(null);
        }
    };

    // Cargar datos de la casa
    useEffect(() => {
        if (!casaId) {
            console.warn("El ID de la casa no está definido.");
            setLoading(false);
            return;
        }

        const cargarDatos = async () => {
            setLoading(true);
            try {
                // Cargar videos
                const videosResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/videos/?arrendar=${casaId}`);
                const videosData = await videosResponse.json();
                setVideos(videosData);

                // Cargar imágenes
                const imagenesResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/imagenes/?arrendar=${casaId}`);
                const imagenesData = await imagenesResponse.json();
                setImagenes(imagenesData);

                // Cargar información de la casa
                const casaResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/casas/${casaId}`);
                const casaData = await casaResponse.json();

                // Verifica si la casa está disponible
                if (!casaData.arrendada) {
                    setCasas(casaData);
                } else {
                    setCasas(null);
                }

                // Verificar las solicitudes del usuario
                await verificarSolicitudesUsuario();

            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [casaId]);

    // Verificar si tiene solicitud pendiente
    const tieneSolicitudPendiente = () => {
        if (!solicitudData || !solicitudData.existe) return false;
        return solicitudData.tiene_pendiente === true;
    };

    // Verificar si tiene solicitud aceptada
    const tieneSolicitudAceptada = () => {
        if (!solicitudData || !solicitudData.existe) return false;
        return solicitudData.tiene_aceptada === true;
    };

    // Verificar si tiene solicitud cancelada
    const tieneSolicitudCancelada = () => {
        if (!solicitudData || !solicitudData.existe) return false;
        return solicitudData.tiene_cancelada === true;
    };

    // Obtener la solicitud activa (pendiente o aceptada)
    const getSolicitudActiva = () => {
        if (!solicitudData || !solicitudData.solicitud_activa) return null;
        return solicitudData.solicitud_activa;
    };

    // Obtener todas las solicitudes
    const getTodasLasSolicitudes = () => {
        if (!solicitudData || !solicitudData.solicitudes) return [];
        return solicitudData.solicitudes;
    };

    const handleAplicar = async (casaId) => {
        const user = JSON.parse(localStorage.getItem("user"));

        // 1. Verificar si el usuario ha iniciado sesión
        if (!user) {
            alert("Debes iniciar sesión o registrarte para aplicar.");
            navigate("/login");
            return;
        }

        // 2. Verificar grupos del usuario
        const userGroups = user.groups || [];

        // Caso 1: Usuario pertenece a otro grupo
        const isOtherGroup = userGroups.includes("administrador") ||
            userGroups.includes("propietario") ||
            userGroups.includes("proveedor");

        if (isOtherGroup) {
            alert("Tu perfil no es de arrendatario. Si deseas aplicar a propiedades, debes crear una cuenta de arrendatario.");
            navigate("/register");
            return;
        }

        // Caso 2: Usuario no es arrendatario
        if (!userGroups.includes("arrendatario")) {
            alert("Debes tener una cuenta de arrendatario para aplicar a propiedades.");
            navigate("/register");
            return;
        }

        // Caso 3: Usuario es arrendatario pero no tiene el perfil completo
        if (userGroups.includes("arrendatario") && (user.activo === undefined || user.arrendatarioAprobado === undefined)) {
            const confirmar = window.confirm(
                "Debes completar tu perfil de arrendatario antes de aplicar. ¿Deseas continuar?"
            );
            if (confirmar) {
                navigate("/completar-perfil");
            }
            return;
        }

        // Caso 4: Usuario ya tiene casa en arriendo
        if (userGroups.includes("arrendatario") && user.activo === true && user.arrendatarioAprobado === true) {
            alert("Ya cuentas con una propiedad en arriendo. Si deseas aplicar a otra propiedad, por favor contacta con administración.");
            return;
        }

        // Caso 5: Verificar si ya existe una solicitud PENDIENTE o ACEPTADA
        if (tieneSolicitudPendiente()) {
            alert("Ya tienes una solicitud pendiente para esta propiedad. Por favor espera a que sea evaluada.");
            return;
        }

        if (tieneSolicitudAceptada()) {
            alert("Tu solicitud para esta propiedad ya fue aceptada. La propiedad está en proceso de arriendo.");
            return;
        }

        // Si tiene solicitud cancelada o no tiene solicitudes, permitir aplicar
        setApplying(true);
        try {
            // Verificar nuevamente en el servidor para asegurarnos
            const checkResponse = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/solicitudes/verificar/?casa=${casaId}&usuario=${user.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    credentials: 'include',
                }
            );

            const checkData = await checkResponse.json();

            if (checkData.existe) {
                if (checkData.tiene_pendiente) {
                    alert("Ya tienes una solicitud pendiente para esta propiedad. Por favor espera a que sea evaluada.");
                    setSolicitudData(checkData);
                    setApplying(false);
                    return;
                }
                if (checkData.tiene_aceptada) {
                    alert("Tu solicitud para esta propiedad ya fue aceptada.");
                    setSolicitudData(checkData);
                    setApplying(false);
                    return;
                }
            }

            // Redirigir al formulario de aplicación
            navigate(`/aplicar/${casaId}`);
        } catch (error) {
            console.error("Error al verificar solicitud existente:", error);
            alert("Error al verificar tu solicitud. Por favor, intenta de nuevo.");
            setApplying(false);
        }
    };

    // Verificar si el botón de aplicar debe mostrarse
    const shouldShowApplyButton = () => {
        // Si la casa está arrendada, no mostrar botón
        if (casas?.arrendada) return false;
        
        // Si no hay usuario, no mostrar botón
        if (!user) return false;

        const userGroups = user.groups || [];

        // Si es administrador, propietario o proveedor, no mostrar botón
        if (userGroups.includes("administrador") || 
            userGroups.includes("propietario") || 
            userGroups.includes("proveedor")) {
            return false;
        }

        // Si no es arrendatario, no mostrar botón
        if (!userGroups.includes("arrendatario")) return false;

        // Si tiene solicitud PENDIENTE o ACEPTADA, NO mostrar botón
        if (tieneSolicitudPendiente() || tieneSolicitudAceptada()) {
            return false;
        }

        // Para arrendatarios con perfil completo y sin casa en arriendo
        if (userGroups.includes("arrendatario")) {
            // Si el perfil está completo y no tiene casa en arriendo
            if (user.activo === true && user.arrendatarioAprobado === false) {
                return true;
            }
            
            // Si el perfil está incompleto, mostrar botón (redirigirá a completar perfil)
            if (user.activo === undefined || user.arrendatarioAprobado === undefined) {
                return true;
            }

            // Si ya tiene casa en arriendo, no mostrar botón
            if (user.activo === true && user.arrendatarioAprobado === true) {
                return false;
            }
        }

        return false;
    };

    // Obtener mensaje contextual
    const getContextualMessage = () => {
        // Si tiene solicitud pendiente
        if (tieneSolicitudPendiente()) {
            return "⏳ Tienes una solicitud en espera de estudio. Recibirás una notificación cuando sea evaluada.";
        }

        // Si tiene solicitud aceptada
        if (tieneSolicitudAceptada()) {
            return "✅ Tu solicitud fue aceptada. La propiedad está en proceso de arriendo.";
        }

        // Si solo tiene solicitud cancelada
        if (tieneSolicitudCancelada() && !tieneSolicitudPendiente() && !tieneSolicitudAceptada()) {
            const solicitudes = getTodasLasSolicitudes();
            const canceladas = solicitudes.filter(s => s.estado === 'cancelada');
            if (canceladas.length > 0) {
                return `🔄 Tienes ${canceladas.length} solicitud(es) cancelada(s). Puedes aplicar nuevamente si lo deseas.`;
            }
        }

        if (!user) {
            return "🔒 Debes iniciar sesión para aplicar a esta propiedad";
        }

        const userGroups = user.groups || [];

        // Mensaje para otros grupos
        if (userGroups.includes("administrador") || 
            userGroups.includes("propietario") || 
            userGroups.includes("proveedor")) {
            return "👤 Esta función es solo para arrendatarios";
        }

        // Mensaje para arrendatarios
        if (userGroups.includes("arrendatario")) {
            // Perfil incompleto
            if (user.activo === undefined || user.arrendatarioAprobado === undefined) {
                return "📝 Completa tu perfil de arrendatario para poder aplicar";
            }

            // Perfil completo con casa en arriendo
            if (user.activo === true && user.arrendatarioAprobado === true) {
                return "🏠 Ya tienes una propiedad en arriendo. Contacta con administración para más información";
            }

            // Perfil completo sin casa en arriendo
            if (user.activo === true && user.arrendatarioAprobado === false) {
                return "✅ Puedes aplicar a esta propiedad. Tu solicitud será evaluada";
            }
        }

        return "";
    };

    // Obtener la solicitud activa para mostrar mensaje específico
    const solicitudActiva = getSolicitudActiva();

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        border: "4px solid #e5e7eb",
                        borderTop: "4px solid #3b82f6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto"
                    }}></div>
                    <p style={{ marginTop: "16px", color: "#4b5563" }}>Cargando información...</p>
                </div>
            </div>
        );
    }

    if (!casas) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <svg style={{ width: "48px", height: "48px", margin: "0 auto", color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 style={{ marginTop: "16px", fontSize: "20px", fontWeight: "600", color: "#111827" }}>Casa no disponible</h2>
                    <p style={{ marginTop: "8px", color: "#6b7280" }}>Esta propiedad ya no está disponible para arriendo.</p>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ marginTop: "16px", padding: "8px 16px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    const contextualMessage = getContextualMessage();
    const showApplyButton = shouldShowApplyButton();

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "32px 0" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
                {/* Botón volver */}
                <div style={{ marginBottom: "24px" }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ display: "flex", alignItems: "center", color: "#4b5563", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
                    >
                        <svg style={{ width: "20px", height: "20px", marginRight: "8px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                </div>

                {/* Información principal */}
                <div style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", marginBottom: "32px" }}>
                    {/* Imagen principal */}
                    <div style={{ position: "relative", height: "384px" }}>
                        <img
                            src={casas.fotoPrincipal}
                            alt="Foto principal"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/1200x400?text=Imagen+no+disponible";
                            }}
                        />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, black, transparent)", padding: "24px" }}>
                            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>
                                {casas.tipoInmueble}
                            </h1>
                            <p style={{ color: "white", fontSize: "18px" }}>
                                {casas.direccion}, {casas.barrio}, {casas.ciudad}
                            </p>
                        </div>
                    </div>

                    {/* Detalles */}
                    <div style={{ padding: "24px" }}>
                        {/* Tarjetas de información */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                            <div style={{ backgroundColor: "#eff6ff", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                                <p style={{ fontSize: "14px", color: "#4b5563" }}>Canon mensual</p>
                                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb" }}>
                                    ${new Intl.NumberFormat('es-CO').format(casas.canonmensual)}
                                </p>
                            </div>

                            <div style={{ backgroundColor: "#fef3c7", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                                <p style={{ fontSize: "14px", color: "#4b5563" }}>Estado</p>
                                <p style={{ fontSize: "24px", fontWeight: "bold", color: !casas.arrendada ? "#16a34a" : "#dc2626" }}>
                                    {!casas.arrendada ? 'Disponible' : 'No disponible'}
                                </p>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div style={{ marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>Descripción</h2>
                            <p style={{ color: "#4b5563", lineHeight: "1.6" }}>{casas.descripcion}</p>
                        </div>

                        {/* Condiciones */}
                        <div style={{ marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>Condiciones de arrendamiento</h2>
                            <p style={{ color: "#4b5563", lineHeight: "1.6" }}>{casas.condiciones}</p>
                        </div>

                        {/* Ambientes */}
                        {(casas.sala || casas.comedor || casas.cocina || casas.habitaciones || casas.baños || casas.patio || casas.garage || casas.tanquesubterraneo) && (
                            <div style={{ marginBottom: "24px" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>Ambientes</h2>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                                    {casas.sala && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                                            <span style={{ color: "#4b5563" }}>Sala {casas.observacion_sala && `(${casas.observacion_sala})`}</span>
                                        </div>
                                    )}
                                    {casas.comedor && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                                            <span style={{ color: "#4b5563" }}>Comedor {casas.observacion_comedor && `(${casas.observacion_comedor})`}</span>
                                        </div>
                                    )}
                                    {casas.cocina && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                                            <span style={{ color: "#4b5563" }}>Cocina {casas.observacion_cocina && `(${casas.observacion_cocina})`}</span>
                                        </div>
                                    )}
                                    {casas.habitaciones && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                                            <span style={{ color: "#4b5563" }}>Habitaciones {casas.observacion_habitaciones && `(${casas.observacion_habitaciones})`}</span>
                                        </div>
                                    )}
                                    {casas.baños && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                                            <span style={{ color: "#4b5563" }}>Baños {casas.observacion_baños && `(${casas.observacion_baños})`}</span>
                                        </div>
                                    )}
                                    {casas.patio && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                                            <span style={{ color: "#4b5563" }}>Patio {casas.observacion_patio && `(${casas.observacion_patio})`}</span>
                                        </div>
                                    )}
                                    {casas.garage && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                                            <span style={{ color: "#4b5563" }}>Garage {casas.observacion_garage && `(${casas.observacion_garage})`}</span>
                                        </div>
                                    )}
                                    {casas.tanquesubterraneo && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                                            <span style={{ color: "#4b5563" }}>Tanque Subterráneo {casas.observacion_tanquesubterraneo && `(${casas.observacion_tanquesubterraneo})`}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Servicios */}
                        {(casas.ser_agua || casas.ser_energia || casas.ser_gas_domiciliario || casas.ser_bioagricola) && (
                            <div style={{ marginBottom: "24px" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>Servicios</h2>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                                    {casas.ser_agua && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#3b82f6", fontSize: "18px" }}>💧</span>
                                            <span style={{ color: "#4b5563" }}>Agua {casas.observacion_ser_agua && `(${casas.observacion_ser_agua})`}</span>
                                        </div>
                                    )}
                                    {casas.ser_energia && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#eab308", fontSize: "18px" }}>⚡</span>
                                            <span style={{ color: "#4b5563" }}>Energía {casas.observacion_ser_energia && `(${casas.observacion_ser_energia})`}</span>
                                        </div>
                                    )}
                                    {casas.ser_gas_domiciliario && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#f97316", fontSize: "18px" }}>🔥</span>
                                            <span style={{ color: "#4b5563" }}>Gas {casas.observacion_ser_gas_domiciliario && `(${casas.observacion_ser_gas_domiciliario})`}</span>
                                        </div>
                                    )}
                                    {casas.ser_bioagricola && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontSize: "18px" }}>🌱</span>
                                            <span style={{ color: "#4b5563" }}>Bioagrícola {casas.observacion_ser_bioagricola && `(${casas.observacion_ser_bioagricola})`}</span>
                                        </div>
                                    )}
                                </div>
                                {casas.otros && (
                                    <p style={{ marginTop: "12px", color: "#4b5563" }}>Otros: {casas.otros}</p>
                                )}
                            </div>
                        )}

                        {/* Sección de aplicar o mensaje de estado */}
                        <div style={{ marginTop: "32px" }}>
                            {tieneSolicitudPendiente() ? (
                                <div style={{
                                    width: "100%",
                                    padding: "16px",
                                    backgroundColor: "#fef3c7",
                                    border: "1px solid #fbbf24",
                                    borderRadius: "8px",
                                    textAlign: "center"
                                }}>
                                    <div style={{ marginBottom: "8px" }}>
                                        <span style={{ fontSize: "24px" }}>⏳</span>
                                    </div>
                                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#92400e", marginBottom: "8px" }}>
                                        Solicitud en proceso
                                    </h3>
                                    <p style={{ color: "#78350f" }}>
                                        Tienes una solicitud pendiente para esta propiedad. Está siendo evaluada. Te notificaremos cuando haya una respuesta.
                                    </p>
                                    {solicitudActiva && (
                                        <p style={{ color: "#78350f", fontSize: "14px", marginTop: "8px" }}>
                                            ID de solicitud: {solicitudActiva.id}
                                        </p>
                                    )}
                                </div>
                            ) : tieneSolicitudAceptada() ? (
                                <div style={{
                                    width: "100%",
                                    padding: "16px",
                                    backgroundColor: "#d1fae5",
                                    border: "1px solid #10b981",
                                    borderRadius: "8px",
                                    textAlign: "center"
                                }}>
                                    <div style={{ marginBottom: "8px" }}>
                                        <span style={{ fontSize: "24px" }}>✅</span>
                                    </div>
                                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#065f46", marginBottom: "8px" }}>
                                        ¡Solicitud aceptada!
                                    </h3>
                                    <p style={{ color: "#065f46" }}>
                                        Tu solicitud fue aceptada. La propiedad está en proceso de arriendo.
                                    </p>
                                    {solicitudActiva && (
                                        <p style={{ color: "#065f46", fontSize: "14px", marginTop: "8px" }}>
                                            ID de solicitud: {solicitudActiva.id}
                                        </p>
                                    )}
                                </div>
                            ) : tieneSolicitudCancelada() && !tieneSolicitudPendiente() && !tieneSolicitudAceptada() ? (
                                <div style={{
                                    width: "100%",
                                    padding: "16px",
                                    backgroundColor: "#fee2e2",
                                    border: "1px solid #ef4444",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    marginBottom: "16px"
                                }}>
                                    <div style={{ marginBottom: "8px" }}>
                                        <span style={{ fontSize: "24px" }}>🔄</span>
                                    </div>
                                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#991b1b", marginBottom: "8px" }}>
                                        Solicitud(es) cancelada(s)
                                    </h3>
                                    <p style={{ color: "#991b1b" }}>
                                        Tienes solicitudes canceladas para esta propiedad. Puedes aplicar nuevamente si lo deseas.
                                    </p>
                                </div>
                            ) : null}

                            {showApplyButton ? (
                                <button
                                    onClick={() => handleAplicar(casas.id)}
                                    disabled={applying}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        backgroundColor: applying ? "#9ca3af" : "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        cursor: applying ? "not-allowed" : "pointer",
                                        transition: "background-color 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!applying) e.target.style.backgroundColor = "#2563eb";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!applying) e.target.style.backgroundColor = "#3b82f6";
                                    }}
                                >
                                    {applying ? "Procesando..." : "Aplicar a esta propiedad"}
                                </button>
                            ) : null}

                            {contextualMessage && !tieneSolicitudPendiente() && !tieneSolicitudAceptada() && (
                                <div style={{ marginTop: "12px", textAlign: "center" }}>
                                    <p style={{ fontSize: "14px", color: "#6b7280" }}>{contextualMessage}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Galería de imágenes */}
                {imagenes && imagenes.length > 0 && (
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "16px" }}>Galería de imágenes</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                            {imagenes.map((img) => (
                                <div
                                    key={img.id}
                                    style={{
                                        position: "relative",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        borderRadius: "8px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                    }}
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={img.imagen}
                                        alt={img.descripcion || "Imagen de la casa"}
                                        style={{ width: "100%", height: "200px", objectFit: "cover", transition: "transform 0.3s" }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/300x200?text=Imagen+no+disponible";
                                        }}
                                        onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                                    />
                                    {img.descripcion && (
                                        <p style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            backgroundColor: "rgba(0,0,0,0.6)",
                                            color: "white",
                                            fontSize: "12px",
                                            padding: "8px",
                                            margin: 0,
                                            textAlign: "center"
                                        }}>
                                            {img.descripcion}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Videos */}
                {videos && videos.length > 0 && (
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "16px" }}>Videos de la propiedad</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                            {videos.map((vid) => (
                                <div
                                    key={vid.id}
                                    style={{
                                        backgroundColor: "#f9fafb",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                    }}
                                    onClick={() => setSelectedVideo(vid)}
                                >
                                    <video
                                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                        controls={false}
                                    >
                                        <source src={vid.video_archivo} type="video/mp4" />
                                        Tu navegador no soporta videos.
                                    </video>
                                    <div style={{ padding: "12px" }}>
                                        <p style={{ fontSize: "14px", color: "#4b5563" }}>{vid.descripcion || "Sin descripción"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de imagen */}
            {selectedImage && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.9)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px"
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedImage.imagen}
                            alt={selectedImage.descripcion}
                            style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }}
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px"
                            }}
                        >
                            ✕
                        </button>
                        {selectedImage.descripcion && (
                            <div style={{
                                position: "absolute",
                                bottom: "16px",
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                color: "white",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                padding: "8px"
                            }}>
                                {selectedImage.descripcion}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de video */}
            {selectedVideo && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.9)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px"
                    }}
                    onClick={() => setSelectedVideo(null)}
                >
                    <div style={{ position: "relative", maxWidth: "90vw", width: "100%" }} onClick={(e) => e.stopPropagation()}>
                        <video
                            controls
                            autoPlay
                            style={{ width: "100%", borderRadius: "8px" }}
                        >
                            <source src={selectedVideo.video_archivo} type="video/mp4" />
                            Tu navegador no soporta videos.
                        </video>
                        <button
                            onClick={() => setSelectedVideo(null)}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px"
                            }}
                        >
                            ✕
                        </button>
                        {selectedVideo.descripcion && (
                            <div style={{
                                marginTop: "12px",
                                textAlign: "center",
                                color: "white"
                            }}>
                                {selectedVideo.descripcion}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default InfoCasas;