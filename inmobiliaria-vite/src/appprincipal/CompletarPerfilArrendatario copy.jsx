// CompletarPerfilArrendatario.jsx
import React, { useState, useEffect } from 'react';
import { getCsrfToken } from './csrf';
import { useNavigate } from 'react-router-dom';

const CompletarPerfilArrendatario = () => {
    const navigate = useNavigate();

    // Estados para los datos del usuario temporal
    const [userInfo, setUserInfo] = useState({
        user_id: sessionStorage.getItem('temp_user_id'),
        email: sessionStorage.getItem('user_email'),
        first_name: sessionStorage.getItem('user_first_name'),
        last_name: sessionStorage.getItem('user_last_name')
    });
    console.log("wwww",userInfo);
    // Estados para el formulario
    const [tipo_documento, setTipo_documento] = useState('');
    const [doc_identificacion, setDoc_identificacion] = useState('');
    const [lugarExpCedula, setLugarExpCedula] = useState('');
    const [tipoPostulacion, setTipoPostulacion] = useState('');
    const [genero, setGenero] = useState('');
    const [estadoCivil, setEstadoCivil] = useState(''); // NUEVO
    const [CodClasificaIndustrialIU, setCodClasificaIndustrialIU] = useState('');
    const [descActividadEconomica, setdescActividadEconomica] = useState('');
    const [ocupacion, setOcupacion] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [direccionCorrespondencia, setDireccionCorrespondencia] = useState('');
    const [barrioCorrespondencia, setBarrioCorrespondencia] = useState('');
    const [ciudadCorrespondencia, setCiudadCorrespondencia] = useState('');
    const [direccion, setDireccion] = useState('');
    const [barrio, setBarrio] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [celular, setCelular] = useState('');
    const [celularDos, setCelularDos] = useState('');

    const [csrfToken, setCsrfToken] = useState('');
    const [cargando, setCargando] = useState(false);
    const [errorGeneral, setErrorGeneral] = useState('');

    useEffect(() => {
        // Verificar si hay user_id, si no, redirigir al registro básico


        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, [navigate, userInfo.user_id]);

    // Validación de celular (solo números)
    const validateCelular = (value) => {
        const regex = /^[0-9]{7,10}$/;
        return regex.test(value);
    };

    // Validación de documento (solo números)
    const validateDocumento = (value) => {
        const regex = /^[0-9]{5,12}$/;
        return regex.test(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorGeneral('');

        // Validaciones básicas
        if (!validateDocumento(doc_identificacion)) {
            alert('El número de documento debe tener entre 5 y 12 dígitos numéricos');
            return;
        }

        if (!validateCelular(celular)) {
            alert('El celular debe tener entre 7 y 10 dígitos numéricos');
            return;
        }

        setCargando(true);

        const payload = {
            user_id: userInfo.user_id,
            group: "arrendatario",
            tipo_documento,
            doc_identificacion,
            lugarExpCedula,
            tipoPostulacion,
            genero,
            estadoCivil, // NUEVO
            CodClasificaIndustrialIU: CodClasificaIndustrialIU || null,
            descActividadEconomica: descActividadEconomica || null,
            ocupacion,
            empresa: empresa || null,
            direccionCorrespondencia,
            barrioCorrespondencia,
            ciudadCorrespondencia,
            direccion,
            barrio,
            ciudad,
            celular,
            celularDos: celularDos || null,
        };

        console.log('Datos enviados al servidor:', payload);

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/completar-perfil/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                // Limpiar datos temporales
                sessionStorage.removeItem('temp_user_id');
                sessionStorage.removeItem('user_email');
                sessionStorage.removeItem('user_first_name');
                sessionStorage.removeItem('user_last_name');

                alert('¡Perfil completado exitosamente!');
                navigate('/home');
            } else {
                setErrorGeneral(data.error || 'Error al completar el perfil');
            }
        } catch (error) {
            setErrorGeneral('Error de conexión');
        } finally {
            setCargando(false);
        }
    };

    const handleOmitir = () => {
        // Limpiar datos temporales
        sessionStorage.removeItem('temp_user_id');
        sessionStorage.removeItem('user_email');
        sessionStorage.removeItem('user_first_name');
        sessionStorage.removeItem('user_last_name');
        navigate('/home');
    };

    const groupTipoDocumento = [
        ['CC', 'Cédula de Ciudadanía'],
        ['CE', 'Cédula de Extranjería'],
        ['RC', 'Registro Civil'],
        ['TI', 'Tarjeta de Identidad'],
        ['DNI', 'Documento Nacional de Identidad']
    ];

    // Opciones para estado civil
    const opcionesEstadoCivil = [
        ['soltero', 'Soltero/a'],
        ['casado', 'Casado/a'],
        ['union_libre', 'Unión Libre'],
        ['divorciado', 'Divorciado/a'],
        ['viudo', 'Viudo/a']
    ];

    // Clases reutilizables
    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-white";
    const selectClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-white";
    const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
    const sectionTitleClassName = "text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200";

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Completa tu perfil
                    </h1>
                    <button
                        onClick={handleOmitir}
                        className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg shadow-sm border border-gray-300 transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Omitir por ahora
                    </button>
                </div>

                {/* Mensaje de bienvenida */}
                <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Hola, {userInfo.first_name || userInfo.email}
                            </h2>
                            <p className="text-gray-600">
                                Para poder aplicar a arriendos necesitamos algunos datos adicionales.
                                Esto nos ayuda a conocer mejor tu perfil.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
                    {errorGeneral && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600">{errorGeneral}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Grid de 2 columnas para pantallas grandes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Columna izquierda */}
                            <div className="space-y-4">
                                <h2 className={sectionTitleClassName}>Información Personal</h2>

                                <div>
                                    <label className={labelClassName}>Género *</label>
                                    <select
                                        value={genero}
                                        onChange={(e) => setGenero(e.target.value)}
                                        required
                                        className={selectClassName}
                                    >
                                        <option value="">Selecciona el género</option>
                                        <option value="F">Femenino</option>
                                        <option value="M">Masculino</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClassName}>Estado Civil *</label>
                                    <select
                                        value={estadoCivil}
                                        onChange={(e) => setEstadoCivil(e.target.value)}
                                        required
                                        className={selectClassName}
                                    >
                                        <option value="">Selecciona estado civil</option>
                                        {opcionesEstadoCivil.map((option) => (
                                            <option key={option[0]} value={option[0]}>
                                                {option[1]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClassName}>Tipo de documento *</label>
                                    <select
                                        value={tipo_documento}
                                        onChange={(e) => setTipo_documento(e.target.value)}
                                        required
                                        className={selectClassName}
                                    >
                                        <option value="">Seleccione tipo de documento</option>
                                        {groupTipoDocumento.map((option) => (
                                            <option key={option[0]} value={option[0]}>
                                                {option[1]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClassName}>Número del documento *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 123456789"
                                        value={doc_identificacion}
                                        onChange={(e) => setDoc_identificacion(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Lugar de expedición *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Bogotá"
                                        value={lugarExpCedula}
                                        onChange={(e) => setLugarExpCedula(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="space-y-4">
                                <h2 className={sectionTitleClassName}>Contacto</h2>

                                <div>
                                    <label className={labelClassName}>Celular principal *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 3001234567"
                                        value={celular}
                                        onChange={(e) => setCelular(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Celular secundario</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 3017654321"
                                        value={celularDos}
                                        onChange={(e) => setCelularDos(e.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Tipo de postulación *</label>
                                    <select
                                        value={tipoPostulacion}
                                        onChange={(e) => setTipoPostulacion(e.target.value)}
                                        required
                                        className={selectClassName}
                                    >
                                        <option value="">Seleccione tipo</option>
                                        <option value="vivienda">Vivienda</option>
                                        <option value="comercial">Comercial</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Direcciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h2 className={sectionTitleClassName}>Dirección de Correspondencia</h2>

                                <div>
                                    <label className={labelClassName}>Dirección *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Carrera 7 # 123-45"
                                        value={direccionCorrespondencia}
                                        onChange={(e) => setDireccionCorrespondencia(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Barrio *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Chapinero"
                                        value={barrioCorrespondencia}
                                        onChange={(e) => setBarrioCorrespondencia(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Ciudad *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Bogotá"
                                        value={ciudadCorrespondencia}
                                        onChange={(e) => setCiudadCorrespondencia(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className={sectionTitleClassName}>Dirección de Residencia</h2>

                                <div>
                                    <label className={labelClassName}>Dirección *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Calle 26 # 69-76"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Barrio *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Salitre"
                                        value={barrio}
                                        onChange={(e) => setBarrio(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Ciudad *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Bogotá"
                                        value={ciudad}
                                        onChange={(e) => setCiudad(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Campos dinámicos según tipo de postulación */}
                        {tipoPostulacion === 'comercial' && (
                            <div className="bg-purple-50 p-6 rounded-lg space-y-4">
                                <h2 className="text-lg font-semibold text-purple-800 mb-4">Información Comercial</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClassName}>Código CIIU *</label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 1234"
                                            value={CodClasificaIndustrialIU}
                                            onChange={(e) => setCodClasificaIndustrialIU(e.target.value)}
                                            required
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClassName}>Actividad económica *</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Comercio al por menor"
                                            value={descActividadEconomica}
                                            onChange={(e) => setdescActividadEconomica(e.target.value)}
                                            required
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {tipoPostulacion === 'vivienda' && (
                            <div className="bg-green-50 p-6 rounded-lg space-y-4">
                                <h2 className="text-lg font-semibold text-green-800 mb-4">Información Laboral</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClassName}>Ocupación *</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Ingeniero"
                                            value={ocupacion}
                                            onChange={(e) => setOcupacion(e.target.value)}
                                            required
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClassName}>Empresa</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Empresa S.A.S"
                                            value={empresa}
                                            onChange={(e) => setEmpresa(e.target.value)}
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón de guardar */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {cargando ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </span>
                                ) : (
                                    'Guardar perfil completo'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Enlace para saltar */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleOmitir}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            No quiero completar mi perfil ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompletarPerfilArrendatario;