import React, { useState, useEffect, useCallback, memo } from 'react';
import { getCsrfToken } from '../../utils/csrf';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

// Componentes memoizados para evitar re-renders
const InputField = memo(({ label, name, type = 'text', required = false, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
            <textarea
                name={name}
                value={value || ''}
                onChange={onChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={required}
            />
        ) : type === 'file' ? (
            <input
                type="file"
                name={name}
                onChange={onChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={required}
            />
        )}
    </div>
));

const CheckboxField = memo(({ label, name, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input
            type="checkbox"
            name={name}
            checked={checked || false}
            onChange={onChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
));

const ObservationField = memo(({ label, name, value, onChange }) => (
    <div className="ml-6 mt-2">
        <input
            type="text"
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={label}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
));

const FormSection = memo(({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
));

const RegistroCasasBasico = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        propietario: { id: null },
        tipoInmueble: '',
        usoInmueble: '',
        matriculaInmobiliaria: '',
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
    const [loading, setLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user')) || {};
        const role = userData.groups ? userData.groups[0] : null;
        const id = userData.id;
        const storedPropietarios = JSON.parse(localStorage.getItem('propietarios')) || [];

        setUserRole(role);
        setUserId(id);
        setPropietarios(storedPropietarios);

        if (role === 'propietario') {
            setFormData(prev => ({
                ...prev,
                propietario: { id: id }
            }));
        }
    }, []);

    useEffect(() => {
        if (userRole === 'administrador') {
            fetch(`${API_URL}/api/usuarios_por_grupo/propietario/`)
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

    const handlePropietarioChange = useCallback((e) => {
        const selectedPropietarioId = e.target.value;
        setPropietario(selectedPropietarioId);
        setFormData(prev => ({
            ...prev,
            propietario: { id: selectedPropietarioId }
        }));
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;

        // Para inputs normales y textareas
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleFileChange = useCallback((e) => {
        const { name, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files[0]
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.propietario.id && userRole === 'administrador') {
            alert('Por favor, selecciona un propietario.');
            return;
        }

        setLoading(true);

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
            const response = await fetch(`${API_URL}/api/crear_casa/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                body: form,
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                alert('Casa registrada exitosamente');
                navigate(`/register/Casas`);
            } else {
                const errorData = await response.json();
                console.error(errorData);
                alert(`Error: ${errorData.detail || 'Algo salió mal'}`);
            }
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!userRole || (userRole !== 'administrador' && userRole !== 'propietario')) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <p className="text-red-500 text-center">No tienes permisos para acceder a esta página</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Registro de Casa</h1>

                <form onSubmit={handleSubmit}>
                    {/* Solo para administradores */}
                    {userRole === 'administrador' && (
                        <FormSection title="Seleccionar Propietario">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Propietario <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={propietario}
                                    onChange={handlePropietarioChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        </FormSection>
                    )}

                    {/* Información Básica */}
                    <FormSection title="Información Básica">
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
                        <InputField
                            label="Matrícula Inmobiliaria"
                            name="matriculaInmobiliaria"
                            value={formData.matriculaInmobiliaria}
                            onChange={handleChange}
                            placeholder="Ej: 230-39972"
                            required
                        />
                        <InputField
                            label="Dirección"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Barrio"
                            name="barrio"
                            value={formData.barrio}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Ciudad"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Descripción"
                            name="descripcion"
                            type="textarea"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Condiciones de arrendamiento"
                            name="condiciones"
                            type="textarea"
                            value={formData.condiciones}
                            onChange={handleChange}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CheckboxField
                                label="Con administración"
                                name="con_administracion"
                                checked={formData.con_administracion}
                                onChange={handleChange}
                            />
                            <CheckboxField
                                label="Publicar"
                                name="publicar"
                                checked={formData.publicar}
                                onChange={handleChange}
                            />
                        </div>

                        <InputField
                            label="Foto Principal"
                            name="fotoPrincipal"
                            type="file"
                            onChange={handleFileChange}
                        />
                    </FormSection>

                    {/* Información Económica */}
                    <FormSection title="Información Económica">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputField
                                    label="Canon mensual"
                                    name="canonmensual"
                                    type="number"
                                    value={formData.canonmensual}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <InputField
                                    label="Observación Canon mensual"
                                    name="observacion_canonmensual"
                                    value={formData.observacion_canonmensual}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputField
                                    label="Depósito"
                                    name="deposito"
                                    type="number"
                                    value={formData.deposito}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <InputField
                                    label="Observación Depósito"
                                    name="observacion_deposito"
                                    value={formData.observacion_deposito}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Ambientes */}
                    <FormSection title="Ambientes">
                        <div className="space-y-4">
                            <div>
                                <CheckboxField
                                    label="Sala"
                                    name="sala"
                                    checked={formData.sala}
                                    onChange={handleChange}
                                />
                                {formData.sala && (
                                    <ObservationField
                                        label="Observación Sala"
                                        name="observacion_sala"
                                        value={formData.observacion_sala}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Comedor"
                                    name="comedor"
                                    checked={formData.comedor}
                                    onChange={handleChange}
                                />
                                {formData.comedor && (
                                    <ObservationField
                                        label="Observación Comedor"
                                        name="observacion_comedor"
                                        value={formData.observacion_comedor}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Cocina"
                                    name="cocina"
                                    checked={formData.cocina}
                                    onChange={handleChange}
                                />
                                {formData.cocina && (
                                    <ObservationField
                                        label="Observación Cocina"
                                        name="observacion_cocina"
                                        value={formData.observacion_cocina}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Habitaciones"
                                    name="habitaciones"
                                    checked={formData.habitaciones}
                                    onChange={handleChange}
                                />
                                {formData.habitaciones && (
                                    <ObservationField
                                        label="Observación Habitaciones"
                                        name="observacion_habitaciones"
                                        value={formData.observacion_habitaciones}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Baños"
                                    name="baños"
                                    checked={formData.baños}
                                    onChange={handleChange}
                                />
                                {formData.baños && (
                                    <ObservationField
                                        label="Observación Baños"
                                        name="observacion_baños"
                                        value={formData.observacion_baños}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Patio"
                                    name="patio"
                                    checked={formData.patio}
                                    onChange={handleChange}
                                />
                                {formData.patio && (
                                    <ObservationField
                                        label="Observación Patio"
                                        name="observacion_patio"
                                        value={formData.observacion_patio}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Garage"
                                    name="garage"
                                    checked={formData.garage}
                                    onChange={handleChange}
                                />
                                {formData.garage && (
                                    <ObservationField
                                        label="Observación Garage"
                                        name="observacion_garage"
                                        value={formData.observacion_garage}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Tanque Subterráneo"
                                    name="tanquesubterraneo"
                                    checked={formData.tanquesubterraneo}
                                    onChange={handleChange}
                                />
                                {formData.tanquesubterraneo && (
                                    <ObservationField
                                        label="Observación Tanque subterráneo"
                                        name="observacion_tanquesubterraneo"
                                        value={formData.observacion_tanquesubterraneo}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                        </div>
                    </FormSection>

                    {/* Servicios */}
                    <FormSection title="Servicios">
                        <div className="space-y-4">
                            <div>
                                <CheckboxField
                                    label="Servicio de Agua"
                                    name="ser_agua"
                                    checked={formData.ser_agua}
                                    onChange={handleChange}
                                />
                                {formData.ser_agua && (
                                    <ObservationField
                                        label="Observación Servicio de Agua"
                                        name="observacion_ser_agua"
                                        value={formData.observacion_ser_agua}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Servicio de Energía Eléctrica"
                                    name="ser_energia"
                                    checked={formData.ser_energia}
                                    onChange={handleChange}
                                />
                                {formData.ser_energia && (
                                    <ObservationField
                                        label="Observación Servicio de Energía"
                                        name="observacion_ser_energia"
                                        value={formData.observacion_ser_energia}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Servicio de Gas Domiciliario"
                                    name="ser_gas_domiciliario"
                                    checked={formData.ser_gas_domiciliario}
                                    onChange={handleChange}
                                />
                                {formData.ser_gas_domiciliario && (
                                    <ObservationField
                                        label="Observación Servicio de Gas"
                                        name="observacion_ser_gas_domiciliario"
                                        value={formData.observacion_ser_gas_domiciliario}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div>
                                <CheckboxField
                                    label="Servicio de Bioagrícola"
                                    name="ser_bioagricola"
                                    checked={formData.ser_bioagricola}
                                    onChange={handleChange}
                                />
                                {formData.ser_bioagricola && (
                                    <ObservationField
                                        label="Observación Servicio de Bioagrícola"
                                        name="observacion_ser_bioagricola"
                                        value={formData.observacion_ser_bioagricola}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <InputField
                                label="Otros"
                                name="otros"
                                value={formData.otros}
                                onChange={handleChange}
                            />
                        </div>
                    </FormSection>

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
                            disabled={loading}
                            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Registrando...
                                </span>
                            ) : (
                                'Registrar Casa'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroCasasBasico;