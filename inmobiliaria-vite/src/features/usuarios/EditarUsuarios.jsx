// EditarUsuario.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../../utils/csrf';

const EditarUsuario = () => {
    const { id } = useParams();
    const { groups } = useParams();
    const [coarrendatarios, setCoarrendatarios] = useState([]);
    const [dependientes, setDependientes] = useState([]);
    const [referentes, setReferentes] = useState([]);
    const [csrfToken, setCsrfToken] = useState('');
    const [tipoPostulacion, setTipoPostulacion] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('principal');
    const [formData, setFormData] = useState({
        id: id || "",
        first_name: "",
        last_name: "",
        email: "",
        genero: "",
        groups: groups || "",
        tipo_documento: "",
        doc_identificacion: "",
        lugarExpCedula: "",
        direccion: "",
        barrio: "",
        ciudad: "",
        direccionCorrespondencia: "",
        barrioCorrespondencia: "",
        ciudadCorrespondencia: "",
        celular: "",
        celularDos: "",
        cuentaDaviplata: "",
        cuentaNequi: "",
        CuentaBancolombia: "",
        ocupacion: "",
        empresa: "",
        CodClasificaIndustrialIU: "",
        descActividadEconomica: "",
    });
    const [coarrenData, setCoarrenData] = useState({
        arrendatarioId: id || "",
        coarrendatarioId: "",
        first_name: "",
        last_name: "",
        email: "",
        genero: "",
        tipo_documento: "",
        doc_identificacion: "",
        lugarExpCedula: "",
        direccion: "",
        barrio: "",
        ciudad: "",
        direccionCorrespondencia: "",
        barrioCorrespondencia: "",
        ciudadCorrespondencia: "",
        celular: "",
        celularDos: "",
        cuentaDaviplata: "",
        cuentaNequi: "",
        CuentaBancolombia: "",
        ocupacion: "",
        empresa: "",
        CodClasificaIndustrialIU: "",
        descActividadEconomica: "",
    });
    const [depenData, setDepenData] = useState({
        arrendatarioId: id || "",
        dependienteId: "",
        first_name: "",
        last_name: "",
        edad: "",
        ocupacion: "",
        empresa: "",
        parentezco: "",
        tipo_documento: "",
        doc_identificacion: "",
        lugarExpCedula: "",
        genero: "",
    });
    const [referenciaData, setReferenciaData] = useState({
        arrendatarioId: id || "",
        referenciaId: "",
        first_name: "",
        last_name: "",
        ocupacion: "",
        empresa: "",
        celular: "",
        dir_residencia: "",
        barrio: "",
        parentezco: "",
    });
    
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();

    const handlecoarrendatarioChange = (selectedId) => {
        const selectedCoarrendatario = coarrendatarios.find(
            (coarrendatario) => coarrendatario.id === parseInt(selectedId)
        );
        if (selectedCoarrendatario) {
            setCoarrenData({
                coarrendatarioId: selectedCoarrendatario.id,
                first_name: selectedCoarrendatario.first_name,
                last_name: selectedCoarrendatario.last_name,
                email: selectedCoarrendatario.email,
                tipo_documento: selectedCoarrendatario.tipo_documento,
                doc_identificacion: selectedCoarrendatario.n_cedula,
                lugarExpCedula: selectedCoarrendatario.c_exp,
                genero: selectedCoarrendatario.genero,
                ocupacion: selectedCoarrendatario.ocupacion,
                empresa: selectedCoarrendatario.empresa,
                direccionCorrespondencia: selectedCoarrendatario.direccionCorrespondencia,
                barrioCorrespondencia: selectedCoarrendatario.barrioCorrespondencia,
                ciudadCorrespondencia: selectedCoarrendatario.ciudadCorrespondencia,
                direccion: selectedCoarrendatario.direccion,
                barrio: selectedCoarrendatario.barrio,
                ciudad: selectedCoarrendatario.ciudad,
                celular: selectedCoarrendatario.celular,
                celularDos: selectedCoarrendatario.celularDos,
            });
        }
    };

    const handledependientesChange = (selectedId) => {
        const selectedDependientes = dependientes.find(
            (dependiente) => dependiente.id === parseInt(selectedId)
        );
        if (selectedDependientes) {
            setDepenData({
                dependienteId: selectedDependientes.id,
                first_name: selectedDependientes.first_name,
                last_name: selectedDependientes.last_name,
                edad: selectedDependientes.edad,
                ocupacion: selectedDependientes.ocupacion,
                empresa: selectedDependientes.empresa,
                parentezco: selectedDependientes.parentezco,
                tipo_documento: selectedDependientes.tipo_documento,
                doc_identificacion: selectedDependientes.n_cedula,
                lugarExpCedula: selectedDependientes.c_exp,
                genero: selectedDependientes.genero,
            });
        }
    };

    const handleReferenteChange = (selectedId) => {
        const selectedReferentes = referentes.find(
            (referente) => referente.id === parseInt(selectedId)
        );
        if (selectedReferentes) {
            setReferenciaData({
                referenciaId: selectedReferentes.id,
                first_name: selectedReferentes.first_name,
                last_name: selectedReferentes.last_name,
                ocupacion: selectedReferentes.ocupacion,
                empresa: selectedReferentes.empresa,
                celular: selectedReferentes.celular,
                dir_residencia: selectedReferentes.dir_residencia,
                barrio: selectedReferentes.barrio,
                parentezco: selectedReferentes.parentezco,
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleInputCoarren = (e) => {
        const { name, value } = e.target;
        setCoarrenData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleInputDepend = (e) => {
        const { name, value } = e.target;
        setDepenData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleInputReferen = (e) => {
        const { name, value } = e.target;
        setReferenciaData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const groupTipoDocumento = [
        ['CC', 'Cédula de Ciudadanía'],
        ['CE', 'Cédula de Extranjería'],
        ['RC', 'Registro Civil'],
        ['TI', 'Tarjeta de Identidad'],
        ['DNI', 'Documento Nacional de Identidad']
    ];

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    const handleSave = () => {
        console.log("Datos a enviar:", formData);
        const dataToSubmit = {
            id: formData.id,
            groups: groups,
            genero: formData.genero,
            tipo_documento: formData.tipo_documento,
            doc_identificacion: formData.doc_identificacion,
            lugarExpCedula: formData.lugarExpCedula,
            direccion: formData.direccion,
            barrio: formData.barrio,
            ciudad: formData.ciudad,
            direccionCorrespondencia: formData.direccionCorrespondencia,
            barrioCorrespondencia: formData.barrioCorrespondencia,
            ciudadCorrespondencia: formData.ciudadCorrespondencia,
            celular: formData.celular,
            celularDos: formData.celularDos,
            cuentaDaviplata: formData.cuentaDaviplata,
            cuentaNequi: formData.cuentaNequi,
            CuentaBancolombia: formData.CuentaBancolombia,
            ocupacion: formData.ocupacion,
            empresa: formData.empresa,
            CodClasificaIndustrialIU: formData.CodClasificaIndustrialIU,
            descActividadEconomica: formData.descActividadEconomica,
        };
        fetch(`${baseUrl}/api/user_profile_update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify(dataToSubmit),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al actualizar el usuario');
                }
                return response.json();
            })
            .then(() => {
                alert('Usuario actualizado con éxito');
                navigate('/');
            })
            .catch((error) => console.error('Error al actualizar usuario:', error));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requestBody = {
            arrendatarioId: id,
            coarrendatarioId: coarrenData.coarrendatarioId,
            first_name: coarrenData.first_name,
            last_name: coarrenData.last_name,
            email: coarrenData.email,
            tipo_documento: coarrenData.tipo_documento,
            doc_identificacion: coarrenData.doc_identificacion,
            lugarExpCedula: coarrenData.lugarExpCedula,
            genero: coarrenData.genero,
            empresa: coarrenData.empresa,
            ocupacion: coarrenData.ocupacion,
            direccionCorrespondencia: coarrenData.direccionCorrespondencia,
            barrioCorrespondencia: coarrenData.barrioCorrespondencia,
            ciudadCorrespondencia: coarrenData.ciudadCorrespondencia,
            direccion: coarrenData.direccion,
            barrio: coarrenData.barrio,
            ciudad: coarrenData.ciudad,
            celular: coarrenData.celular,
            celularDos: coarrenData.celularDos || null,
        };

        console.log("JSON enviado:", requestBody);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/coarrendatarios/${requestBody.coarrendatarioId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(requestBody)
        });
        console.log('Response:', response);
        const data = await response.json();

        if (response.ok) {
            alert('Coarrendatario actualizado exitosamente');
        } else {
            alert(`Error al actualizar coarrendatario: ${data.error}`);
        }
    };

    const handleDepenSubmit = async (e) => {
        e.preventDefault();

        const requestBody = {
            arrendatarioId: id,
            dependienteId: depenData.dependienteId,
            first_name: depenData.first_name,
            last_name: depenData.last_name,
            edad: depenData.edad,
            ocupacion: depenData.ocupacion,
            empresa: depenData.empresa,
            parentezco: depenData.parentezco,
            tipo_documento: depenData.tipo_documento,
            doc_identificacion: depenData.doc_identificacion,
            lugarExpCedula: depenData.lugarExpCedula,
            genero: depenData.genero,
        };

        console.log("JSON enviado:", requestBody);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dependiente/${requestBody.dependienteId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(requestBody)
        });
        console.log('Response:', response);
        const data = await response.json();

        if (response.ok) {
            alert('Dependiente actualizado exitosamente');
        } else {
            alert(`Error al actualizar dependiente: ${data.error}`);
        }
    };

    const handleReferenciaSubmit = async (e) => {
        e.preventDefault();

        const requestBody = {
            arrendatarioId: id,
            referenciaId: referenciaData.referenciaId,
            first_name: referenciaData.first_name,
            last_name: referenciaData.last_name,
            ocupacion: referenciaData.ocupacion,
            empresa: referenciaData.empresa,
            celular: referenciaData.celular,
            dir_residencia: referenciaData.dir_residencia,
            barrio: referenciaData.barrio,
            parentezco: referenciaData.parentezco,
        };

        console.log("JSON enviado:", requestBody);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/referencias/${requestBody.referenciaId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(requestBody)
        });
        console.log('Response:', response);
        const data = await response.json();

        if (response.ok) {
            alert('Referencia actualizada exitosamente');
        } else {
            alert(`Error al actualizar referencia: ${data.error}`);
        }
    };

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        fetch(`${baseUrl}/api/usuarios_por_grupo/${groups}/${id}/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al cargar los datos del usuario');
                }
                return response.json();
            })
            .then((data) => {
                console.log("Datos recibidos:", data);
                setFormData({
                    id: id || '',
                    first_name: data[0]?.first_name || '',
                    last_name: data[0]?.last_name || '',
                    email: data[0]?.email || '',
                    groups: groups || '',
                    genero: data[0]?.genero || '',
                    tipo_documento: data[0]?.tipo_documento || '',
                    doc_identificacion: data[0]?.doc_identificacion || '',
                    lugarExpCedula: data[0]?.lugarExpCedula || '',
                    direccion: data[0]?.direccion || '',
                    barrio: data[0]?.barrio || '',
                    ciudad: data[0]?.ciudad || '',
                    direccionCorrespondencia: data[0]?.direccionCorrespondencia || '',
                    barrioCorrespondencia: data[0]?.barrioCorrespondencia || '',
                    ciudadCorrespondencia: data[0]?.ciudadCorrespondencia || '',
                    celular: data[0]?.celular || '',
                    celularDos: data[0]?.celularDos || '',
                    cuentaDaviplata: data[0]?.cuentaDaviplata || '',
                    cuentaNequi: data[0]?.cuentaNequi || '',
                    CuentaBancolombia: data[0]?.CuentaBancolombia || '',
                    ocupacion: data[0]?.ocupacion || '',
                    empresa: data[0]?.empresa || '',
                    CodClasificaIndustrialIU: data[0]?.CodClasificaIndustrialIU || '',
                    descActividadEconomica: data[0]?.descActividadEconomica || '',
                });
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al cargar usuario:', error);
                setLoading(false);
            });

        if (groups === 'arrendatario') {
            fetch(`${import.meta.env.VITE_BASE_URL}/api/coarrendatario/?arrendatario_id=${id}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Coarrendatarios relacionados:', data);
                    setCoarrendatarios(data);
                })
                .catch((error) => console.error('Error al cargar coarrendatarios relacionados:', error));

            fetch(`${import.meta.env.VITE_BASE_URL}/api/dependientes/`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Dependientes relacionados:', data);
                    setDependientes(data);
                })
                .catch((error) => console.error('Error al cargar dependientes relacionados:', error));

            fetch(`${import.meta.env.VITE_BASE_URL}/api/referencias/`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Referencias relacionados:', data);
                    setReferentes(data);
                })
                .catch((error) => console.error('Error al cargar referencias relacionados:', error));
        }
    }, [id, groups]);

    // Clases reutilizables
    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white";
    const selectClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white";
    const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
    const sectionTitleClassName = "text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200";
    const tabClassName = (isActive) => `px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${isActive ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando datos del usuario...</p>
                </div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar datos</h2>
                    <p className="text-gray-600">No se pudieron cargar los datos del usuario</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Editar Usuario: {formData.first_name} {formData.last_name}
                    </h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg shadow-sm border border-gray-300 transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                </div>

                {/* Tabs de navegación */}
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('principal')}
                        className={tabClassName(activeTab === 'principal')}
                    >
                        Información Principal
                    </button>
                    {groups === 'arrendatario' && (
                        <>
                            <button
                                onClick={() => setActiveTab('coarrendatario')}
                                className={tabClassName(activeTab === 'coarrendatario')}
                            >
                                Coarrendatarios
                            </button>
                            <button
                                onClick={() => setActiveTab('dependiente')}
                                className={tabClassName(activeTab === 'dependiente')}
                            >
                                Dependientes
                            </button>
                            <button
                                onClick={() => setActiveTab('referencia')}
                                className={tabClassName(activeTab === 'referencia')}
                            >
                                Referencias
                            </button>
                        </>
                    )}
                </div>

                {/* Contenido de las pestañas */}
                <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
                    {/* Pestaña Principal */}
                    {activeTab === 'principal' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Columna izquierda */}
                                <div className="space-y-4">
                                    <h2 className={sectionTitleClassName}>Información Básica</h2>
                                    
                                    <div>
                                        <label className={labelClassName}>Grupo</label>
                                        <input
                                            type="text"
                                            name="groups"
                                            value={formData.groups}
                                            readOnly
                                            className={`${inputClassName} bg-gray-100 cursor-not-allowed`}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Género</label>
                                        <select
                                            name="genero"
                                            value={formData.genero}
                                            onChange={handleInputChange}
                                            required
                                            className={selectClassName}
                                        >
                                            <option value="">Selecciona el género</option>
                                            <option value="F">Femenino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Tipo de Documento</label>
                                        <select
                                            name="tipo_documento"
                                            value={formData.tipo_documento || ''}
                                            onChange={handleInputChange}
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
                                        <label className={labelClassName}>Número de Identificación</label>
                                        <input
                                            type="number"
                                            name="doc_identificacion"
                                            value={formData.doc_identificacion || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Lugar de Expedición</label>
                                        <input
                                            type="text"
                                            name="lugarExpCedula"
                                            value={formData.lugarExpCedula || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>

                                {/* Columna derecha */}
                                <div className="space-y-4">
                                    <h2 className={sectionTitleClassName}>Información de Contacto</h2>
                                    
                                    <div>
                                        <label className={labelClassName}>Dirección de Residencia</label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Barrio de Residencia</label>
                                        <input
                                            type="text"
                                            name="barrio"
                                            value={formData.barrio || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Ciudad de Residencia</label>
                                        <input
                                            type="text"
                                            name="ciudad"
                                            value={formData.ciudad || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Dirección de Correspondencia</label>
                                        <input
                                            type="text"
                                            name="direccionCorrespondencia"
                                            value={formData.direccionCorrespondencia || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Barrio de Correspondencia</label>
                                        <input
                                            type="text"
                                            name="barrioCorrespondencia"
                                            value={formData.barrioCorrespondencia || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Ciudad de Correspondencia</label>
                                        <input
                                            type="text"
                                            name="ciudadCorrespondencia"
                                            value={formData.ciudadCorrespondencia || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Segunda fila */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h2 className={sectionTitleClassName}>Teléfonos</h2>
                                    
                                    <div>
                                        <label className={labelClassName}>Celular Principal</label>
                                        <input
                                            type="number"
                                            name="celular"
                                            value={formData.celular || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Celular Secundario</label>
                                        <input
                                            type="number"
                                            name="celularDos"
                                            value={formData.celularDos || ''}
                                            onChange={handleInputChange}
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>

                                {(formData.groups === 'arrendatario') && (
                                    <div className="space-y-4">
                                        <h2 className={sectionTitleClassName}>Tipo de Postulación</h2>
                                        
                                        <div>
                                            <label className={labelClassName}>Seleccione tipo</label>
                                            <select
                                                value={tipoPostulacion}
                                                onChange={(e) => setTipoPostulacion(e.target.value)}
                                                required
                                                className={selectClassName}
                                            >
                                                <option value="">Seleccione tipo de postulación</option>
                                                <option value="vivienda">Vivienda</option>
                                                <option value="comercial">Comercial</option>
                                            </select>
                                        </div>

                                        {tipoPostulacion === 'comercial' && (
                                            <>
                                                <div>
                                                    <label className={labelClassName}>Código CIIU</label>
                                                    <input
                                                        type="number"
                                                        name="CodClasificaIndustrialIU"
                                                        value={formData.CodClasificaIndustrialIU || ''}
                                                        onChange={handleInputChange}
                                                        className={inputClassName}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClassName}>Descripción de actividad económica</label>
                                                    <input
                                                        type="text"
                                                        name="descActividadEconomica"
                                                        value={formData.descActividadEconomica || ''}
                                                        onChange={handleInputChange}
                                                        className={inputClassName}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {tipoPostulacion === 'vivienda' && (
                                            <>
                                                <div>
                                                    <label className={labelClassName}>Ocupación</label>
                                                    <input
                                                        type="text"
                                                        name="ocupacion"
                                                        value={formData.ocupacion || ''}
                                                        onChange={handleInputChange}
                                                        className={inputClassName}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClassName}>Empresa</label>
                                                    <input
                                                        type="text"
                                                        name="empresa"
                                                        value={formData.empresa || ''}
                                                        onChange={handleInputChange}
                                                        className={inputClassName}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {(formData.groups === 'propietario' || formData.groups === 'administrador') && (
                                    <div className="space-y-4">
                                        <h2 className={sectionTitleClassName}>Información Bancaria</h2>
                                        
                                        <div>
                                            <label className={labelClassName}>Cuenta Daviplata</label>
                                            <input
                                                type="number"
                                                name="cuentaDaviplata"
                                                value={formData.cuentaDaviplata}
                                                onChange={handleInputChange}
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Cuenta Nequi</label>
                                            <input
                                                type="number"
                                                name="cuentaNequi"
                                                value={formData.cuentaNequi || ''}
                                                onChange={handleInputChange}
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Cuenta Bancolombia</label>
                                            <input
                                                type="number"
                                                name="CuentaBancolombia"
                                                value={formData.CuentaBancolombia || ''}
                                                onChange={handleInputChange}
                                                className={inputClassName}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón Guardar */}
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pestaña Coarrendatario */}
                    {activeTab === 'coarrendatario' && groups === 'arrendatario' && (
                        <div className="space-y-6">
                            <h2 className={sectionTitleClassName}>
                                Editar Coarrendatario de {formData.first_name} {formData.last_name}
                            </h2>
                            
                            <div>
                                <label className={labelClassName}>Selecciona el Coarrendatario</label>
                                <select 
                                    name="coarrendatario" 
                                    onChange={(e) => handlecoarrendatarioChange(e.target.value)}
                                    className={selectClassName}
                                >
                                    <option value="">Selecciona un coarrendatario</option>
                                    {coarrendatarios.map((coarrendatario) => (
                                        <option key={coarrendatario.id} value={coarrendatario.id}>
                                            {coarrendatario.first_name} {coarrendatario.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <fieldset 
                                    disabled={!coarrenData.coarrendatarioId}
                                    className={`space-y-6 ${!coarrenData.coarrendatarioId ? 'opacity-50' : ''}`}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-md font-semibold text-gray-700">Información Personal</h3>
                                            
                                            <div>
                                                <label className={labelClassName}>Nombres</label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={coarrenData.first_name || ''}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Apellidos</label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={coarrenData.last_name || ''}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={coarrenData.email || ''}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Género</label>
                                                <select
                                                    name="genero"
                                                    value={coarrenData.genero}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={selectClassName}
                                                >
                                                    <option value="">Selecciona el género</option>
                                                    <option value="F">Femenino</option>
                                                    <option value="M">Masculino</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Ocupación</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ocupación"
                                                    name="ocupacion"
                                                    value={coarrenData.ocupacion}
                                                    onChange={handleInputCoarren}
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Empresa</label>
                                                <input
                                                    type="text"
                                                    name="empresa"
                                                    placeholder="Empresa donde labora"
                                                    value={coarrenData.empresa}
                                                    onChange={handleInputCoarren}
                                                    className={inputClassName}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-md font-semibold text-gray-700">Documento y Contacto</h3>
                                            
                                            <div>
                                                <label className={labelClassName}>Tipo de documento</label>
                                                <select
                                                    name="tipo_documento"
                                                    value={coarrenData.tipo_documento}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={selectClassName}
                                                >
                                                    <option value="">Seleccione tipo</option>
                                                    {groupTipoDocumento.map((option) => (
                                                        <option key={option[0]} value={option[0]}>
                                                            {option[1]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Número de identificación</label>
                                                <input
                                                    type="number"
                                                    name="doc_identificacion"
                                                    value={coarrenData.doc_identificacion || ''}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Lugar de expedición</label>
                                                <input
                                                    type="text"
                                                    name="lugarExpCedula"
                                                    value={coarrenData.lugarExpCedula || ''}
                                                    onChange={handleInputCoarren}
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Dirección de Correspondencia</label>
                                                <input
                                                    type="text"
                                                    name="direccionCorrespondencia"
                                                    placeholder="Dirección de Correspondencia"
                                                    value={coarrenData.direccionCorrespondencia}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Barrio de Correspondencia</label>
                                                <input
                                                    type="text"
                                                    name="barrioCorrespondencia"
                                                    placeholder="Barrio donde recibe correspondencia"
                                                    value={coarrenData.barrioCorrespondencia}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Ciudad de Correspondencia</label>
                                                <input
                                                    type="text"
                                                    name="ciudadCorrespondencia"
                                                    placeholder="Ciudad donde recibe la correspondencia"
                                                    value={coarrenData.ciudadCorrespondencia}
                                                    onChange={handleInputCoarren}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className={labelClassName}>Dirección</label>
                                            <input
                                                type="text"
                                                name="direccion"
                                                value={coarrenData.direccion}
                                                onChange={handleInputCoarren}
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Barrio</label>
                                            <input
                                                type="text"
                                                name="barrio"
                                                value={coarrenData.barrio}
                                                onChange={handleInputCoarren}
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Ciudad</label>
                                            <input
                                                type="text"
                                                name="ciudad"
                                                value={coarrenData.ciudad}
                                                onChange={handleInputCoarren}
                                                className={inputClassName}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClassName}>Celular</label>
                                            <input
                                                type="number"
                                                name="celular"
                                                value={coarrenData.celular}
                                                onChange={handleInputCoarren}
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Otro celular</label>
                                            <input
                                                type="number"
                                                name="celularDos"
                                                value={coarrenData.celularDos}
                                                onChange={handleInputCoarren}
                                                className={inputClassName}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={!coarrenData.coarrendatarioId}
                                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Actualizar Coarrendatario
                                        </button>
                                    </div>
                                </fieldset>
                            </form>
                        </div>
                    )}

                    {/* Pestaña Dependiente */}
                    {activeTab === 'dependiente' && groups === 'arrendatario' && (
                        <div className="space-y-6">
                            <h2 className={sectionTitleClassName}>
                                Editar Dependiente de {formData.first_name} {formData.last_name}
                            </h2>
                            
                            <div>
                                <label className={labelClassName}>Selecciona el Dependiente</label>
                                <select 
                                    name="dependiente" 
                                    onChange={(e) => handledependientesChange(e.target.value)}
                                    className={selectClassName}
                                >
                                    <option value="">Selecciona un dependiente</option>
                                    {dependientes.map((dependiente) => (
                                        <option key={dependiente.id} value={dependiente.id}>
                                            {dependiente.first_name} {dependiente.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <form onSubmit={handleDepenSubmit}>
                                <fieldset 
                                    disabled={!depenData.dependienteId}
                                    className={`space-y-6 ${!depenData.dependienteId ? 'opacity-50' : ''}`}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-md font-semibold text-gray-700">Información Personal</h3>
                                            
                                            <div>
                                                <label className={labelClassName}>Nombres</label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={depenData.first_name || ''}
                                                    onChange={handleInputDepend}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Apellidos</label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={depenData.last_name || ''}
                                                    onChange={handleInputDepend}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Edad</label>
                                                <input
                                                    type="number"
                                                    name="edad"
                                                    value={depenData.edad || ''}
                                                    onChange={handleInputDepend}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Género</label>
                                                <select
                                                    name="genero"
                                                    value={depenData.genero}
                                                    onChange={handleInputDepend}
                                                    required
                                                    className={selectClassName}
                                                >
                                                    <option value="">Selecciona el género</option>
                                                    <option value="F">Femenino</option>
                                                    <option value="M">Masculino</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-md font-semibold text-gray-700">Información Adicional</h3>
                                            
                                            <div>
                                                <label className={labelClassName}>Ocupación</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ocupación"
                                                    name="ocupacion"
                                                    value={depenData.ocupacion}
                                                    onChange={handleInputDepend}
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Empresa</label>
                                                <input
                                                    type="text"
                                                    name="empresa"
                                                    placeholder="Empresa donde labora"
                                                    value={depenData.empresa}
                                                    onChange={handleInputDepend}
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Parentezco</label>
                                                <input
                                                    type="text"
                                                    placeholder="Parentezco"
                                                    name="parentezco"
                                                    value={depenData.parentezco}
                                                    onChange={handleInputDepend}
                                                    className={inputClassName}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className={labelClassName}>Tipo de documento</label>
                                            <select
                                                name="tipo_documento"
                                                value={depenData.tipo_documento}
                                                onChange={handleInputDepend}
                                                required
                                                className={selectClassName}
                                            >
                                                <option value="">Seleccione tipo</option>
                                                {groupTipoDocumento.map((option) => (
                                                    <option key={option[0]} value={option[0]}>
                                                        {option[1]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Número de identificación</label>
                                            <input
                                                type="number"
                                                name="doc_identificacion"
                                                value={depenData.doc_identificacion || ''}
                                                onChange={handleInputDepend}
                                                required
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Lugar de expedición</label>
                                            <input
                                                type="text"
                                                name="lugarExpCedula"
                                                value={depenData.lugarExpCedula || ''}
                                                onChange={handleInputDepend}
                                                className={inputClassName}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={!depenData.dependienteId}
                                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Actualizar Dependiente
                                        </button>
                                    </div>
                                </fieldset>
                            </form>
                        </div>
                    )}

                    {/* Pestaña Referencia */}
                    {activeTab === 'referencia' && groups === 'arrendatario' && (
                        <div className="space-y-6">
                            <h2 className={sectionTitleClassName}>
                                Editar Referencia de {formData.first_name} {formData.last_name}
                            </h2>
                            
                            <div>
                                <label className={labelClassName}>Selecciona una Referencia</label>
                                <select 
                                    name="referente" 
                                    onChange={(e) => handleReferenteChange(e.target.value)}
                                    className={selectClassName}
                                >
                                    <option value="">Selecciona una referencia</option>
                                    {referentes.map((referente) => (
                                        <option key={referente.id} value={referente.id}>
                                            {referente.first_name} {referente.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <form onSubmit={handleReferenciaSubmit}>
                                <fieldset 
                                    disabled={!referenciaData.referenciaId}
                                    className={`space-y-6 ${!referenciaData.referenciaId ? 'opacity-50' : ''}`}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-md font-semibold text-gray-700">Información Personal</h3>
                                            
                                            <div>
                                                <label className={labelClassName}>Nombres</label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={referenciaData.first_name || ''}
                                                    onChange={handleInputReferen}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Apellidos</label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={referenciaData.last_name || ''}
                                                    onChange={handleInputReferen}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Ocupación</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ocupación"
                                                    name="ocupacion"
                                                    value={referenciaData.ocupacion}
                                                    onChange={handleInputReferen}
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Empresa</label>
                                                <input
                                                    type="text"
                                                    name="empresa"
                                                    placeholder="Empresa donde labora"
                                                    value={referenciaData.empresa}
                                                    onChange={handleInputReferen}
                                                    className={inputClassName}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-md font-semibold text-gray-700">Información de Contacto</h3>
                                            
                                            <div>
                                                <label className={labelClassName}>Celular</label>
                                                <input
                                                    type="number"
                                                    name="celular"
                                                    value={referenciaData.celular || ''}
                                                    onChange={handleInputReferen}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Dirección de residencia</label>
                                                <input
                                                    type="text"
                                                    name="dir_residencia"
                                                    value={referenciaData.dir_residencia || ''}
                                                    onChange={handleInputReferen}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Barrio</label>
                                                <input
                                                    type="text"
                                                    name="barrio"
                                                    value={referenciaData.barrio || ''}
                                                    onChange={handleInputReferen}
                                                    required
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClassName}>Parentezco</label>
                                                <input
                                                    type="text"
                                                    placeholder="Parentezco"
                                                    name="parentezco"
                                                    value={referenciaData.parentezco}
                                                    onChange={handleInputReferen}
                                                    className={inputClassName}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={!referenciaData.referenciaId}
                                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Actualizar Referencia
                                        </button>
                                    </div>
                                </fieldset>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditarUsuario;