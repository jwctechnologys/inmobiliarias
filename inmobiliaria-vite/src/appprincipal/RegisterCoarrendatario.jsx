// RegisterCoarrendatario.jsx
import React, { useState, useEffect } from 'react';
import { getCsrfToken } from './csrf';
import { Link, useNavigate } from 'react-router-dom';

const RegisterCoarrendatario = () => {
    const [arrendatarios, setArrendatarios] = useState([]);
    const [arrendatario, setArrendatario] = useState('');
    const [userRole, setUserRole] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [tipoDocumento, setTipoDocumento] = useState('');
    const [docIdentificacion, setDocIdentificacion] = useState('');
    const [lugarExpCedula, setLugarExpCedula] = useState('');
    const [genero, setGenero] = useState('');
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
    const navigate = useNavigate();

    // Validación de email
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('');
            setEmailValid(false);
            return false;
        }
        if (regex.test(email)) {
            setEmailError('');
            setEmailValid(true);
            return true;
        } else {
            setEmailError('Por favor ingresa un email válido');
            setEmailValid(false);
            return false;
        }
    };

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user')) || {};
        const role = userData.groups ? userData.groups[0] : null;
        const id = userData.id;
        const storedArrendatarios = JSON.parse(localStorage.getItem('arrendatarios')) || [];

        setUserRole(role);
        setArrendatarios(storedArrendatarios);

        if (role === 'arrendatario') {
            setArrendatario(id);
            console.log("Arrendatario asignado:", id);
        }
    }, []);

    useEffect(() => {
        if (userRole === 'administrador') {
            fetch(`${import.meta.env.VITE_BASE_URL}/api/arrendatarios/`)
                .then((response) => response.json())
                .then((data) => setArrendatarios(data))
                .catch((error) => console.error('Error al cargar arrendatarios:', error));
        }
    }, [userRole]);

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        validateEmail(newEmail);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailError('Email inválido');
            return;
        }

        setCargando(true);

        const requestBody = {
            arrendatario,
            first_name: firstName,
            last_name: lastName,
            email: email,
            tipo_documento: tipoDocumento,
            doc_identificacion: docIdentificacion,
            lugarExpCedula,
            genero,
            empresa,
            ocupacion,
            direccionCorrespondencia,
            barrioCorrespondencia,
            ciudadCorrespondencia,
            direccion,
            barrio,
            ciudad,
            celular,
            celularDos: celularDos || null,
        };

        console.log("JSON enviado:", requestBody);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/coarrendatarios/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('Response:', response);
            const data = await response.json();

            if (response.ok) {
                alert('Coarrendatario registrado exitosamente');
                navigate('/register/Arrendatario');
            } else {
                alert(`Error al registrar coarrendatario: ${data.error}`);
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setCargando(false);
        }
    };

    const documentOptions = [
        ['CC', 'Cédula de Ciudadanía'],
        ['CE', 'Cédula de Extranjería'],
        ['RC', 'Registro Civil'],
        ['TI', 'Tarjeta de Identidad'],
        ['DNI', 'Documento Nacional de Identidad']
    ];

    // Clases reutilizables
    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-white";
    const inputErrorClassName = "w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 bg-white";
    const inputSuccessClassName = "w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white";
    const selectClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-white";
    const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
    const sectionTitleClassName = "text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200";

    if (!userRole) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Registrar Coarrendatario
                    </h1>
                    <Link
                        to="/register/Arrendatario"
                        className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg shadow-sm border border-gray-300 transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </Link>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selector de arrendatario solo para admin */}
                        {userRole === 'administrador' && (
                            <div className="bg-purple-50 p-6 rounded-lg">
                                <h2 className={sectionTitleClassName}>Seleccionar Arrendatario</h2>
                                <div>
                                    <label className={labelClassName}>Arrendatario *</label>
                                    <select
                                        value={arrendatario}
                                        onChange={(e) => setArrendatario(e.target.value)}
                                        required
                                        className={selectClassName}
                                    >
                                        <option value="">Seleccione un arrendatario</option>
                                        {arrendatarios.map((arr) => (
                                            <option key={arr.id} value={arr.id}>
                                                {arr.user?.username || 'Usuario'} - {arr.doc_identificacion || 'Sin documento'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Información Personal */}
                        <div>
                            <h2 className={sectionTitleClassName}>Información Personal</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClassName}>Nombres *</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className={inputClassName}
                                        placeholder="Ej: Juan Carlos"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Apellidos *</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className={inputClassName}
                                        placeholder="Ej: Pérez González"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Correo electrónico *</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            required
                                            className={`${emailError ? inputErrorClassName : (emailValid ? inputSuccessClassName : inputClassName)} pr-10`}
                                            placeholder="ejemplo@correo.com"
                                        />
                                        {emailValid && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {emailError && (
                                        <p className="mt-1 text-sm text-red-600">{emailError}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClassName}>Género</label>
                                    <select
                                        value={genero}
                                        onChange={(e) => setGenero(e.target.value)}
                                        className={selectClassName}
                                    >
                                        <option value="">Seleccione género</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClassName}>Ocupación</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Ingeniero"
                                        value={ocupacion}
                                        onChange={(e) => setOcupacion(e.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Empresa donde labora</label>
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

                        {/* Documento de Identidad */}
                        <div>
                            <h2 className={sectionTitleClassName}>Documento de Identidad</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClassName}>Tipo de documento *</label>
                                    <select
                                        value={tipoDocumento}
                                        onChange={(e) => setTipoDocumento(e.target.value)}
                                        required
                                        className={selectClassName}
                                    >
                                        <option value="">Seleccione tipo</option>
                                        {documentOptions.map((option) => (
                                            <option key={option[0]} value={option[0]}>
                                                {option[1]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClassName}>Número de documento *</label>
                                    <input
                                        type="number"
                                        value={docIdentificacion}
                                        onChange={(e) => setDocIdentificacion(e.target.value)}
                                        required
                                        className={inputClassName}
                                        placeholder="Ej: 123456789"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Lugar de expedición</label>
                                    <input
                                        type="text"
                                        value={lugarExpCedula}
                                        onChange={(e) => setLugarExpCedula(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Bogotá"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dirección de Correspondencia */}
                        <div>
                            <h2 className={sectionTitleClassName}>Dirección de Correspondencia</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        </div>

                        {/* Dirección de Residencia (opcional) */}
                        <div>
                            <h2 className={sectionTitleClassName}>Dirección de Residencia <span className="text-sm font-normal text-gray-500">(Opcional)</span></h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClassName}>Dirección</label>
                                    <input
                                        type="text"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Calle 26 # 69-76"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Barrio</label>
                                    <input
                                        type="text"
                                        value={barrio}
                                        onChange={(e) => setBarrio(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Salitre"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Ciudad</label>
                                    <input
                                        type="text"
                                        value={ciudad}
                                        onChange={(e) => setCiudad(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Bogotá"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contacto */}
                        <div>
                            <h2 className={sectionTitleClassName}>Contacto</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClassName}>Celular</label>
                                    <input
                                        type="number"
                                        value={celular}
                                        onChange={(e) => setCelular(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: 3001234567"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Otro celular</label>
                                    <input
                                        type="number"
                                        value={celularDos}
                                        onChange={(e) => setCelularDos(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: 3017654321"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botón de registro */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={cargando || (email && !emailValid)}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {cargando ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registrando...
                                    </span>
                                ) : (
                                    'Registrar Coarrendatario'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterCoarrendatario;