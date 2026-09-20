import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../csrf';
import { useParams, useNavigate } from "react-router-dom";

const ActualizarCasas = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        propietario: { id: null },
        tipoInmueble: '',
        usoInmueble: '',
        matriculaInmobiliaria: '',  // ← Agregar este campo
        direccion: '',
        barrio: '',
        ciudad: '',
        descripcion: '',
        condiciones: '',
        con_administracion: false,
        fotoPrincipal: null,
        publicar: false,
        canonmensual: '',
        observacion_canonmensual: '',
        deposito: '',
        observacion_deposito: '',
        sala: false,
        observacion_sala: '',
        comedor: false,
        observacion_comedor: '',
        cocina: false,
        observacion_cocina: '',
        habitaciones: false,
        observacion_habitaciones: '',
        baños: false,
        observacion_baños: '',
        patio: false,
        observacion_patio: '',
        garage: false,
        observacion_garage: '',
        tanquesubterraneo: false,
        observacion_tanquesubterraneo: '',
        ser_agua: true,
        observacion_ser_agua: '',
        ser_energia: true,
        observacion_ser_energia: '',
        ser_gas_domiciliario: true,
        observacion_ser_gas_domiciliario: '',
        ser_bioagricola: true,
        observacion_ser_bioagricola: '',
        otros: '',
    });

    const [propietarios, setPropietarios] = useState([]);
    const [propietario, setPropietario] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');
    const [casas, setCasas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [csrfToken, setCsrfToken] = useState('');
    const { casaId } = useParams();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user')) || {};
        const role = userData.groups ? userData.groups[0] : null;
        const id = userData.id;

        setUserRole(role);
        setUserId(id);

        if (role === 'propietario') {
            setFormData(prev => ({
                ...prev,
                propietario: { id: id }
            }));
        }
    }, []);

    useEffect(() => {
        if (userRole === 'administrador') {
            fetch(`${import.meta.env.VITE_BASE_URL}/api/usuarios_por_grupo/propietario/`)
                .then((response) => response.json())
                .then((data) => setPropietarios(data))
                .catch((error) => console.error('Error al cargar propietarios:', error));
        }
    }, [userRole]);

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    useEffect(() => {
        const fetchCasa = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/casas/?arrendar=${casaId}`);
                const data = await response.json();
                const casaData = data[0];
                setCasas(data);

                // Cargar datos actuales al formulario
                setFormData(prev => ({
                    ...prev,
                    tipoInmueble: casaData.tipoInmueble || '',
                    usoInmueble: casaData.usoInmueble || '',
                    matriculaInmobiliaria: casaData.matriculaInmobiliaria || '',  // ← Agregar
                    direccion: casaData.direccion || '',
                    barrio: casaData.barrio || '',
                    ciudad: casaData.ciudad || '',
                    descripcion: casaData.descripcion || '',
                    condiciones: casaData.condiciones || '',
                    con_administracion: casaData.con_administracion || false,
                    publicar: casaData.publicar || false,
                    canonmensual: casaData.canonmensual || '',
                    observacion_canonmensual: casaData.observacion_canonmensual || '',
                    deposito: casaData.deposito || '',
                    observacion_deposito: casaData.observacion_deposito || '',
                    sala: casaData.sala || false,
                    observacion_sala: casaData.observacion_sala || '',
                    comedor: casaData.comedor || false,
                    observacion_comedor: casaData.observacion_comedor || '',
                    cocina: casaData.cocina || false,
                    observacion_cocina: casaData.observacion_cocina || '',
                    habitaciones: casaData.habitaciones || false,
                    observacion_habitaciones: casaData.observacion_habitaciones || '',
                    baños: casaData.baños || false,
                    observacion_baños: casaData.observacion_baños || '',
                    patio: casaData.patio || false,
                    observacion_patio: casaData.observacion_patio || '',
                    garage: casaData.garage || false,
                    observacion_garage: casaData.observacion_garage || '',
                    tanquesubterraneo: casaData.tanquesubterraneo || false,
                    observacion_tanquesubterraneo: casaData.observacion_tanquesubterraneo || '',
                    ser_agua: casaData.ser_agua !== undefined ? casaData.ser_agua : true,
                    observacion_ser_agua: casaData.observacion_ser_agua || '',
                    ser_energia: casaData.ser_energia !== undefined ? casaData.ser_energia : true,
                    observacion_ser_energia: casaData.observacion_ser_energia || '',
                    ser_gas_domiciliario: casaData.ser_gas_domiciliario !== undefined ? casaData.ser_gas_domiciliario : true,
                    observacion_ser_gas_domiciliario: casaData.observacion_ser_gas_domiciliario || '',
                    ser_bioagricola: casaData.ser_bioagricola !== undefined ? casaData.ser_bioagricola : true,
                    observacion_ser_bioagricola: casaData.observacion_ser_bioagricola || '',
                    otros: casaData.otros || '',
                }));

                if (userRole === 'administrador' && casaData.propietario) {
                    setPropietario(casaData.propietario);
                    setFormData(prev => ({
                        ...prev,
                        propietario: { id: casaData.propietario }
                    }));
                }

                setLoading(false);
            } catch (error) {
                console.error("Error al cargar la casa:", error);
                setLoading(false);
            }
        };

        if (casaId) {
            fetchCasa();
        }
    }, [casaId, userRole]);

    const handlePropietarioChange = (e) => {
        const selectedPropietarioId = e.target.value;
        setPropietario(selectedPropietarioId);
        setFormData(prev => ({
            ...prev,
            propietario: { id: selectedPropietarioId }
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.propietario.id && userRole === 'administrador') {
            alert('Por favor, selecciona un propietario.');
            return;
        }

        setUpdating(true);
        const form = new FormData();

        for (const key in formData) {
            if (formData[key] !== null && formData[key] !== '') {
                if (key === 'propietario') {
                    form.append(key, formData[key].id);
                } else {
                    form.append(key, formData[key]);
                }
            }
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/casas/${casaId}/`, {
                method: 'PATCH',
                headers: { 'X-CSRFToken': csrfToken },
                body: form,
                credentials: 'include',
            });

            if (response.ok) {
                alert('Casa actualizada exitosamente');
                navigate('/register/Casas');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.detail || 'Algo salió mal'}`);
            }
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos de la casa...</p>
                </div>
            </div>
        );
    }

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const sectionClass = "bg-white rounded-lg shadow-md p-6 mb-6";
    const titleClass = "text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200";

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Actualizar Casa</h1>
                    <button
                        onClick={() => navigate('/register/Casas')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                        ← Volver a Mis Casas
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Selección de Propietario (solo administradores) */}
                    {userRole === 'administrador' && (
                        <div className={sectionClass}>
                            <h2 className={titleClass}>👑 Propietario</h2>
                            <div>
                                <label className={labelClass}>Seleccionar Propietario:</label>
                                <select
                                    value={propietario}
                                    onChange={handlePropietarioChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Selecciona un Propietario</option>
                                    {propietarios.map((prop) => (
                                        <option key={prop.id} value={prop.id}>
                                            {prop.first_name} {prop.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Información Básica */}
                    <div className={sectionClass}>
                        <h2 className={titleClass}>🏠 Información Básica</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Inmueble
                                    <span className="text-gray-400 text-xs ml-2 font-normal">
                                        (Ej: Casa, Apartamento, Habitación, Local)
                                    </span>
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="tipoInmueble"
                                    value={formData.tipoInmueble}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Uso del Inmueble
                                    <span className="text-gray-400 text-xs ml-2 font-normal">
                                        (Ej: Vivienda, Comercial, Industrial)
                                    </span>
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="usoInmueble"
                                    value={formData.usoInmueble}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Matrícula Inmobiliaria:</label>
                                <input
                                    type="text"
                                    name="matriculaInmobiliaria"
                                    value={formData.matriculaInmobiliaria}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Ej: 230-39972"
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Dirección:</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Barrio:</label>
                                <input
                                    type="text"
                                    name="barrio"
                                    value={formData.barrio}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Ciudad:</label>
                                <input
                                    type="text"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className={labelClass}>Descripción:</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                                className={inputClass}
                            />
                        </div>
                        <div className="mt-4">
                            <label className={labelClass}>Condiciones de arrendamiento:</label>
                            <textarea
                                name="condiciones"
                                value={formData.condiciones}
                                onChange={handleChange}
                                rows="3"
                                className={inputClass}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="con_administracion"
                                    checked={formData.con_administracion}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-700">Con administración</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="publicar"
                                    checked={formData.publicar}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-700">Publicar</span>
                            </label>
                        </div>
                        <div className="mt-4">
                            <label className={labelClass}>Foto Principal:</label>
                            <input
                                type="file"
                                name="fotoPrincipal"
                                onChange={handleChange}
                                accept="image/*"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {casas && casas[0]?.fotoPrincipal && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-1">Foto actual:</p>
                                    <img
                                        src={casas[0].fotoPrincipal}
                                        alt="Foto principal"
                                        className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información Económica */}
                    <div className={sectionClass}>
                        <h2 className={titleClass}>💰 Información Económica</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Canon mensual ($):</label>
                                <input
                                    type="number"
                                    name="canonmensual"
                                    value={formData.canonmensual}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Observación Canon mensual:</label>
                                <input
                                    type="text"
                                    name="observacion_canonmensual"
                                    value={formData.observacion_canonmensual}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Aporte Voluntario ($):</label>
                                <input
                                    type="number"
                                    name="deposito"
                                    value={formData.deposito}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Observación Aporte Voluntario:</label>
                                <input
                                    type="text"
                                    name="observacion_deposito"
                                    value={formData.observacion_deposito}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ambientes */}
                    <div className={sectionClass}>
                        <h2 className={titleClass}>🛋️ Ambientes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'sala', label: 'Sala', obsName: 'observacion_sala' },
                                { name: 'comedor', label: 'Comedor', obsName: 'observacion_comedor' },
                                { name: 'cocina', label: 'Cocina', obsName: 'observacion_cocina' },
                                { name: 'habitaciones', label: 'Habitaciones', obsName: 'observacion_habitaciones' },
                                { name: 'baños', label: 'Baños', obsName: 'observacion_baños' },
                                { name: 'patio', label: 'Patio', obsName: 'observacion_patio' },
                                { name: 'garage', label: 'Garage', obsName: 'observacion_garage' },
                                { name: 'tanquesubterraneo', label: 'Tanque Subterráneo', obsName: 'observacion_tanquesubterraneo' },
                            ].map((item) => (
                                <div key={item.name} className="border border-gray-200 rounded-lg p-3">
                                    <label className="flex items-center space-x-2 cursor-pointer mb-2">
                                        <input
                                            type="checkbox"
                                            name={item.name}
                                            checked={formData[item.name]}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="font-medium text-gray-700">{item.label}</span>
                                    </label>
                                    {formData[item.name] && (
                                        <input
                                            type="text"
                                            name={item.obsName}
                                            value={formData[item.obsName]}
                                            onChange={handleChange}
                                            placeholder={`Observación de ${item.label.toLowerCase()}`}
                                            className={`${inputClass} text-sm`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Servicios */}
                    <div className={sectionClass}>
                        <h2 className={titleClass}>⚡ Servicios</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'ser_agua', label: 'Agua', obsName: 'observacion_ser_agua' },
                                { name: 'ser_energia', label: 'Energía Eléctrica', obsName: 'observacion_ser_energia' },
                                { name: 'ser_gas_domiciliario', label: 'Gas Domiciliario', obsName: 'observacion_ser_gas_domiciliario' },
                                { name: 'ser_bioagricola', label: 'Bioagrícola', obsName: 'observacion_ser_bioagricola' },
                            ].map((item) => (
                                <div key={item.name} className="border border-gray-200 rounded-lg p-3">
                                    <label className="flex items-center space-x-2 cursor-pointer mb-2">
                                        <input
                                            type="checkbox"
                                            name={item.name}
                                            checked={formData[item.name]}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="font-medium text-gray-700">{item.label}</span>
                                    </label>
                                    {formData[item.name] && (
                                        <input
                                            type="text"
                                            name={item.obsName}
                                            value={formData[item.obsName]}
                                            onChange={handleChange}
                                            placeholder={`Observación de servicio de ${item.label.toLowerCase()}`}
                                            className={`${inputClass} text-sm`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <label className={labelClass}>Otros servicios:</label>
                            <input
                                type="text"
                                name="otros"
                                value={formData.otros}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Especifica otros servicios disponibles"
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/register/Casas')}
                            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${updating
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                        >
                            {updating ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Actualizando...
                                </span>
                            ) : (
                                'Actualizar Casa'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActualizarCasas;