// RegistrarReferencias.jsx
import React, { useState, useEffect } from 'react';
import { getCsrfToken } from './csrf';
import { Link, useNavigate } from 'react-router-dom';

const RegistrarReferencias = () => {
    const [arrendatarios, setArrendatarios] = useState([]);
    const [arrendatario, setArrendatario] = useState('');
    const [userRole, setUserRole] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [ocupacion, setOcupacion] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [celular, setCelular] = useState('');
    const [dir_residencia, setDireccion] = useState('');
    const [barrio, setBarrio] = useState('');
    const [parentezco, setParentezco] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [cargando, setCargando] = useState(false);
    const [celularError, setCelularError] = useState('');

    const navigate = useNavigate();

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

    // Validar celular (10 dígitos)
    const validarCelular = (numero) => {
        const regex = /^[0-9]{10}$/;
        if (numero && !regex.test(numero)) {
            setCelularError('El celular debe tener 10 dígitos');
            return false;
        }
        setCelularError('');
        return true;
    };

    const handleCelularChange = (e) => {
        const value = e.target.value;
        setCelular(value);
        validarCelular(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (celular && !validarCelular(celular)) {
            alert('Por favor ingresa un número de celular válido (10 dígitos)');
            return;
        }

        setCargando(true);

        const requestBody = {
            arrendatario,
            first_name: firstName,
            last_name: lastName,
            ocupacion,
            empresa,
            celular,
            dir_residencia,
            barrio,
            parentezco,
        };

        console.log("JSON enviado:", requestBody);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/referencias/create/`, {
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
                alert('Referencia registrada exitosamente');
                navigate('/register/Arrendatario');
            } else {
                alert(`Error al registrar referencia: ${data.error}`);
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setCargando(false);
        }
    };

    // Clases reutilizables
    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200 bg-white";
    const inputErrorClassName = "w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 bg-white";
    const selectClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200 bg-white";
    const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
    const sectionTitleClassName = "text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-200";

    if (!userRole) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Registrar Referencia
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
                            <div className="bg-amber-50 p-6 rounded-lg">
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
                            <h2 className={sectionTitleClassName}>Información de la Referencia</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClassName}>Nombres *</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className={inputClassName}
                                        placeholder="Ej: María José"
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
                                        placeholder="Ej: González Rodríguez"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Ocupación *</label>
                                    <input
                                        type="text"
                                        value={ocupacion}
                                        onChange={(e) => setOcupacion(e.target.value)}
                                        required
                                        className={inputClassName}
                                        placeholder="Ej: Ingeniero, Profesor, Comerciante"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Empresa</label>
                                    <input
                                        type="text"
                                        value={empresa}
                                        onChange={(e) => setEmpresa(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Empresa S.A.S, Independiente"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        <div>
                            <h2 className={sectionTitleClassName}>Información de Contacto</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClassName}>Celular</label>
                                    <input
                                        type="number"
                                        value={celular}
                                        onChange={handleCelularChange}
                                        className={celularError ? inputErrorClassName : inputClassName}
                                        placeholder="Ej: 3001234567"
                                    />
                                    {celularError && (
                                        <p className="mt-1 text-sm text-red-600">{celularError}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClassName}>Parentezco</label>
                                    <input
                                        type="text"
                                        value={parentezco}
                                        onChange={(e) => setParentezco(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Tío, Amigo, Exjefe"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dirección de Residencia */}
                        <div>
                            <h2 className={sectionTitleClassName}>Dirección de Residencia</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <label className={labelClassName}>Dirección</label>
                                    <input
                                        type="text"
                                        value={dir_residencia}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Carrera 7 # 123-45"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className={labelClassName}>Barrio</label>
                                    <input
                                        type="text"
                                        value={barrio}
                                        onChange={(e) => setBarrio(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Chapinero"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className={labelClassName}>Ciudad (implícita)</label>
                                    <input
                                        type="text"
                                        value="Bogotá"
                                        disabled
                                        className={`${inputClassName} bg-gray-100 cursor-not-allowed`}
                                        placeholder="Ciudad"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">La ciudad se asigna automáticamente</p>
                                </div>
                            </div>
                        </div>

                        {/* Nota informativa */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-blue-700">
                                    Las referencias personales son importantes para validar la información del arrendatario. 
                                    Asegúrate de que los datos sean correctos.
                                </p>
                            </div>
                        </div>

                        {/* Botón de registro */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={cargando || !!celularError}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                                    'Registrar Referencia'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrarReferencias;