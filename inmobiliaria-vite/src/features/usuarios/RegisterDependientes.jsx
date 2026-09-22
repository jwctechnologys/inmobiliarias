// RegisterDependientes.jsx
import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../utils/csrf';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const RegisterDependientes = () => {
    const [arrendatarios, setArrendatarios] = useState([]);
    const [arrendatario, setArrendatario] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [parentezco, setParentezco] = useState('');
    const [tipoDocumento, setTipoDocumento] = useState('');
    const [docIdentificacion, setDocIdentificacion] = useState('');
    const [lugarExpCedula, setLugarExpCedula] = useState('');
    const [edad, setEdad] = useState('');
    const [ocupacion, setOcupacion] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [genero, setGenero] = useState('');
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

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user')) || {};
        const role = userData.groups ? userData.groups[0] : null;
        const id = userData.id;
        const storedArrendatarios = JSON.parse(localStorage.getItem('arrendatarios')) || [];

        setUserRole(role);
        setUserId(id);
        setArrendatarios(storedArrendatarios);

        if (role === 'arrendatario') {
            setArrendatario(id);
            console.log("Arrendatario asignado:", id);
        }
    }, []);

    useEffect(() => {
        if (userRole === 'administrador') {
            fetch(`${API_URL}/api/arrendatarios/`)
                .then((response) => response.json())
                .then((data) => setArrendatarios(data))
                .catch((error) => console.error('Error al cargar arrendatarios:', error));
        }
    }, [userRole]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);

        const requestBody = {
            arrendatario,
            first_name: firstName,
            last_name: lastName,
            parentezco,
            tipo_documento: tipoDocumento,
            doc_identificacion: docIdentificacion,
            lugarExpCedula,
            ocupacion,
            empresa,
            edad,
            genero,
        };

        console.log("JSON enviado:", requestBody);
        
        try {
            const response = await fetch(`${API_URL}/api/dependientes/create/`, {
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
                alert('Dependiente registrado exitosamente');
                navigate('/');
            } else {
                alert(`Error al registrar dependiente: ${data.error}`);
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
    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-white";
    const selectClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-white";
    const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
    const sectionTitleClassName = "text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-teal-200";

    if (!userRole) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Registrar Dependiente
                    </h1>
                    <Link
                        to="/"
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
                            <div className="bg-teal-50 p-6 rounded-lg">
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
                                    <label className={labelClassName}>Parentezco *</label>
                                    <input
                                        type="text"
                                        value={parentezco}
                                        onChange={(e) => setParentezco(e.target.value)}
                                        required
                                        className={inputClassName}
                                        placeholder="Ej: Hijo, Hermano, Padre"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Edad</label>
                                    <input
                                        type="number"
                                        value={edad}
                                        onChange={(e) => setEdad(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: 25"
                                    />
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
                            </div>
                        </div>

                        {/* Documento de Identidad */}
                        <div>
                            <h2 className={sectionTitleClassName}>Documento de Identidad</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClassName}>Tipo de documento</label>
                                    <select
                                        value={tipoDocumento}
                                        onChange={(e) => setTipoDocumento(e.target.value)}
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
                                    <label className={labelClassName}>Número de documento</label>
                                    <input
                                        type="number"
                                        value={docIdentificacion}
                                        onChange={(e) => setDocIdentificacion(e.target.value)}
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

                        {/* Información Laboral */}
                        <div>
                            <h2 className={sectionTitleClassName}>Información Laboral <span className="text-sm font-normal text-gray-500">(Opcional)</span></h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClassName}>Ocupación</label>
                                    <input
                                        type="text"
                                        value={ocupacion}
                                        onChange={(e) => setOcupacion(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Estudiante, Ingeniero, Comerciante"
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Empresa</label>
                                    <input
                                        type="text"
                                        value={empresa}
                                        onChange={(e) => setEmpresa(e.target.value)}
                                        className={inputClassName}
                                        placeholder="Ej: Empresa S.A.S, Colegio, Independiente"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botón de registro */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                                    'Registrar Dependiente'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterDependientes;