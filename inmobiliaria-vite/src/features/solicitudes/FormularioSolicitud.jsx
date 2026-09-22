// FormularioSolicitud.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCsrfToken } from '../../utils/csrf';


// Componentes modulares
import InformacionGeneral from './components/InformacionGeneral';
import DatosArrendatario from './components/DatosArrendatario';
import InformacionLaboral from './components/InformacionLaboral';
import CoarrendatarioSection from './components/CoarrendatarioSection';
import GarantiasSection from './components/GarantiasSection';
import HabitantesSection from './components/HabitantesSection';
import ReferenciasSection from './components/ReferenciasSection';
import DocumentosSection from './components/DocumentosSection';
import AutorizacionSection from './components/AutorizacionSection';
import VistaPrevia from './components/VistaPrevia';

const FormularioSolicitud = () => {
    const navigate = useNavigate();
    const { casaId } = useParams();
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [casaInfo, setCasaInfo] = useState(null);
    const [perfilArrendatario, setPerfilArrendatario] = useState(null);
    const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
    const [aceptado, setAceptado] = useState(false);
    const [declaracionIngresosId, setDeclaracionIngresosId] = useState(null);
    const [mostrarNuevaDeclaracion, setMostrarNuevaDeclaracion] = useState(false);
    const [errorGeneral, setErrorGeneral] = useState('');
    const [erroresValidacion, setErroresValidacion] = useState({});

    const [errorSubmit, setErrorSubmit] = useState(null);
    const [detallesError, setDetallesError] = useState(null);
    const [guardandoElemento, setGuardandoElemento] = useState(false);
    const [mensajeGuardado, setMensajeGuardado] = useState(null);

    // DATOS EXISTENTES (originales del backend)
    const [datosExistentes, setDatosExistentes] = useState({
        coarrendatarios: [],
        dependientes: [],
        referencias: [],
        declaracionesIngresos: []
    });

    // Estado del formulario - AHORA UNIFICADO
    const [formData, setFormData] = useState({
        duracionContrato: 12,
        duracionContratoPersonalizado: false,
        empresa_laboral: '',
        cargo: '',
        tipoContrato: '',
        jefeInmediato: '',
        tiempoLaboral: '',
        salarioBasicoMensual: '',
        otrosIngresos: '',
        telefonoEmpresa: '',
        direccion_laboral: '',
        declaraRenta: false,

        // COARRENDATARIO - DATOS UNIFICADOS
        coarrendatarioSeleccionado: null,
        coarrendatario: {
            id: null,
            first_name: '',
            last_name: '',
            tipo_documento: '',
            doc_identificacion: '',
            lugarExpCedula: '',
            parentezco: '',
            celular: '',
            email: '',
            direccion: '',
            barrio: '',
            ciudad: '',
            empresa: '',
            ocupacion: '',
            ingresosMensualesTotales: '',
            declaraRenta: false,
            genero: ''
        },
        crearNuevoCoarrendatario: false,

        dependientesSeleccionados: [],
        dependientesNuevos: [],

        referenciasSeleccionadas: [],
        referenciasNuevas: [],

        seguroArrendamiento: false,
        depositoVoluntario: false,
        valorDepositoVoluntario: '',
        otraGarantiaAcordada: false,
        especificacionOtraGarantiaAcordada: '',

        mascotas: false,
        numMascotas: '',
        tipoMascotas: '',

        nombreArrendadorAnterior: '',
        telefonoArrendadorAnterior: '',
        direccionArrendadorAnterior: '',
        motivoRetiro: '',

        autorizacionDatos: false,

        documentos: {
            cedulaArrendatario: null,
            cedulaCodeudor: null,
            cedulasHabitantes: [],
            certificado_laboral_arrendatario: null,
            certificado_laboral_codeudor: null,
            desprendible_nomina_arrendatario: null,
            desprendible_nomina_codeudor: null,
            declaracion_renta_arrendatario: null,
            declaracion_renta_codeudor: null,
            camara_comercio_arrendatario: null,
            camara_comercio_codeudor: null,
        }
    });

    const [nombresArchivos, setNombresArchivos] = useState({
        cedulaArrendatario: '',
        cedulaCodeudor: '',
        cedulasHabitantes: '',
        certificado_laboral_arrendatario: '',
        certificado_laboral_codeudor: '',
        desprendible_nomina_arrendatario: '',
        desprendible_nomina_codeudor: '',
        declaracion_renta_arrendatario: '',
        declaracion_renta_codeudor: '',
        camara_comercio_arrendatario: '',
        camara_comercio_codeudor: '',
    });

    // ==================== FUNCIONES DE ACTUALIZACIÓN EN BACKEND ====================

    const actualizarCoarrendatario = async (id, data) => {
        try {
            setGuardandoElemento(true);
            const user = JSON.parse(localStorage.getItem('user'));

            const cleanData = { ...data };
            delete cleanData.id;

            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/coarrendatarios/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...cleanData,
                    arrendatario: perfilArrendatario.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al actualizar coarrendatario: ${JSON.stringify(errorData)}`);
            }

            const updatedData = await response.json();

            setDatosExistentes(prev => ({
                ...prev,
                coarrendatarios: prev.coarrendatarios.map(c =>
                    c.id === id ? updatedData : c
                )
            }));

            // Actualizar también formData.coarrendatario con los datos actualizados
            setFormData(prev => ({
                ...prev,
                coarrendatario: {
                    ...prev.coarrendatario,
                    ...updatedData
                }
            }));

            setMensajeGuardado('✅ Coarrendatario actualizado exitosamente');
            setTimeout(() => setMensajeGuardado(null), 3000);

            return updatedData;
        } catch (error) {
            console.error('Error en actualizarCoarrendatario:', error);
            setErrorGeneral(`Error al actualizar coarrendatario: ${error.message}`);
            throw error;
        } finally {
            setGuardandoElemento(false);
        }
    };

    const actualizarDependiente = async (id, data) => {
        try {
            setGuardandoElemento(true);
            const user = JSON.parse(localStorage.getItem('user'));

            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dependiente/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...data,
                    arrendatario: perfilArrendatario.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al actualizar dependiente: ${JSON.stringify(errorData)}`);
            }

            const updatedData = await response.json();

            setDatosExistentes(prev => ({
                ...prev,
                dependientes: prev.dependientes.map(d =>
                    d.id === id ? updatedData : d
                )
            }));

            setMensajeGuardado('✅ Dependiente actualizado exitosamente');
            setTimeout(() => setMensajeGuardado(null), 3000);

            return updatedData;
        } catch (error) {
            console.error('Error en actualizarDependiente:', error);
            setErrorGeneral(`Error al actualizar dependiente: ${error.message}`);
            throw error;
        } finally {
            setGuardandoElemento(false);
        }
    };

    const actualizarReferencia = async (id, data) => {
        try {
            setGuardandoElemento(true);
            const user = JSON.parse(localStorage.getItem('user'));

            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/referencias/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...data,
                    arrendatario: perfilArrendatario.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al actualizar referencia: ${JSON.stringify(errorData)}`);
            }

            const updatedData = await response.json();

            setDatosExistentes(prev => ({
                ...prev,
                referencias: prev.referencias.map(r =>
                    r.id === id ? updatedData : r
                )
            }));

            setMensajeGuardado('✅ Referencia actualizada exitosamente');
            setTimeout(() => setMensajeGuardado(null), 3000);

            return updatedData;
        } catch (error) {
            console.error('Error en actualizarReferencia:', error);
            setErrorGeneral(`Error al actualizar referencia: ${error.message}`);
            throw error;
        } finally {
            setGuardandoElemento(false);
        }
    };

    const actualizarDeclaracionIngresos = async (id, data) => {
        try {
            setGuardandoElemento(true);
            const user = JSON.parse(localStorage.getItem('user'));

            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/declaraciones-ingresos/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...data,
                    arrendatario: perfilArrendatario.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al actualizar declaración: ${JSON.stringify(errorData)}`);
            }

            const updatedData = await response.json();

            setDatosExistentes(prev => ({
                ...prev,
                declaracionesIngresos: prev.declaracionesIngresos.map(d =>
                    d.id === id ? updatedData : d
                )
            }));

            setMensajeGuardado('✅ Declaración de ingresos actualizada exitosamente');
            setTimeout(() => setMensajeGuardado(null), 3000);

            return updatedData;
        } catch (error) {
            console.error('Error en actualizarDeclaracionIngresos:', error);
            setErrorGeneral(`Error al actualizar declaración de ingresos: ${error.message}`);
            throw error;
        } finally {
            setGuardandoElemento(false);
        }
    };

    // ==================== FUNCIONES DE CARGA DE DATOS ====================

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getCsrfToken();
                setCsrfToken(token);

                const casaResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/casas/${casaId}`);
                const casaData = await casaResponse.json();
                setCasaInfo(casaData);

                const user = JSON.parse(localStorage.getItem('user'));
                //console.log("user", user);
                if (user && user.id) {
                    const perfilResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/usuarios_por_grupo/arrendatario/${user.id}/`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`,
                        },
                        credentials: 'include',
                    });

                    if (perfilResponse.ok) {
                        const perfilData = await perfilResponse.json();
                        //console.log("aaaa", perfilData);
                        const arrendatario = perfilData[0];
                        setPerfilArrendatario(arrendatario);

                        setFormData(prev => ({
                            ...prev,
                            empresa_laboral: arrendatario?.empresa || '',
                            cargo: arrendatario?.ocupacion || '',
                        }));

                        await cargarDatosExistentes(arrendatario?.id, user.token);
                    }
                }

                setCargandoDatos(false);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setErrorGeneral('Error al cargar los datos');
                setCargandoDatos(false);
            }
        };

        fetchData();
    }, [casaId]);

    const cargarDatosExistentes = async (arrendatarioId, token) => {
        try {
            const [coarrendatariosRes, dependientesRes, referenciasRes, declaracionesRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_BASE_URL}/api/coarrendatario/?arrendatario_id=${arrendatarioId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_BASE_URL}/api/dependientes/?arrendatarioID=${arrendatarioId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_BASE_URL}/api/referencias/?arrendatarioID=${arrendatarioId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_BASE_URL}/api/declaraciones-ingresos/?arrendatario_id=${arrendatarioId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (coarrendatariosRes.ok) {
                const coarrendatarios = await coarrendatariosRes.json();
                setDatosExistentes(prev => ({ ...prev, coarrendatarios }));

                // Si hay coarrendatarios, seleccionar el primero por defecto
                if (coarrendatarios.length > 0) {
                    const primerCoarrendatario = coarrendatarios[0];
                    setFormData(prev => ({
                        ...prev,
                        coarrendatarioSeleccionado: primerCoarrendatario.id,
                        coarrendatario: {
                            ...prev.coarrendatario,
                            id: primerCoarrendatario.id,
                            first_name: primerCoarrendatario.first_name || '',
                            last_name: primerCoarrendatario.last_name || '',
                            tipo_documento: primerCoarrendatario.tipo_documento || '',
                            doc_identificacion: primerCoarrendatario.n_cedula || '',
                            lugarExpCedula: primerCoarrendatario.c_exp || '',
                            parentezco: primerCoarrendatario.parentezco || '',
                            celular: primerCoarrendatario.celular || '',
                            email: primerCoarrendatario.email || '',
                            direccion: primerCoarrendatario.direccion || '',
                            barrio: primerCoarrendatario.barrio || '',
                            ciudad: primerCoarrendatario.ciudad || '',
                            empresa: primerCoarrendatario.empresa || '',
                            ocupacion: primerCoarrendatario.ocupacion || '',
                            ingresosMensualesTotales: primerCoarrendatario.ingresosMensualesTotales || '',
                            declaraRenta: primerCoarrendatario.declaraRenta || false,
                            genero: primerCoarrendatario.genero || ''
                        }
                    }));
                }
            }
            if (dependientesRes.ok) {
                const dependientes = await dependientesRes.json();
                setDatosExistentes(prev => ({ ...prev, dependientes }));
            }
            if (referenciasRes.ok) {
                const referencias = await referenciasRes.json();
                setDatosExistentes(prev => ({ ...prev, referencias }));
            }
            if (declaracionesRes.ok) {
                const declaraciones = await declaracionesRes.json();
                setDatosExistentes(prev => ({ ...prev, declaracionesIngresos: declaraciones }));

                if (declaraciones.length > 0) {
                    const ultimaDeclaracion = declaraciones[declaraciones.length - 1];
                    setDeclaracionIngresosId(ultimaDeclaracion.id);
                    cargarDatosDeclaracion(ultimaDeclaracion);
                }
            }
        } catch (error) {
            console.error('Error cargando datos existentes:', error);
        }
    };

    const cargarDatosDeclaracion = (declaracion) => {
        setFormData(prev => ({
            ...prev,
            empresa_laboral: declaracion.empresa || '',
            cargo: declaracion.ocupacion || '',
            tipoContrato: declaracion.tipoContrato || '',
            jefeInmediato: declaracion.jefeInmediato || '',
            tiempoLaboral: declaracion.tiempoLaboral || '',
            salarioBasicoMensual: declaracion.salarioBasicoMensual || '',
            otrosIngresos: declaracion.otrosIngresos || '',
            telefonoEmpresa: declaracion.telefonoEmpresa || '',
            direccion_laboral: declaracion.direccion_laboral || '',
            declaraRenta: declaracion.declaraRenta || false,
        }));
    };

    // ==================== HANDLERS ====================

    const handleDeclaracionChange = (id, data) => {
        setDeclaracionIngresosId(id);
        setMostrarNuevaDeclaracion(!id);
        if (data) {
            cargarDatosDeclaracion(data);
        }
    };

    const validarGarantias = () => {
        const tieneGarantia = formData.seguroArrendamiento ||
            formData.depositoVoluntario ||
            formData.otraGarantiaAcordada;

        if (!tieneGarantia) {
            setErrorGeneral('Debe seleccionar al menos una garantía');
            return false;
        }
        return true;
    };

    const validarFormulario = () => {
        const errores = {};

        if (!formData.documentos.cedulaArrendatario) {
            errores.cedulaArrendatario = 'La cédula del arrendatario es obligatoria';
        }
        if (!formData.documentos.cedulaCodeudor) {
            errores.cedulaCodeudor = 'La cédula del codeudor es obligatoria';
        }

        if (!formData.autorizacionDatos) {
            errores.autorizacionDatos = 'Debe aceptar la autorización de tratamiento de datos';
        }

        if (!validarGarantias()) {
            errores.garantias = 'Debe seleccionar al menos una garantía';
        }

        setErroresValidacion(errores);
        return Object.keys(errores).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (erroresValidacion[name]) {
            setErroresValidacion(prev => ({ ...prev, [name]: null }));
        }
    };

    // ==================== HANDLERS COARRENDATARIO CORREGIDOS ====================

    const handleCoarrendatarioSeleccionado = (coarrendatarioId) => {
        // Buscar el coarrendatario en datosExistentes
        const coarrendatario = datosExistentes.coarrendatarios.find(c => c.id === coarrendatarioId);

        if (coarrendatario) {
            setFormData(prev => ({
                ...prev,
                coarrendatarioSeleccionado: coarrendatarioId,
                crearNuevoCoarrendatario: false,
                coarrendatario: {
                    id: coarrendatario.id,
                    first_name: coarrendatario.first_name || '',
                    last_name: coarrendatario.last_name || '',
                    tipo_documento: coarrendatario.tipo_documento || '',
                    doc_identificacion: coarrendatario.doc_identificacion || '',
                    lugarExpCedula: coarrendatario.lugarExpCedula || '',
                    parentezco: coarrendatario.parentezco || '',
                    celular: coarrendatario.celular || '',
                    email: coarrendatario.email || '',
                    direccion: coarrendatario.direccion || '',
                    barrio: coarrendatario.barrio || '',
                    ciudad: coarrendatario.ciudad || '',
                    empresa: coarrendatario.empresa || '',
                    ocupacion: coarrendatario.ocupacion || '',
                    ingresosMensualesTotales: coarrendatario.ingresosMensualesTotales || '',
                    declaraRenta: coarrendatario.declaraRenta || false,
                    genero: coarrendatario.genero || ''
                }
            }));
        }
    };

    const handleCoarrendatarioChange = (e) => {
        const { name, value, type, checked } = e.target;
        const valor = type === 'checkbox' ? checked : value;

        // Actualizar formData.coarrendatario
        setFormData(prev => ({
            ...prev,
            coarrendatario: {
                ...prev.coarrendatario,
                [name]: valor
            }
        }));
    };

    const toggleCrearNuevoCoarrendatario = () => {
        setFormData(prev => ({
            ...prev,
            crearNuevoCoarrendatario: !prev.crearNuevoCoarrendatario,
            coarrendatarioSeleccionado: null,
            coarrendatario: {
                id: null,
                first_name: '',
                last_name: '',
                tipo_documento: '',
                doc_identificacion: '',
                lugarExpCedula: '',
                parentezco: '',
                celular: '',
                email: '',
                direccion: '',
                barrio: '',
                ciudad: '',
                empresa: '',
                ocupacion: '',
                ingresosMensualesTotales: '',
                declaraRenta: false,
                genero: ''
            }
        }));
    };

    const guardarCambiosCoarrendatarioLocal = () => {
        if (formData.coarrendatarioSeleccionado) {
            // Actualizar datosExistentes con los cambios locales
            setDatosExistentes(prev => ({
                ...prev,
                coarrendatarios: prev.coarrendatarios.map(c =>
                    c.id === formData.coarrendatarioSeleccionado ?
                        { ...c, ...formData.coarrendatario } : c
                )
            }));

            setMensajeGuardado('✅ Cambios guardados localmente');
            setTimeout(() => setMensajeGuardado(null), 3000);
        }
    };

    // ==================== HANDLERS DEPENDIENTES ====================

    const handleDependienteSeleccionado = (dependienteId) => {
        setFormData(prev => {
            const seleccionados = [...prev.dependientesSeleccionados];
            const index = seleccionados.indexOf(dependienteId);
            if (index > -1) {
                seleccionados.splice(index, 1);
            } else {
                seleccionados.push(dependienteId);
            }
            return { ...prev, dependientesSeleccionados: seleccionados };
        });
    };

    const agregarDependienteNuevo = () => {
        setFormData(prev => ({
            ...prev,
            dependientesNuevos: [
                ...prev.dependientesNuevos,
                {
                    id: Date.now(),
                    first_name: '',
                    last_name: '',
                    edad: '',
                    tipo_documento: '',
                    doc_identificacion: '',
                    lugarExpCedula: '',
                    ocupacion: '',
                    parentezco: ''
                }
            ]
        }));
    };

    const eliminarDependienteNuevo = (id) => {
        setFormData(prev => ({
            ...prev,
            dependientesNuevos: prev.dependientesNuevos.filter(d => d.id !== id)
        }));
    };

    const actualizarDependienteNuevo = (id, campo, valor) => {
        setFormData(prev => ({
            ...prev,
            dependientesNuevos: prev.dependientesNuevos.map(d =>
                d.id === id ? { ...d, [campo]: valor } : d
            )
        }));
    };

    // ==================== HANDLERS REFERENCIAS ====================

    const handleReferenciaSeleccionada = (referenciaId) => {
        setFormData(prev => {
            const seleccionadas = [...prev.referenciasSeleccionadas];
            const index = seleccionadas.indexOf(referenciaId);
            if (index > -1) {
                seleccionadas.splice(index, 1);
            } else {
                seleccionadas.push(referenciaId);
            }
            return { ...prev, referenciasSeleccionadas: seleccionadas };
        });
    };

    const agregarReferenciaNueva = () => {
        setFormData(prev => ({
            ...prev,
            referenciasNuevas: [
                ...prev.referenciasNuevas,
                {
                    id: Date.now(),
                    first_name: '',
                    last_name: '',
                    parentezco: '',
                    celular: '',
                    dir_residencia: '',
                    ocupacion: ''
                }
            ]
        }));
    };

    const eliminarReferenciaNueva = (id) => {
        setFormData(prev => ({
            ...prev,
            referenciasNuevas: prev.referenciasNuevas.filter(r => r.id !== id)
        }));
    };

    const actualizarReferenciaNueva = (id, campo, valor) => {
        setFormData(prev => ({
            ...prev,
            referenciasNuevas: prev.referenciasNuevas.map(r =>
                r.id === id ? { ...r, [campo]: valor } : r
            )
        }));
    };

    // ==================== HANDLERS DOCUMENTOS ====================

    const handleFileChange = (e, campo) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            documentos: {
                ...prev.documentos,
                [campo]: file
            }
        }));
        if (file) {
            setNombresArchivos(prev => ({
                ...prev,
                [campo]: file.name
            }));
        }
        if (erroresValidacion[campo]) {
            setErroresValidacion(prev => ({ ...prev, [campo]: null }));
        }
    };

    const handleMultipleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            documentos: {
                ...prev.documentos,
                cedulasHabitantes: files
            }
        }));
        if (files.length > 0) {
            const nombres = files.map(f => f.name).join(', ');
            setNombresArchivos(prev => ({
                ...prev,
                cedulasHabitantes: nombres
            }));
        }
    };

    // ==================== VISTA PREVIA Y SUBMIT ====================

    const abrirVistaPrevia = (e) => {
        e.preventDefault();

        // ANTES de mostrar la vista previa, sincronizar datosExistentes con formData.coarrendatario
        if (formData.coarrendatarioSeleccionado) {
            setDatosExistentes(prev => ({
                ...prev,
                coarrendatarios: prev.coarrendatarios.map(c =>
                    c.id === formData.coarrendatarioSeleccionado ?
                        { ...c, ...formData.coarrendatario } : c
                )
            }));
        }

        if (!validarFormulario()) {
            return;
        }

        setMostrarVistaPrevia(true);
        setAceptado(true);
        setErrorSubmit(null);
        setDetallesError(null);
    };

    // FormularioSolicitud.jsx - Modificar la función handleSubmit

    const handleSubmit = async () => {
        
        setErrorSubmit(null);
        setDetallesError(null);

        let idCoarrendatario = null;
        let idsDependientes = [];
        let idsReferencias = [];
        let idDeclaracion = declaracionIngresosId;

        try {
            setLoading(true);

            if (!aceptado) {
                setErrorSubmit('Debes aceptar el tratamiento de datos');
                return;
            }

            const formDataToSend = new FormData();
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token || '';

            // ==================== PASO 0: ACTUALIZAR PERFIL DEL ARRENDATARIO ====================
            // Actualizar empresa y ocupacion en el perfil del arrendatario
            try {
                // Verificar si hubo cambios en empresa u ocupacion
                const arrendatarioActual = perfilArrendatario;
                const empresaCambio = formData.empresa_laboral !== arrendatarioActual?.empresa;
                const ocupacionCambio = formData.cargo !== arrendatarioActual?.ocupacion;
                //console.log('=== DEPURACIÓN ACTUALIZACIÓN PERFIL ===');
                //console.log('formData.empresa_laboral:', formData.empresa_laboral);
                //console.log('arrendatarioActual?.empresa:', arrendatarioActual?.empresa);
                //console.log('empresaCambio:', empresaCambio);
                //console.log('formData.cargo:', formData.cargo);
                //console.log('arrendatarioActual?.ocupacion:', arrendatarioActual?.ocupacion);
                //console.log('ocupacionCambio:', ocupacionCambio);
                //console.log('userData del localStorage:', user);
                //console.log('user.user_id:', user?.user_id);
                //console.log('user.id (perfil):', user?.id);
                if (empresaCambio || ocupacionCambio) {
                    //console.log('✅ Entrando a actualizar perfil...');

                    // USAR user.user_id EN LUGAR DE user.id
                    const userId = user?.user_id;  // <-- CAMBIO IMPORTANTE

                    //console.log('userId a usar (user_id del User):', userId);

                    const updateResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user_profile_update/`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            id: userId,
                            groups: 'arrendatario',
                            empresa: formData.empresa_laboral || '',
                            ocupacion: formData.cargo || '',
                        })
                    });

                    if (!updateResponse.ok) {
                        const errorData = await updateResponse.json();
                        console.warn('Error actualizando perfil:', errorData);
                        // No lanzamos error para no bloquear el envío
                    } else {
                        //console.log('Perfil actualizado correctamente');
                        // Actualizar el perfil en el estado
                        const updatedData = await updateResponse.json();
                        setPerfilArrendatario(prev => ({
                            ...prev,
                            empresa: formData.empresa_laboral || '',
                            ocupacion: formData.cargo || ''
                        }));
                    }
                }
            } catch (error) {
                console.warn('Error al actualizar perfil del arrendatario:', error);
                // Continuamos con el envío
            }

            // ==================== PASO 1: ACTUALIZAR ELEMENTOS EXISTENTES ====================

            if (formData.coarrendatarioSeleccionado) {
                const coarrendatarioEditado = datosExistentes.coarrendatarios.find(
                    c => c.id === formData.coarrendatarioSeleccionado
                );
                if (coarrendatarioEditado) {
                    await actualizarCoarrendatario(coarrendatarioEditado.id, coarrendatarioEditado);
                }
            }

            for (const id of formData.dependientesSeleccionados) {
                const dependienteEditado = datosExistentes.dependientes.find(d => d.id === id);
                if (dependienteEditado) {
                    await actualizarDependiente(id, dependienteEditado);
                }
            }

            for (const id of formData.referenciasSeleccionadas) {
                const referenciaEditada = datosExistentes.referencias.find(r => r.id === id);
                if (referenciaEditada) {
                    await actualizarReferencia(id, referenciaEditada);
                }
            }

            // Actualizar declaración de ingresos (SOLO los campos que pertenecen a declaracion_ingresos)
            if (declaracionIngresosId) {
                const declaracionEditada = datosExistentes.declaracionesIngresos.find(
                    d => d.id === declaracionIngresosId
                );
                if (declaracionEditada) {
                    // IMPORTANTE: Solo actualizar campos de declaracion_ingresos, NO empresa ni ocupacion
                    const declaracionData = {
                        tipoContrato: formData.tipoContrato || '',
                        jefeInmediato: formData.jefeInmediato || '',
                        tiempoLaboral: formData.tiempoLaboral || '',
                        salarioBasicoMensual: formData.salarioBasicoMensual || '',
                        otrosIngresos: formData.otrosIngresos || '',
                        telefonoEmpresa: formData.telefonoEmpresa || '',
                        direccion_laboral: formData.direccion_laboral || '',
                        declaraRenta: formData.declaraRenta || false,
                    };

                    // Actualizar declaración
                    try {
                        const updateDeclResponse = await fetch(
                            `${import.meta.env.VITE_BASE_URL}/api/declaraciones-ingresos/${declaracionIngresosId}/`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(declaracionData)
                            }
                        );

                        if (!updateDeclResponse.ok) {
                            console.warn('Error actualizando declaración de ingresos');
                        }
                    } catch (error) {
                        console.warn('Error al actualizar declaración:', error);
                    }
                }
            }

            // ==================== PASO 2: DATOS BÁSICOS ====================

            formDataToSend.append('casa_id', casaInfo.id);
            formDataToSend.append('arrendatario_id', perfilArrendatario.id);
            formDataToSend.append('duracionContrato', formData.duracionContrato);
            formDataToSend.append('tieneCoarrendatario', 'true');

            // ==================== DECLARACIÓN DE INGRESOS ====================
            // Siempre enviar idDeclaracionIngresos si existe
            if (idDeclaracion) {
                formDataToSend.append('idDeclaracionIngresos', idDeclaracion);
            }

            // Enviar datos de declaración de ingresos (SOLO campos de declaracion_ingresos)
            formDataToSend.append('declaracion_ingresos[tipoContrato]', formData.tipoContrato || '');
            formDataToSend.append('declaracion_ingresos[jefeInmediato]', formData.jefeInmediato || '');
            formDataToSend.append('declaracion_ingresos[tiempoLaboral]', formData.tiempoLaboral || '');
            formDataToSend.append('declaracion_ingresos[salarioBasicoMensual]', formData.salarioBasicoMensual || '');
            formDataToSend.append('declaracion_ingresos[otrosIngresos]', formData.otrosIngresos || '');
            formDataToSend.append('declaracion_ingresos[telefonoEmpresa]', formData.telefonoEmpresa || '');
            formDataToSend.append('declaracion_ingresos[direccion_laboral]', formData.direccion_laboral || '');
            formDataToSend.append('declaracion_ingresos[declaraRenta]', formData.declaraRenta ? 'true' : 'false');

            // NOTA: empresa y ocupacion NO se envían aquí porque son del arrendatario
            // y ya se actualizaron en el PASO 0

            // ==================== COARRENDATARIO ====================
            try {
                if (formData.crearNuevoCoarrendatario && formData.coarrendatario.first_name) {
                    const coarrendatarioPayload = {
                        ...formData.coarrendatario,
                        arrendatario: perfilArrendatario.id,
                        parentezco: formData.coarrendatario.parentezco || 'otro'
                    };

                    const coarrendatarioResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/coarrendatarios/create/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(coarrendatarioPayload)
                    });

                    if (!coarrendatarioResponse.ok) {
                        const errorData = await coarrendatarioResponse.json();
                        throw new Error(`Error al crear coarrendatario: ${JSON.stringify(errorData)}`);
                    }

                    const nuevoCoarrendatario = await coarrendatarioResponse.json();
                    idCoarrendatario = nuevoCoarrendatario.id;
                } else if (formData.coarrendatarioSeleccionado) {
                    idCoarrendatario = formData.coarrendatarioSeleccionado;
                }
            } catch (error) {
                console.error('Error en coarrendatario:', error);
                setErrorSubmit(`Error al crear coarrendatario: ${error.message}`);
                return;
            }
            formDataToSend.append('idCoarrendatario', idCoarrendatario || '');

            // ==================== DEPENDIENTES ====================
            try {
                idsDependientes = [...(formData.dependientesSeleccionados || [])];
                for (const dep of formData.dependientesNuevos) {
                    if (dep.first_name) {
                        const dependientePayload = {
                            first_name: dep.first_name,
                            last_name: dep.last_name,
                            edad: dep.edad,
                            tipo_documento: dep.tipo_documento,
                            doc_identificacion: dep.doc_identificacion,
                            lugarExpCedula: dep.lugarExpCedula,
                            ocupacion: dep.ocupacion,
                            parentezco: dep.parentezco,
                            arrendatario: perfilArrendatario.id
                        };

                        const dependienteResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dependientes/create/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(dependientePayload)
                        });

                        if (!dependienteResponse.ok) {
                            const errorData = await dependienteResponse.json();
                            throw new Error(`Error al crear dependiente: ${JSON.stringify(errorData)}`);
                        }

                        const nuevoDependiente = await dependienteResponse.json();
                        idsDependientes.push(nuevoDependiente.id);
                    }
                }
            } catch (error) {
                console.error('Error en dependientes:', error);
                setErrorSubmit(`Error al crear dependientes: ${error.message}`);
                return;
            }
            formDataToSend.append('idsDependientes', JSON.stringify(idsDependientes));

            // ==================== REFERENCIAS ====================
            try {
                idsReferencias = [...(formData.referenciasSeleccionadas || [])];
                for (const ref of formData.referenciasNuevas) {
                    if (ref.first_name) {
                        const referenciaPayload = {
                            first_name: ref.first_name,
                            last_name: ref.last_name,
                            parentezco: ref.parentezco,
                            celular: ref.celular,
                            dir_residencia: ref.dir_residencia,
                            ocupacion: ref.ocupacion,
                            arrendatario: perfilArrendatario.id
                        };

                        const referenciaResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/referencias/create/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(referenciaPayload)
                        });

                        if (!referenciaResponse.ok) {
                            const errorData = await referenciaResponse.json();
                            throw new Error(`Error al crear referencia: ${JSON.stringify(errorData)}`);
                        }

                        const nuevaReferencia = await referenciaResponse.json();
                        idsReferencias.push(nuevaReferencia.id);
                    }
                }
            } catch (error) {
                console.error('Error en referencias:', error);
                setErrorSubmit(`Error al crear referencias: ${error.message}`);
                return;
            }
            formDataToSend.append('idsReferencias', JSON.stringify(idsReferencias));

            // ==================== DEPENDIENTES NUEVOS COMO JSON ====================
            if (formData.dependientesNuevos && formData.dependientesNuevos.length > 0) {
                const dependientesNuevosJson = JSON.stringify(
                    formData.dependientesNuevos.filter(d => d.first_name)
                );
                formDataToSend.append('dependientes_nuevos', dependientesNuevosJson);
            }

            // ==================== REFERENCIAS NUEVAS COMO JSON ====================
            if (formData.referenciasNuevas && formData.referenciasNuevas.length > 0) {
                const referenciasNuevasJson = JSON.stringify(
                    formData.referenciasNuevas.filter(r => r.first_name)
                );
                formDataToSend.append('referencias_nuevas', referenciasNuevasJson);
            }

            // ==================== DATOS DE LA SOLICITUD ====================
            formDataToSend.append('solicitud[seguroArrendamiento]', formData.seguroArrendamiento);
            formDataToSend.append('solicitud[depositoVoluntario]', formData.depositoVoluntario);
            formDataToSend.append('solicitud[valorDepositoVoluntario]', formData.valorDepositoVoluntario || '');
            formDataToSend.append('solicitud[otraGarantiaAcordada]', formData.otraGarantiaAcordada);
            formDataToSend.append('solicitud[especificacionOtraGarantiaAcordada]', formData.especificacionOtraGarantiaAcordada || '');
            formDataToSend.append('solicitud[mascotas]', formData.mascotas);
            formDataToSend.append('solicitud[numMascotas]', formData.numMascotas || '');
            formDataToSend.append('solicitud[tipoMascotas]', formData.tipoMascotas || '');
            formDataToSend.append('solicitud[aceptaTratamientodeDatos]', aceptado);
            formDataToSend.append('solicitud[nombreArrendadorAnterior]', formData.nombreArrendadorAnterior || '');
            formDataToSend.append('solicitud[telefonoArrendadorAnterior]', formData.telefonoArrendadorAnterior || '');
            formDataToSend.append('solicitud[direccionArrendadorAnterior]', formData.direccionArrendadorAnterior || '');
            formDataToSend.append('solicitud[motivoRetiro]', formData.motivoRetiro || '');

            // ==================== DOCUMENTOS ====================
            if (!formData.documentos.cedulaArrendatario) {
                setErrorSubmit('La cédula del arrendatario es obligatoria');
                return;
            }
            if (!formData.documentos.cedulaCodeudor) {
                setErrorSubmit('La cédula del codeudor es obligatoria');
                return;
            }

            if (formData.documentos.cedulaArrendatario) {
                formDataToSend.append('cedulaArrendatario', formData.documentos.cedulaArrendatario);
            }
            if (formData.documentos.cedulaCodeudor) {
                formDataToSend.append('cedulaCodeudor', formData.documentos.cedulaCodeudor);
            }
            if (formData.documentos.cedulasHabitantes && formData.documentos.cedulasHabitantes.length > 0) {
                formData.documentos.cedulasHabitantes.forEach((file, index) => {
                    formDataToSend.append(`cedulasHabitantes_${index}`, file);
                });
            }
            if (formData.documentos.certificado_laboral_arrendatario) {
                formDataToSend.append('certificado_laboral_arrendatario', formData.documentos.certificado_laboral_arrendatario);
            }
            if (formData.documentos.certificado_laboral_codeudor) {
                formDataToSend.append('certificado_laboral_codeudor', formData.documentos.certificado_laboral_codeudor);
            }
            if (formData.documentos.desprendible_nomina_arrendatario) {
                formDataToSend.append('desprendible_nomina_arrendatario', formData.documentos.desprendible_nomina_arrendatario);
            }
            if (formData.documentos.desprendible_nomina_codeudor) {
                formDataToSend.append('desprendible_nomina_codeudor', formData.documentos.desprendible_nomina_codeudor);
            }
            if (formData.documentos.declaracion_renta_arrendatario) {
                formDataToSend.append('declaracion_renta_arrendatario', formData.documentos.declaracion_renta_arrendatario);
            }
            if (formData.documentos.declaracion_renta_codeudor) {
                formDataToSend.append('declaracion_renta_codeudor', formData.documentos.declaracion_renta_codeudor);
            }
            if (formData.documentos.camara_comercio_arrendatario) {
                formDataToSend.append('camara_comercio_arrendatario', formData.documentos.camara_comercio_arrendatario);
            }
            if (formData.documentos.camara_comercio_codeudor) {
                formDataToSend.append('camara_comercio_codeudor', formData.documentos.camara_comercio_codeudor);
            }

            // ==================== ENVIAR SOLICITUD ====================
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/solicitud-completa/`, {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                let mensajeError = data.error || 'Error al enviar solicitud';
                let detalles = '';

                if (data.details) {
                    detalles = data.details;
                } else if (data.errors) {
                    detalles = JSON.stringify(data.errors, null, 2);
                }

                setErrorSubmit(mensajeError);
                setDetallesError(detalles);
                throw new Error(mensajeError);
            }

            alert('✅ ¡Solicitud enviada exitosamente!');
            setMostrarVistaPrevia(false);
            navigate('/ver-solicitudes');

        } catch (error) {
            console.error('Error al enviar:', error);
            if (!errorSubmit) {
                setErrorSubmit(`Error al enviar la solicitud: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImprimir = () => {
        window.print();
    };

    const renderError = (error, detalles) => {
        if (!error) return null;
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-red-800">❌ {error}</p>
                {detalles && (
                    <details className="mt-2">
                        <summary className="text-sm text-red-600 cursor-pointer">Ver detalles del error</summary>
                        <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-60">
                            {typeof detalles === 'object' ? JSON.stringify(detalles, null, 2) : detalles}
                        </pre>
                    </details>
                )}
                <button
                    onClick={() => setMostrarVistaPrevia(false)}
                    className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                    ← Volver al formulario para corregir
                </button>
            </div>
        );
    };

    if (cargandoDatos) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando formulario...</p>
                </div>
            </div>
        );
    }

    if (mostrarVistaPrevia) {
        return (
            <VistaPrevia
                casaInfo={casaInfo}
                perfilArrendatario={perfilArrendatario}
                formData={formData}
                datosExistentes={datosExistentes}
                aceptado={aceptado}
                loading={loading}
                errorSubmit={errorSubmit}
                detallesError={detallesError}
                onClose={() => {
                    setMostrarVistaPrevia(false);
                    setErrorSubmit(null);
                    setDetallesError(null);
                }}
                onSubmit={handleSubmit}
                onPrint={handleImprimir}
                renderError={renderError}
            />
        );
    }

    const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500";
    const fileInputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100";

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-gray-900">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-purple-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">Solicitud de Arrendamiento</h1>
                        {casaInfo && (
                            <p className="text-purple-100 mt-1">Propiedad: {casaInfo.tipoInmueble} - {casaInfo.direccion}</p>
                        )}
                    </div>

                    {mensajeGuardado && (
                        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">{mensajeGuardado}</p>
                        </div>
                    )}

                    {guardandoElemento && (
                        <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">⏳ Guardando cambios...</p>
                        </div>
                    )}

                    <form onSubmit={abrirVistaPrevia} className="p-6 space-y-8">
                        {errorGeneral && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600">{errorGeneral}</p>
                            </div>
                        )}

                        {Object.keys(erroresValidacion).length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-yellow-800">⚠️ Por favor complete los siguientes campos obligatorios:</p>
                                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                    {Object.entries(erroresValidacion).map(([key, value]) => (
                                        value && <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <InformacionGeneral casaInfo={casaInfo} formData={formData} handleInputChange={handleInputChange} />

                        <DatosArrendatario perfilArrendatario={perfilArrendatario} />

                        <InformacionLaboral
                            formData={formData}
                            handleInputChange={handleInputChange}
                            inputClassName={inputClassName}
                            arrendatarioId={perfilArrendatario?.id}
                            onDeclaracionChange={handleDeclaracionChange}
                            declaracionesExistentes={datosExistentes.declaracionesIngresos}
                            declaracionSeleccionada={declaracionIngresosId}
                            mostrarNuevaDeclaracion={mostrarNuevaDeclaracion}
                            onEditDeclaracion={async (id, data) => {
                                if (id) {
                                    await actualizarDeclaracionIngresos(id, data);
                                }
                            }}
                            perfilArrendatario={perfilArrendatario}  // <-- NUEVO
                            // En FormularioSolicitud.jsx
                            // En FormularioSolicitud.jsx - onUpdatePerfil
                            onUpdatePerfil={async (campo, valor) => {
                                //console.log('📥 onUpdatePerfil - campo:', campo, 'valor:', valor);

                                setPerfilArrendatario(prev => ({
                                    ...prev,
                                    [campo]: valor
                                }));

                                const user = JSON.parse(localStorage.getItem('user'));
                                const token = user?.token || '';
                                const userId = user?.id; // o user?.user_id

                                // Obtener CSRF token
                                let csrfToken = '';
                                try {
                                    const csrfResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/csrf/`, {
                                        credentials: 'include'
                                    });
                                    const csrfData = await csrfResponse.json();
                                    csrfToken = csrfData.csrfToken;
                                } catch (e) {
                                    console.warn('Error obteniendo CSRF:', e);
                                }

                                // Enviar SOLO el campo que cambió, no todos
                                const payload = {
                                    id: userId,
                                    groups: 'arrendatario',
                                    [campo]: valor
                                };

                                //console.log('💾 Enviando payload:', payload);

                                try {
                                    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user_profile_update/`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`,
                                            'X-CSRFToken': csrfToken || '',
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify(payload)
                                    });

                                    if (!response.ok) {
                                        const errorText = await response.text();
                                        console.error('❌ Error response:', response.status, errorText);
                                        throw new Error(`HTTP ${response.status}`);
                                    }

                                    const data = await response.json();
                                    //console.log('✅ Perfil actualizado:', data);

                                } catch (err) {
                                    console.warn('❌ Error actualizando perfil:', err.message);
                                }
                            }}
                        />

                        <CoarrendatarioSection
                            coarrendatarios={datosExistentes.coarrendatarios}
                            seleccionado={formData.coarrendatarioSeleccionado}
                            onSelect={handleCoarrendatarioSeleccionado}
                            onEditCoarrendatario={async (data) => {
                                if (data.id) {
                                    await actualizarCoarrendatario(data.id, data);
                                }
                            }}
                            coarrendatario={formData.coarrendatario}
                            onCoarrendatarioChange={handleCoarrendatarioChange}
                            crearNuevo={formData.crearNuevoCoarrendatario}
                            onToggleNuevo={toggleCrearNuevoCoarrendatario}
                            inputClassName={inputClassName}
                            onGuardarCambiosLocal={guardarCambiosCoarrendatarioLocal}
                        />

                        <GarantiasSection formData={formData} handleInputChange={handleInputChange} />

                        <HabitantesSection
                            dependientes={datosExistentes.dependientes}
                            seleccionados={formData.dependientesSeleccionados}
                            onSelect={handleDependienteSeleccionado}
                            nuevosDependientes={formData.dependientesNuevos}
                            onAgregarNuevo={agregarDependienteNuevo}
                            onEliminarNuevo={eliminarDependienteNuevo}
                            onActualizarNuevo={actualizarDependienteNuevo}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            inputClassName={inputClassName}
                            onEditDependiente={async (id, data) => {
                                if (id) {
                                    await actualizarDependiente(id, data);
                                }
                            }}
                        />

                        <ReferenciasSection
                            referencias={datosExistentes.referencias}
                            seleccionadas={formData.referenciasSeleccionadas}
                            onSelect={handleReferenciaSeleccionada}
                            nuevasReferencias={formData.referenciasNuevas}
                            onAgregarNuevo={agregarReferenciaNueva}
                            onEliminarNuevo={eliminarReferenciaNueva}
                            onActualizarNuevo={actualizarReferenciaNueva}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            inputClassName={inputClassName}
                            onEditReferencia={async (id, data) => {
                                if (id) {
                                    await actualizarReferencia(id, data);
                                }
                            }}
                        />

                        <DocumentosSection
                            formData={formData}
                            handleFileChange={handleFileChange}
                            handleMultipleFilesChange={handleMultipleFilesChange}
                            nombresArchivos={nombresArchivos}
                            fileInputClassName={fileInputClassName}
                            erroresValidacion={erroresValidacion}
                        />

                        <AutorizacionSection formData={formData} handleInputChange={handleInputChange} />

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md">
                                Revisar solicitud
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormularioSolicitud;