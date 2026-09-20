// RegisterArrendador.jsx
import React, { useState, useEffect } from 'react';
import { getCsrfToken } from './csrf';
import { Link, useNavigate } from 'react-router-dom';

const RegisterArrendador = () => {
    const [username, setUsername] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        level: '',
        color: '',
        message: '',
        requirements: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        }
    });
    const [group, setGroup] = useState("administrador");
    const [tipo_documento, setTipo_documento] = useState('');
    const [doc_identificacion, setDoc_identificacion] = useState('');
    const [lugarExpCedula, setLugarExpCedula] = useState('');
    const [genero, setGenero] = useState('');
    const [direccionCorrespondencia, setDireccionCorrespondencia] = useState('');
    const [barrioCorrespondencia, setBarrioCorrespondencia] = useState('');
    const [ciudadCorrespondencia, setCiudadCorrespondencia] = useState('');
    const [cuentaDaviplata, setCuentaDaviplata] = useState('');
    const [cuentaNequi, setCuentaNequi] = useState('');
    const [CuentaBancolombia, setCuentaBancolombia] = useState('');
    const [direccion, setDireccion] = useState('');
    const [barrio, setBarrio] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [celular, setCelular] = useState('');
    const [celularDos, setCelularDos] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

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

    // Validación de fortaleza de contraseña
    const checkPasswordStrength = (pass) => {
        const requirements = {
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            lowercase: /[a-z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
        };

        const score = Object.values(requirements).filter(Boolean).length;

        let level = '';
        let color = '';
        let message = '';

        if (pass.length === 0) {
            level = '';
            color = '';
            message = '';
        } else if (score <= 2) {
            level = 'Débil';
            color = 'bg-red-500';
            message = 'Contraseña débil - agrega más variedad';
        } else if (score <= 4) {
            level = 'Media';
            color = 'bg-yellow-500';
            message = 'Contraseña media - puede mejorar';
        } else {
            level = 'Segura';
            color = 'bg-green-500';
            message = '¡Contraseña segura!';
        }

        setPasswordStrength({
            score,
            level,
            color,
            message,
            requirements
        });

        return score;
    };

    // Validación de contraseñas
    const validatePasswords = (pass, confirm) => {
        checkPasswordStrength(pass);
        
        if (!pass && !confirm) {
            setPasswordsMatch(false);
            return false;
        }
        if (pass === confirm && pass !== '') {
            setPasswordsMatch(true);
            setPasswordError('');
            return true;
        } else if (confirm !== '') {
            setPasswordsMatch(false);
            setPasswordError('Las contraseñas no coinciden');
            return false;
        }
        setPasswordsMatch(false);
        return false;
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        validateEmail(newEmail);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePasswords(newPassword, confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirm = e.target.value;
        setConfirmPassword(newConfirm);
        validatePasswords(password, newConfirm);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateEmail(email)) {
            setEmailError('Email inválido');
            return;
        }
        
        if (password !== confirmPassword) {
            setPasswordError("Las contraseñas no coinciden.");
            return;
        }

        if (passwordStrength.score < 3) {
            alert('Por favor, usa una contraseña más segura (mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos)');
            return;
        }
        
        setPasswordError('');
        setCargando(true);

        const payload = {
            username,
            first_name,
            last_name,
            email,
            password,
            group,
            genero,
            direccionCorrespondencia,
            barrioCorrespondencia,
            ciudadCorrespondencia,
            cuentaDaviplata,
            cuentaNequi,
            CuentaBancolombia,
            tipo_documento,
            doc_identificacion,
            lugarExpCedula,
            direccion,
            barrio,
            ciudad,
            celular,
            celularDos,
        };

        console.log("Datos enviados:", payload);

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/create/`, {
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
                alert('Usuario creado exitosamente');
                navigate('/register');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setCargando(false);
        }
    };

    const groupTipoDocumento = [
        ['CC', 'Cédula de Ciudadanía'],
        ['CE', 'Cédula de Extranjería'],
        ['RC', 'Registro Civil'],
        ['TI', 'Tarjeta de Identidad'],
        ['DNI', 'Documento Nacional de Identidad']
    ];

    // Clases reutilizables
    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white";
    const inputErrorClassName = "w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 bg-white";
    const inputSuccessClassName = "w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white";
    const selectClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white";
    const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
    const sectionTitleClassName = "text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header con botón de navegación */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Registrar Arrendador
                    </h1>
                    <Link
                        to="/register"
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
                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Grupo fijo (oculto pero presente) */}
                        <div className="hidden">
                            <select value={group} onChange={(e) => setGroup(e.target.value)} disabled>
                                <option value="Arrendador">Arrendador</option>
                            </select>
                        </div>

                        {/* Información Personal - 2 columnas */}
                        <div>
                            <h2 className={sectionTitleClassName}>Información Personal</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClassName}>Nombre de Usuario *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: jperez123"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Nombres *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan Carlos"
                                        value={first_name}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Apellidos *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Pérez González"
                                        value={last_name}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Email *</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="ejemplo@correo.com"
                                            value={email}
                                            onChange={handleEmailChange}
                                            required
                                            className={`${emailError ? inputErrorClassName : (emailValid ? inputSuccessClassName : inputClassName)} pr-10`}
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
                            </div>
                        </div>

                        {/* Documento de Identidad */}
                        <div>
                            <h2 className={sectionTitleClassName}>Documento de Identidad</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <label className={labelClassName}>Tipo de documento *</label>
                                    <select
                                        value={tipo_documento}
                                        onChange={(e) => setTipo_documento(e.target.value)}
                                        required
                                        className={selectClassName}
                                    >
                                        <option value="">Seleccione</option>
                                        {groupTipoDocumento.map((option) => (
                                            <option key={option[0]} value={option[0]}>
                                                {option[1]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-1">
                                    <label className={labelClassName}>Número de documento *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 123456789"
                                        value={doc_identificacion}
                                        onChange={(e) => setDoc_identificacion(e.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="md:col-span-1">
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
                        </div>

                        {/* Dirección de Correspondencia */}
                        <div>
                            <h2 className={sectionTitleClassName}>Dirección de Correspondencia</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
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

                                <div className="md:col-span-1">
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

                                <div className="md:col-span-1">
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
                                <div className="md:col-span-1">
                                    <label className={labelClassName}>Dirección</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Calle 26 # 69-76"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className={labelClassName}>Barrio</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Salitre"
                                        value={barrio}
                                        onChange={(e) => setBarrio(e.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className={labelClassName}>Ciudad</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Bogotá"
                                        value={ciudad}
                                        onChange={(e) => setCiudad(e.target.value)}
                                        className={inputClassName}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        <div>
                            <h2 className={sectionTitleClassName}>Información de Contacto</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>
                        </div>

                        {/* Información Bancaria */}
                        <div>
                            <h2 className={sectionTitleClassName}>Información Bancaria <span className="text-sm font-normal text-gray-500">(Opcional)</span></h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClassName}>Cuenta Daviplata</label>
                                    <input
                                        type="text"
                                        placeholder="Número de cuenta"
                                        value={cuentaDaviplata}
                                        onChange={(e) => setCuentaDaviplata(e.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Cuenta Nequi</label>
                                    <input
                                        type="text"
                                        placeholder="Número de cuenta"
                                        value={cuentaNequi}
                                        onChange={(e) => setCuentaNequi(e.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Cuenta Bancolombia</label>
                                    <input
                                        type="text"
                                        placeholder="Número de cuenta"
                                        value={CuentaBancolombia}
                                        onChange={(e) => setCuentaBancolombia(e.target.value)}
                                        className={inputClassName}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seguridad */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h2 className={sectionTitleClassName}>Seguridad</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClassName}>Contraseña *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 8 caracteres"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            required
                                            autoComplete="new-password"
                                            className={`${password && passwordsMatch ? inputSuccessClassName : inputClassName} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Medidor de fortaleza */}
                                    {password && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-gray-600">
                                                    Fortaleza: {passwordStrength.level}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {passwordStrength.score}/5
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className={`text-xs mt-1 ${
                                                passwordStrength.score <= 2 ? 'text-red-600' : 
                                                passwordStrength.score <= 4 ? 'text-yellow-600' : 
                                                'text-green-600'
                                            }`}>
                                                {passwordStrength.message}
                                            </p>
                                        </div>
                                    )}

                                    {/* Requisitos de contraseña */}
                                    {password && (
                                        <div className="mt-3 space-y-1">
                                            <p className="text-xs font-medium text-gray-600">Requisitos:</p>
                                            <div className="grid grid-cols-2 gap-1">
                                                <div className="flex items-center text-xs">
                                                    {passwordStrength.requirements.length ? (
                                                        <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                    <span className={passwordStrength.requirements.length ? 'text-green-600' : 'text-gray-500'}>
                                                        8+ caracteres
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    {passwordStrength.requirements.uppercase ? (
                                                        <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                    <span className={passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-gray-500'}>
                                                        Mayúscula
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    {passwordStrength.requirements.lowercase ? (
                                                        <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                    <span className={passwordStrength.requirements.lowercase ? 'text-green-600' : 'text-gray-500'}>
                                                        Minúscula
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    {passwordStrength.requirements.number ? (
                                                        <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                    <span className={passwordStrength.requirements.number ? 'text-green-600' : 'text-gray-500'}>
                                                        Número
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    {passwordStrength.requirements.special ? (
                                                        <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                    <span className={passwordStrength.requirements.special ? 'text-green-600' : 'text-gray-500'}>
                                                        Símbolo
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClassName}>Confirmar contraseña *</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Repite tu contraseña"
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                            required
                                            autoComplete="new-password"
                                            className={`${confirmPassword && passwordsMatch ? inputSuccessClassName : (confirmPassword && !passwordsMatch ? inputErrorClassName : inputClassName)} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Indicador de coincidencia */}
                            {confirmPassword && (
                                <div className="mt-3 flex items-center">
                                    {passwordsMatch ? (
                                        <div className="flex items-center text-green-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Las contraseñas coinciden</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-red-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span className="text-sm">Las contraseñas no coinciden</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Botón de registro */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={cargando || !emailValid || !passwordsMatch || passwordStrength.score < 3}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                                    'Registrar Arrendador'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterArrendador;