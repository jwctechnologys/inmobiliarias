import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../../utils/csrf';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../../../config';

const NuevoContratoVivienda = () => {
  const location = useLocation();
  const solicitudData = location.state?.solicitud || null;
  const [formData, setFormData] = useState({
    userAdministrador: { idCompuesto: null, idReal: null, tipo: 'propietario', data: null },
    userArrendatario: { id: null, data: null },
    coarrendatario: { id: null, data: null },
    dependientes: '',
    tipoContrato: 'vivienda',
    fechainicio: '',
    fechafin: '',
    fechafinOtrosi: '',
    fechaEntregaInmueble: '',
    fechaRestitucionInmueble: '',
    diaHInicioPago: '03',
    diaFinPago: '08',
    contrato_Activo: true,
    inmueble: { id: null, data: null },
    ciudad: 'Villavicencio',
    fecha: '',
    inventario: null,
    canonArrendamiento: '',
    penalidadDiaria: '9000',
    clausulaPenalPorcentaje: 20,
    duracionMeses: 6,
    solicitudId: solicitudData?.solicitudId || null,
  });

  const navigate = useNavigate();
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [dependientes, setDependientes] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [solicitudCompleta, setSolicitudCompleta] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cláusulas según el PDF original
  const [clausulas, setClausulas] = useState([
    { id: 1, texto: '', selected: true, titulo: 'CLAUSULA PRIMERA. Objeto Y sitio' },
    { id: 2, texto: '', selected: true, titulo: 'CLAUSULA SEGUNDA. Destinación' },
    { id: 3, texto: '', selected: true, titulo: 'CLAUSULA TERCERA. Valor, oportunidad y forma' },
    { id: 4, texto: '', selected: true, titulo: 'CLAUSULA CUARTA. Penalidad por Retraso en el Pago del Arriendo' },
    { id: 5, texto: '', selected: true, titulo: 'CLÁUSULA QUINTA. Duración' },
    { id: 6, texto: '', selected: true, titulo: 'CLÁUSULA SEXTA. Prórroga' },
    { id: 7, texto: '', selected: true, titulo: 'CLAUSULA SEPTIMA. Obligaciones de las partes' },
    { id: 8, texto: '', selected: true, titulo: 'CLÁUSULA OCTAVA. Terminación Unilateral Del Contrato' },
    { id: 9, texto: '', selected: true, titulo: 'CLÁUSULA NOVENA. Preaviso' },
    { id: 10, texto: '', selected: true, titulo: 'CLÁUSULA DECIMA. Penal' },
    { id: 11, texto: '', selected: true, titulo: 'CLÁUSULA UNDECIMA. Cesión De Cartera' },
    { id: 12, texto: '', selected: true, titulo: 'CLÁUSULA DUODECIMA. Gastos' },
    { id: 13, texto: '', selected: true, titulo: 'CLÁUSULA DECIMA TERCERA. Servicios Públicos' },
    { id: 14, texto: '', selected: true, titulo: 'CLÁUSULA DECIMA CUARTA. Reparaciones indispensables no locativas' },
    { id: 15, texto: '', selected: true, titulo: 'CLÁUSULA DECIMA QUINTA. Subarriendo y cesión' },
    { id: 16, texto: '', selected: true, titulo: 'CLÁUSULA DECIMA SEXTA. Notificaciones' },
    { id: 17, texto: '', selected: true, titulo: 'CLÁUSULA DECIMA SEPTIMA. Hábeas Data y Autorización de Reporte' },
    { id: 18, texto: '', selected: true, titulo: 'CLÁUSULA DECIMA OCTAVA. Autorización para Registro y Calificación en Plataforma Camila360' },
    { id: 19, texto: '', selected: true, titulo: 'CLÁUSULA DECIMA NOVENA. Cláusulas adicionales' },
  ]);

  // ============================================================
  // CARGA DE DATOS INICIALES
  // ============================================================
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [adminRes, propRes, inmRes] = await Promise.all([
          fetch(`${API_URL}/api/usuarios_por_grupo/administrador/`),
          fetch(`${API_URL}/api/usuarios_por_grupo/propietario/`),
          fetch(`${API_URL}/api/inmuebles/`)
        ]);

        const adminData = await adminRes.json();
        const propData = await propRes.json();
        const inmData = await inmRes.json();
        setInmuebles(inmData);

        // Unificar propietarios y administradores con ID compuesto
        const unificados = [
          ...(propData || []).map(p => ({
            ...p,
            idCompuesto: `propietario_${p.id}`,
            tipoUsuario: 'propietario',
            label: `👑 Propietario: ${p.first_name} ${p.last_name}`,
            genero: p.genero || 'M',
            idReal: p.id
          })),
          ...(adminData || []).map(a => ({
            ...a,
            idCompuesto: `administrador_${a.id}`,
            tipoUsuario: 'administrador',
            label: `🏢 Administrador: ${a.first_name} ${a.last_name}`,
            genero: a.genero || 'F',
            idReal: a.id
          }))
        ];
        setUsuariosDisponibles(unificados);

        if (solicitudData && solicitudData.solicitudId) {
          const solicitudRes = await fetch(`${API_URL}/api/solicitud-publica/${solicitudData.solicitudId}/`);

          if (!solicitudRes.ok) {
            throw new Error(`Error ${solicitudRes.status}: No se pudo obtener la solicitud`);
          }

          const solicitudCompletaData = await solicitudRes.json();
          console.log("Solicitud obtenida:", solicitudCompletaData);
          setSolicitudCompleta(solicitudCompletaData);

          const casaData = solicitudCompletaData.casa;
          const arrendatarioData = solicitudCompletaData.arrendatario;
          const coarrendatarioData = solicitudCompletaData.coarrendatario || null;
          
          // Dependientes
          const dependientesData = solicitudCompletaData.dependientes || null;
          if (dependientesData && !Array.isArray(dependientesData)) {
            setDependientes([dependientesData]);
          } else {
            setDependientes(dependientesData || []);
          }

          const inmuebleData = {
            id: casaData.id,
            direccion: casaData.direccion,
            barrio: casaData.barrio,
            ciudad: casaData.ciudad,
            descripcion: casaData.descripcion,
            tipoInmueble: casaData.tipoInmueble,
            canonmensual: casaData.canonmensual,
            matricula: casaData.matricula,
            matriculaInmobiliaria: casaData.matriculaInmobiliaria || casaData.matricula,
            propietario_id: casaData.propietario_id,
            ser_agua: casaData.ser_agua,
            observacion_ser_agua: casaData.observacion_ser_agua,
            ser_gas_domiciliario: casaData.ser_gas_domiciliario,
            observacion_ser_gas_domiciliario: casaData.observacion_ser_gas_domiciliario,
            ser_bioagricola: casaData.ser_bioagricola,
            observacion_ser_bioagricola: casaData.observacion_ser_bioagricola,
            ser_energia: casaData.ser_energia,
            observacion_ser_energia: casaData.observacion_ser_energia,
          };
          setInmuebleSeleccionado(inmuebleData);

          const arrendatarioObj = {
            id: arrendatarioData.id,
            first_name: arrendatarioData.first_name,
            last_name: arrendatarioData.last_name,
            n_cedula: arrendatarioData.doc_identificacion,
            c_exp: arrendatarioData.c_exp,
            celular: arrendatarioData.celular,
            email: arrendatarioData.email,
            direccion: arrendatarioData.direccion,
            barrio: arrendatarioData.barrio,
            ciudad: arrendatarioData.ciudad,
            genero: arrendatarioData.genero || 'M',
            ocupacion: arrendatarioData.ocupacion,
            empresa: arrendatarioData.empresa,
          };

          let coarrendatarioObj = null;
          if (coarrendatarioData) {
            coarrendatarioObj = {
              id: coarrendatarioData.id,
              first_name: coarrendatarioData.first_name,
              last_name: coarrendatarioData.last_name,
              direccion: coarrendatarioData.direccion,
              barrio: coarrendatarioData.barrio,
              ciudad: coarrendatarioData.ciudad,
              n_cedula: coarrendatarioData.doc_identificacion,
              c_exp: coarrendatarioData.c_exp,
              celular: coarrendatarioData.celular,
              email: coarrendatarioData.email,
              genero: coarrendatarioData.genero || 'M',
              ocupacion: coarrendatarioData.ocupacion,
              empresa: coarrendatarioData.empresa,
            };
          }

          const propietarioData = unificados.find(u => u.idReal === casaData.propietario_id && u.tipoUsuario === 'propietario');

          setFormData(prev => ({
            ...prev,
            inmueble: { id: inmuebleData.id, data: inmuebleData },
            userArrendatario: { id: arrendatarioObj.id, data: arrendatarioObj },
            coarrendatario: { id: coarrendatarioObj?.id || null, data: coarrendatarioObj },
            canonArrendamiento: inmuebleData.canonmensual || '',
            duracionMeses: solicitudCompletaData.duracionContrato || 6,
            userAdministrador: {
              idCompuesto: propietarioData?.idCompuesto,
              idReal: casaData.propietario_id,
              tipo: 'propietario',
              data: propietarioData ? {
                id: propietarioData.idReal,
                first_name: propietarioData.first_name,
                last_name: propietarioData.last_name,
                genero: propietarioData.genero,
                email: propietarioData.email,
                celular: propietarioData.celular,
                celularDos: propietarioData.celularDos,
                tipoUsuario: propietarioData.tipoUsuario,
                doc_identificacion: propietarioData.doc_identificacion,
                tipo_documento: propietarioData.tipo_documento,
                lugarExpCedula: propietarioData.lugarExpCedula,
                direccion: propietarioData.direccion,
                barrio: propietarioData.barrio,
                ciudad: propietarioData.ciudad,
                direccionCorrespondencia: propietarioData.direccionCorrespondencia,
                barrioCorrespondencia: propietarioData.barrioCorrespondencia,
                ciudadCorrespondencia: propietarioData.ciudadCorrespondencia,
                CuentaBancolombia: propietarioData.CuentaBancolombia,
                cuentaNequi: propietarioData.cuentaNequi,
                cuentaDaviplata: propietarioData.cuentaDaviplata,
                activo: propietarioData.activo,
                is_active: propietarioData.is_active,
                empresa: propietarioData.empresa,
                ocupacion: propietarioData.ocupacion,
                estadoCivil: propietarioData.estadoCivil,
                descActividadEconomica: propietarioData.descActividadEconomica,
                CodClasificaIndustrialIU: propietarioData.CodClasificaIndustrialIU
              } : null
            }
          }));
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        alert(`Error al cargar la solicitud: ${error.message}`);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [solicitudData]);

  // ============================================================
  // FUNCIONES UTILIARIAS
  // ============================================================
  const formatearNumeroConPuntos = (numero) => {
    if (!numero) return '';
    return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const generarDescripcionDependientes = (dependientes) => {
    if (!dependientes) return '';

    let dependientesArray = [];
    if (Array.isArray(dependientes)) {
      dependientesArray = dependientes;
    } else if (typeof dependientes === 'object' && dependientes !== null) {
      dependientesArray = [dependientes];
    }

    if (dependientesArray.length === 0) return '';

    const resultado = [];

    for (const dependiente of dependientesArray) {
      let descripcion = "";

      const parentezco = dependiente.parentezco || dependiente.parentesco || '';
      const nombre = `${dependiente.first_name || ''} ${dependiente.last_name || ''}`.trim();
      const edad = dependiente.edad;
      const ocupacion = dependiente.ocupacion || '';
      const empresa = dependiente.empresa || '';
      const tipoDocumento = dependiente.tipo_documento || dependiente.tipoDocumento || 'CC';
      const nCedula = dependiente.n_cedula || dependiente.doc_identificacion || '';
      const lugarExp = dependiente.lugarExpCedula || dependiente.c_exp || 'Villavicencio';

      const numeroIdFormateado = formatearNumeroConPuntos(nCedula);

      if (parentezco) {
        descripcion = `y su ${parentezco} ${nombre}`;
      } else {
        descripcion = `y ${nombre}`;
      }

      if (edad && edad < 18) {
        descripcion += ` de ${edad} años de edad`;
        if (ocupacion) {
          descripcion += `, quien es ${ocupacion}`;
        }
      } else {
        descripcion += ` identificado con ${tipoDocumento} Nro ${numeroIdFormateado} expedida en ${lugarExp}`;
        if (ocupacion && empresa) {
          descripcion += `, y de ocupación ${ocupacion} (${empresa})`;
        } else if (ocupacion) {
          descripcion += `, y de ocupación ${ocupacion}`;
        }
      }

      resultado.push(descripcion);
    }

    return resultado.join(', ');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUserAdminChange = (idCompuesto, tipo) => {
    const usuarioSeleccionado = usuariosDisponibles.find(u => u.idCompuesto === idCompuesto);

    if (usuarioSeleccionado) {
      setFormData((prevData) => ({
        ...prevData,
        userAdministrador: {
          idCompuesto: idCompuesto,
          idReal: usuarioSeleccionado.idReal,
          tipo: tipo,
          data: {
            id: usuarioSeleccionado.idReal,
            first_name: usuarioSeleccionado.first_name,
            last_name: usuarioSeleccionado.last_name,
            genero: usuarioSeleccionado.genero,
            email: usuarioSeleccionado.email,
            celular: usuarioSeleccionado.celular,
            celularDos: usuarioSeleccionado.celularDos,
            tipoUsuario: usuarioSeleccionado.tipoUsuario,
            doc_identificacion: usuarioSeleccionado.doc_identificacion,
            tipo_documento: usuarioSeleccionado.tipo_documento,
            lugarExpCedula: usuarioSeleccionado.lugarExpCedula,
            direccion: usuarioSeleccionado.direccion,
            barrio: usuarioSeleccionado.barrio,
            ciudad: usuarioSeleccionado.ciudad,
            direccionCorrespondencia: usuarioSeleccionado.direccionCorrespondencia,
            barrioCorrespondencia: usuarioSeleccionado.barrioCorrespondencia,
            ciudadCorrespondencia: usuarioSeleccionado.ciudadCorrespondencia,
            CuentaBancolombia: usuarioSeleccionado.CuentaBancolombia,
            cuentaNequi: usuarioSeleccionado.cuentaNequi,
            cuentaDaviplata: usuarioSeleccionado.cuentaDaviplata,
            llave: usuarioSeleccionado.llave,
            activo: usuarioSeleccionado.activo,
            is_active: usuarioSeleccionado.is_active,
            empresa: usuarioSeleccionado.empresa,
            ocupacion: usuarioSeleccionado.ocupacion,
            estadoCivil: usuarioSeleccionado.estadoCivil,
            descActividadEconomica: usuarioSeleccionado.descActividadEconomica,
            CodClasificaIndustrialIU: usuarioSeleccionado.CodClasificaIndustrialIU
          }
        }
      }));

      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
    }
  };

  const handleinmuebleChange = async (id) => {
    const inmueble = inmuebles.find(i => i.id === parseInt(id));
    if (inmueble) {
      setInmuebleSeleccionado({
        ...inmueble,
        matriculaInmobiliaria: inmueble.matriculaInmobiliaria || inmueble.matricula
      });
      const propietarioData = usuariosDisponibles.find(u => u.idReal === inmueble.propietario?.id && u.tipoUsuario === 'propietario');
      setFormData(prev => ({
        ...prev,
        inmueble: { id, data: inmueble },
        canonArrendamiento: inmueble.canonmensual || '',
        userAdministrador: {
          idCompuesto: propietarioData?.idCompuesto,
          idReal: inmueble.propietario?.id,
          tipo: 'propietario',
          data: propietarioData
        }
      }));
      setRefreshKey(prev => prev + 1);
    }
  };

  // ============================================================
  // FUNCIONES DE FORMATEO PARA LAS CLÁUSULAS
  // ============================================================
  const formatearFechaEnPalabras = (fechaString) => {
    if (!fechaString) return '';
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const [year, month, day] = fechaString.split('-');
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${parseInt(year)}`;
  };

  const convertirNumeroAPalabras = (numero) => {
    if (!numero || numero === 0) return 'Cero';

    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    const convertirCentenas = (n) => {
      if (n === 0) return '';
      if (n === 100) return 'cien';
      const centena = Math.floor(n / 100);
      const resto = n % 100;
      if (resto === 0) {
        if (centena === 1) return 'cien';
        return centenas[centena];
      }
      return `${centenas[centena]} ${convertirDecenas(resto)}`.trim();
    };

    const convertirDecenas = (n) => {
      if (n === 0) return '';
      if (n < 10) return unidades[n];
      if (n < 20) return especiales[n - 10];
      const decena = Math.floor(n / 10);
      const unidad = n % 10;
      if (unidad === 0) return decenas[decena];
      if (decena === 2) return `veinti${unidades[unidad]}`;
      return `${decenas[decena]} y ${unidades[unidad]}`;
    };

    const convertirMiles = (n) => {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;
      if (miles === 0) return convertirCentenas(resto);
      if (miles === 1) {
        const restoTexto = convertirCentenas(resto);
        return restoTexto ? `mil ${restoTexto}` : 'mil';
      }
      const milesTexto = convertirCentenas(miles);
      const restoTexto = convertirCentenas(resto);
      return restoTexto ? `${milesTexto} mil ${restoTexto}` : `${milesTexto} mil`;
    };

    const convertirMillones = (n) => {
      const millones = Math.floor(n / 1000000);
      const resto = n % 1000000;

      if (millones === 0) return convertirMiles(resto);
      if (millones === 1) {
        const restoTexto = convertirMiles(resto);
        return restoTexto ? `un millón ${restoTexto}` : 'un millón';
      }

      const millonesTexto = convertirCentenas(millones);
      const restoTexto = convertirMiles(resto);
      return restoTexto ? `${millonesTexto} millones ${restoTexto}` : `${millonesTexto} millones`;
    };

    let resultado;
    if (numero < 1000) {
      resultado = convertirCentenas(numero);
    } else if (numero < 1000000) {
      resultado = convertirMiles(numero);
    } else {
      resultado = convertirMillones(numero);
    }

    resultado = resultado.replace(/\s+/g, ' ').trim();
    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
  };

  const formatoNumero = (numero) => numero?.toLocaleString('es-CO') || '0';

  const generarTextoServicios = (inmueble) => {
    const servicios = [];

    if (inmueble.ser_agua === true || inmueble.ser_agua === 'true') {
      const obs = inmueble.observacion_ser_agua?.trim();
      servicios.push(obs ? `Acueducto y alcantarillado (${obs})` : 'Acueducto y alcantarillado');
    }

    if (inmueble.ser_gas_domiciliario === true || inmueble.ser_gas_domiciliario === 'true') {
      const obs = inmueble.observacion_ser_gas_domiciliario?.trim();
      servicios.push(obs ? `Gas domiciliario (${obs})` : 'Gas domiciliario');
    }

    if (inmueble.ser_bioagricola === true || inmueble.ser_bioagricola === 'true') {
      const obs = inmueble.observacion_ser_bioagricola?.trim();
      servicios.push(obs ? `Aseo (${obs})` : 'Aseo');
    }

    if (inmueble.ser_energia === true || inmueble.ser_energia === 'true') {
      const obs = inmueble.observacion_ser_energia?.trim();
      servicios.push(obs ? `Energía eléctrica (${obs})` : 'Energía eléctrica');
    }

    if (servicios.length === 0) return 'no se especificaron servicios';
    if (servicios.length === 1) return servicios[0];
    if (servicios.length === 2) return `${servicios[0]} y ${servicios[1]}`;

    const ultimo = servicios.pop();
    return `${servicios.join(', ')} y ${ultimo}`;
  };

  const convertirNumeroAPalabrasMeses = (numero) => {
    if (!numero || numero === 0) return 'Cero';
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];
    if (numero <= 12) {
      return unidades[numero].charAt(0).toUpperCase() + unidades[numero].slice(1);
    }
    return numero.toString();
  };

  // ============================================================
  // GENERAR CLÁUSULAS
  // ============================================================
  useEffect(() => {
    if (inmuebleSeleccionado && formData.userArrendatario?.data && formData.canonArrendamiento) {

      const inmueble = inmuebleSeleccionado;
      const usuarioSeleccionado = formData.userAdministrador?.data;
      const arrendatario = formData.userArrendatario.data;
      const coarrendatario = formData.coarrendatario?.data;
      const dependientesList = Array.isArray(dependientes) ? dependientes : (dependientes ? [dependientes] : []);
      const descripcionDependientes = generarDescripcionDependientes(dependientesList);
      const dependienteTerm = descripcionDependientes || '';

      const canonNumero = parseInt(formData.canonArrendamiento);
      const canonPalabras = convertirNumeroAPalabras(canonNumero);
      const canonFormateado = formatoNumero(canonNumero);
      const valorTotalContrato = canonNumero * (formData.duracionMeses || 6);
      const clausulaPenalValor = Math.round(valorTotalContrato * (formData.clausulaPenalPorcentaje / 100));

      const penalizacionPalabras = convertirNumeroAPalabras(formData.penalidadDiaria);

      const fechaInicio = formatearFechaEnPalabras(formData.fechainicio);
      const fechaFin = formatearFechaEnPalabras(formData.fechafin);

      const arrendadorTerm = usuarioSeleccionado?.genero === 'F' ? 'LA ARRENDADORA' : 'EL ARRENDADOR';

      const cuentaBancoNombre = usuarioSeleccionado?.CuentaBancolombia ? 'mediante consignacion a la cuenta de ahorros Nro.' : '';
      const numeroDeCuenta = usuarioSeleccionado?.CuentaBancolombia ? usuarioSeleccionado.CuentaBancolombia : '';
      const cuentaLlaveNombre = usuarioSeleccionado?.llave ? 'o la llave' : '';
      const numeroLlaveNombre = usuarioSeleccionado?.llave ? usuarioSeleccionado.llave : '';
      const desLlaveNombre = usuarioSeleccionado?.llave ? 'la cual es de Titularidad de' : '';
      const mesesEnPalabras = convertirNumeroAPalabrasMeses(formData.duracionMeses || 6);
      const mesesConCero = formData.duracionMeses.toString().padStart(2, '0');

      const arrendadorCel = usuarioSeleccionado?.celular
        ? usuarioSeleccionado?.celularDos
          ? `${usuarioSeleccionado.celular}-${usuarioSeleccionado.celularDos}`
          : usuarioSeleccionado.celular
        : usuarioSeleccionado?.celularDos || '';
      const arrendadorEmailD = usuarioSeleccionado?.email ? `Correo electrónico: ${usuarioSeleccionado.email},` : '';
      const arrendadorDireccion = usuarioSeleccionado?.direccionCorrespondencia || '';
      const arrendadorBarrio = usuarioSeleccionado?.barrioCorrespondencia ? ` del barrio ${usuarioSeleccionado.barrioCorrespondencia}` : '';
      const arrendadorCiudad = usuarioSeleccionado?.ciudadCorrespondencia ? ` de la ciudad de  ${usuarioSeleccionado.ciudadCorrespondencia}` : '';

      const arrendatarioTerm = arrendatario?.genero === 'F' ? 'LA ARRENDATARIA' : 'EL ARRENDATARIO';
      const arrendatarioGenTerm = arrendatario?.genero === 'F' ? 'la señora' : 'el señor';
      const arrendadorNombre = `${usuarioSeleccionado?.first_name || ''} ${usuarioSeleccionado?.last_name || ''}`.toUpperCase();
      const arrendatarioNombre = `${arrendatario?.first_name || ''} ${arrendatario?.last_name || ''}`.toUpperCase();
      const arrendatarioCedula = arrendatario?.n_cedula || '';
      const arrendatarioExp = arrendatario?.c_exp || 'Villavicencio';
      const arrendatarioCel = arrendatario?.celular || '';
      const arrendatarioEmailD = arrendatario?.email ? `Correo electrónico: ${arrendatario.email},` : '';
      const arrendatarioDireccion = arrendatario?.direccion || '';
      const arrendatarioBarrio = arrendatario?.barrio ? ` del barrio ${arrendatario.barrio}` : '';
      const arrendatarioCiudad = arrendatario?.ciudad ? ` de la ciudad de  ${arrendatario.ciudad}` : '';

      const coarrendatarioTerm = coarrendatario?.genero === 'F' ? 'COARRENDATARIA' : 'COARRENDATARIO';
      const coarrendatarioTermD = coarrendatario?.genero === 'F' ? 'LA COARRENDATARIA' : 'EL COARRENDATARIO';
      const coarrendatarioDireccion = coarrendatario?.direccion ? `la direccion ${coarrendatario.direccion}` : '';
      const coarrendatarioBarrio = coarrendatario?.barrio ? ` del barrio ${coarrendatario.barrio}` : '';
      const coarrendatarioCiudad = coarrendatario?.ciudad ? ` de la ciudad de  ${coarrendatario.ciudad}` : '';
      const coarrendatarioGenTerm = coarrendatario?.genero === 'F' ? 'la señora' : 'el señor';
      const coarrendatarioNombre = coarrendatario ? `${coarrendatario.first_name || ''} ${coarrendatario.last_name || ''}`.toUpperCase() : '';
      const coarrendatarioCedula = coarrendatario?.n_cedula || '';
      const coarrendatarioExp = coarrendatario?.c_exp || 'Acacias';
      const coarrendatarioCel = coarrendatario?.celular || '';
      const coarrendatarioEmailD = coarrendatario?.email ? `Correo electrónico: ${coarrendatario.email}` : '';

      const textoServicios = generarTextoServicios(inmueble);

      setClausulas(prev => prev.map(clausula => {
        switch (clausula.id) {
          case 1:
            return { ...clausula, texto: `CLAUSULA PRIMERA. Objeto Y sitio: a) Objeto: ${arrendadorTerm} da en arriendo a ${arrendatarioTerm}, quien recibe a título de arrendamiento, la vivienda ubicada en ${inmueble.direccion}, Barrio ${inmueble.barrio} de la ciudad de ${inmueble.ciudad || 'Villavicencio'}, identificada con el folio de matrícula inmobiliaria No. ${inmueble.matriculaInmobiliaria || inmueble.matricula || ''}. b) Sitio: ${inmueble.descripcion}, servicios de ${textoServicios}, cuyo pago en la vigencia del presente contrato y de sus prorrogas será responsabilidad de ${arrendatarioNombre}, igualmente quedan a su disposición los elementos que figuran en el inventario separado, según evidencia fílmica (tomado al momento de la entrega) y firmado por las partes. PARAGRAFO UNO: ${arrendatarioTerm} declara que ha recibido el inmueble objeto de este contrato en buen estado, conforme a lo descrito en la cláusula anterior, en el mismo se determinan los servicios, cosas y usos conexos y adicionales. ${arrendatarioTerm}, a la terminación del contrato, deberá devolver a ${arrendadorTerm} el inmueble en perfecto estado salvo el deterioro legitimo del inmueble.` };
          case 2:
            return { ...clausula, texto: `CLAUSULA SEGUNDA. Destinación: - ${arrendatarioTerm} se obliga a usar exclusivamente el inmueble para vivienda suya${descripcionDependientes ? ` ${descripcionDependientes}` : ''}. ${arrendatarioTerm} no podrá darle otro uso, ni ceder o transferir el arrendamiento sin la autorización escrita de ${arrendadorTerm}. PARÁGRAFO PRIMERO – Prohibiciones: ${arrendatarioTerm} tiene prohibida la destinación del inmueble a los fines contemplados en el literal b) del parágrafo del Artículo 34 de la Ley 30 de 1986 y en consecuencia ${arrendatarioTerm} se obliga a no usar el inmueble para ocultamiento de personas, depósito de armas o explosivos, y dinero de grupos terroristas. No destinará el inmueble para la elaboración, almacenamiento o venta de sustancias alucinógenas tales como marihuana, hachís, cocaína y similares. ${arrendatarioTerm} se abstendrá de guardar o permitir dentro del inmueble animales no domésticos y/o elementos inflamables, tóxicos, insalubres, explosivos o dañosos para la conservación, higiene, seguridad y estética del inmueble y en general de sus ocupantes permanentes o transitorios ${arrendatarioTerm} tiene prohibido el uso del inmueble con fines de explotación sexual, la pornografía, el turismo sexual y demás formas de abuso sexual con menores y mayores de edad. El incumplimiento de esta cláusula dará derecho a ${arrendadorTerm} para dar por terminado el contrato y exigir la entrega del inmuebleo, en caso de cesión o subarriendo, celebrar un nuevo contrato con los usuarios reales, sin necesidad de requerimientos judiciales o privados, a los cuales renuncia ${arrendatarioTerm}.` };
          case 3:
            return { ...clausula, texto: `CLAUSULA TERCERA. Valor, oportunidad y forma: a) Valor: ${arrendatarioTerm} se obliga a pagar el canon acordado por valor de ${canonPalabras} pesos M/cte. ($${canonFormateado}). b) Oportunidad: dentro de los plazos previstos que son del día ${formData.diaHInicioPago} al ${formData.diaFinPago} de cada mes. c) Forma de pago: ${arrendatarioTerm} se compromete a hacer el pago del canon de arrendamiento ${cuentaBancoNombre} ${numeroDeCuenta} de Bancolombia ${cuentaLlaveNombre} ${numeroLlaveNombre} ${desLlaveNombre} ${usuarioSeleccionado.first_name.toUpperCase()} ${usuarioSeleccionado.last_name.toUpperCase()}. PARAGRAFO: El valor del canon de arrendamiento será reajustado anualmente de acuerdo con lo dispuesto en la Ley 820 de 2003 y demás normas complementarias y reglamentarias que le sean aplicables. El reajuste se realizará al cumplirse cada período anual de vigencia del contrato y será equivalente al 100% del incremento porcentual del Índice de Precios al Consumidor (IPC) del año inmediatamente anterior, conforme lo certifique el DANE. En caso de que las disposiciones legales aplicables establezcan un mecanismo de reajuste diferente o un porcentaje máximo permitido, se aplicará el reajuste conforme a dichos términos.` };
          case 4:
            return { ...clausula, texto: `CLAUSULA CUARTA. Penalidad por Retraso en el Pago del Arriendo: ${arrendatarioTerm} se compromete a realizar el pago del canon de arrendamiento en la fecha establecida del ${formData.diaHInicioPago} al ${formData.diaFinPago} de cada mes. En caso de que ${arrendatarioTerm} no cumpla con dicho pago en la fecha establecida, deberá pagar una penalización fija de ${penalizacionPalabras} pesos M/cte. ($${parseInt(formData.penalidadDiaria) || '9.000'}), por cada día de retraso, hasta la fecha efectiva del pago. Esta penalización es independiente y adicional a cualquier interés de mora que pueda generarse conforme a lo dispuesto por la legislación vigente, y no se considerará un interés financiero, sino una compensación por los inconvenientes generados por el incumplimiento en el pago oportuno. La mora por falta de pago de la renta mensual en la oportunidad y forma acordada facultará a ${arrendadorTerm} para inmediatamente hacer cesar el arriendo y exigir judicial o extrajudicialmente la restitución del bien.` };
          case 5:
            return { ...clausula, texto: `CLÁUSULA QUINTA. Duración: El presente contrato tendrá una duración de ${mesesEnPalabras} (${mesesConCero}) meses, contados a partir del ${fechaInicio || 'fecha de inicio'} hasta el ${fechaFin || 'fecha de terminación'}. Al finalizar este plazo, el contrato se renovará automáticamente, según lo indicado en la siguiente cláusula, a menos que alguna de las partes informe por escrito que no desea renovarlo.` };
          case 6:
            return { ...clausula, texto: `CLÁUSULA SEXTA. Prórroga: Si ninguna de las partes expresa su intención de terminar el contrato, este se prorrogará automáticamente por un nuevo periodo igual al inicialmente pactado, manteniendo las condiciones pactadas. Para evitar la prórroga, cualquiera de las partes deberá avisar por escrito con una anticipación no menor a 45 días, de la fecha de vencimiento del contrato o de cualquiera de sus prórrogas.` };
          case 7:
            return { ...clausula, texto: `CLAUSULA SEPTIMA. Obligaciones de las partes: Son obligaciones de las partes las siguientes: A) De ${arrendadorTerm}: 1. Entregar a ${arrendatarioTerm} en la fecha convenida el inmueble en buen estado de servicio, seguridad y sanidad y poner a su disposición los servicios, cosas o usos conexos y los adicionales aquí convenidos. 2. Mantener en el inmueble los servicios, las cosas y los usos conexos y adicionales en buen estado de servir para el fin convenido en el contrato.3. Las demás obligaciones consagradas para los arrendadores en el capítulo II, Título XXVI, Libro 4 del Código Civil (ley 820 de 2003, art. 8, núm. 5) B) Obligaciones de ${arrendatarioTerm}: Además de las obligaciones previstas en el artículo 2008 del Código Civil y en el Capítulo III de la Ley 820 de 2003, ${arrendatarioTerm} se obliga a: 1. agar oportunamente el canon de arrendamiento en la forma y plazo pactados. 2. Cumplir todas las obligaciones consagradas para el arrendatario en el Capítulo III de la Ley 820 de 2003, así como las demás disposiciones legales concordantes que regulen la materia 3. Cuidar el inmueble y las cosas recibidas en arrendamiento. En caso de daños o deterioros distintos a los derivados del uso normal o de la acción del tiempo y que fueren imputables al mal uso del inmueble o su propia culpa, efectuar oportunamente y por su cuenta las reparaciones. 4. ${arrendatarioTerm}  tendrán a su cargo las reparaciones locativas a que se refiere la ley (C.C. arts. 2028, 2029 y 2030) y no podrá realizar otras sin el consentimiento escrito de ${arrendadorTerm}. 5.  cumplir las normas de convivencia y las demás disposiciones que dicte el Gobierno Nacional dirigidas a la protección de los derechos de todos los vecinos. 6. Las demás obligaciones consagradas para ${arrendatarioTerm} en el capítulo III, Título XXVI, Libro 4 del Código Civil (Ley 820 de 2003, art. 9.` };
          case 8:
            return { ...clausula, texto: `CLÁUSULA OCTAVA. Terminación Unilateral Del Contrato: El presente contrato podrá darse por terminado en forma unilateral por parte de ${arrendadorTerm}, por las causales previstas en el artículo 22 de la Ley 820 de 2003; y por parte de ${arrendatarioTerm}, conforme a lo dispuesto en el artículo 23 de la misma ley. Parágrafo: No obstante, las partes podrán dar por terminado el contrato en cualquier momento de mutuo acuerdo, según lo permitido en el artículo 3° de la Ley 820 de 2003.` };
          case 9:
            return { ...clausula, texto: `CLÁUSULA NOVENA. Preaviso: Durante cualquiera de las prórrogas del contrato, ${arrendadorTerm} podrá darlo por terminado sin necesidad de indemnización, siempre que lo comunique por escrito a ${arrendatarioTerm} con una antelación mínima de tres (3) meses, mediante servicio postal autorizado, conforme al numeral 7 del artículo 22 de la Ley 820 de 2003. Por su parte, ${arrendatarioTerm} podrá terminar el contrato en cualquier momento, dentro del término inicial o sus prórrogas, mediante aviso escrito con no menos de un (1) mes de anticipación y el pago de la indemnización establecida en la cláusula penal. Cumplidas estas condiciones, ${arrendadorTerm} estará obligada a recibir el inmueble. En caso de negativa, ${arrendatarioTerm}  podrán hacer entrega provisional del inmueble con intervención de la autoridad administrativa competente, sin perjuicio de las acciones judiciales correspondientes.` };
          case 10:
            return { ...clausula, texto: `CLÁUSULA DECIMA. Penal: El incumplimiento de las obligaciones contractuales por cualquiera de las partes dará lugar al pago de una sanción equivalente a ${convertirNumeroAPalabras(clausulaPenalValor)} pesos M/CTE ($${clausulaPenalValor.toLocaleString('es-CO')}), correspondiente al ${formData.clausulaPenalPorcentaje}% del valor total del contrato, sin perjuicio del pago de cánones pendientes ni de la reclamación de los perjuicios adicionales que puedan derivarse del incumplimiento.` };
          case 11:
            return { ...clausula, texto: `CLÁUSULA UNDECIMA. Cesión De Cartera: Las partes acuerdan que, en caso de mora o incumplimiento en el pago de los cánones de arrendamiento, servicios públicos, o cualquier otra obligación derivada del presente contrato por parte de ${arrendatarioTerm}, ${arrendadorTerm} queda expresamente facultada para ceder, vender o transferir la cartera a un tercero, incluyendo, pero sin limitarse a una entidad de cobranza o factoraje. Para efectos de la cesión, ${arrendadorTerm} notificará por escrito a ${arrendatarioTerm} sobre la identidad del nuevo acreedor, la forma de pago y cualquier otra información relevante. A partir de la notificación, ${arrendatarioTerm} deberá realizar los pagos exclusivamente al cesionario, sin que sea necesario un nuevo consentimiento de su parte. La cesión de la cartera no modificará las condiciones originales de la obligación, salvo en lo relativo a la entidad receptora de los pagos. ${arrendadorTerm} se compromete a garantizar que los derechos de ${arrendatarioTerm} sean respetados conforme a la normatividad vigente, incluyendo la Ley 820 de 2003 y el Estatuto del Consumidor (Ley 1480 de 2011). ${arrendatarioTerm} acepta que, con la suscripción del presente contrato, otorgan su consentimiento expreso para la cesión de la cartera en los términos aquí previstos, reconociendo que su obligación de pago se mantiene vigente y exigible frente al cesionario. B). Compromiso Notificación Formal. ${arrendadorTerm} notificará la cesión de la cartera a ${arrendatarioTerm} a través de comunicación escrita enviada al correo electrónico registrado en el contrato. C). Protección de Datos: ${arrendatarioTerm} autorizan expresamente A ${arrendadorTerm} para compartir su información personal con la entidad cesionaria, únicamente para efectos de la gestión de cobro y cumplimiento del contrato. La información será tratada conforme a la Ley 1581 de 2012 y su decreto reglamentario. D). Costos Asociados a la Cesión: En caso de cesión de la cartera, ${arrendatarioTerm} acepta que podrá generarse costos adicionales por concepto de gestión de cobro, los cuales serán informados previamente por la entidad cesionaria y deberán ser asumidos por el deudor, siempre que estos costos sean justificados y se encuentren dentro de los límites permitidos por la ley` };
          case 12:
            return { ...clausula, texto: `CLÁUSULA DUODECIMA. - Gastos: Los gastos que cause este instrumento serán a cargo de las dos partes.` };
          case 13:
            return { ...clausula, texto: `CLÁUSULA DECIMA TERCERA. Servicios Públicos: Se tendrá presente las reglas sobre los servicios públicos y otros, artículo 15 de la Ley 820 de 2003, con la finalidad de que el inmueble entregado a título de arrendamiento no quede afecto al pago de los servicios públicos domiciliarios, por incumplimiento en el pago de las facturas. ${arrendadorTerm} no será responsable ni el inmueble afectado, por la no cancelación oportuna de las facturas. Parágrafo 1): Se Prohíbe el uso de las facturas de servicios públicos, con fines comerciales o para solicitar créditos, realizar acuerdos de pago por la NO cancelación de los servicios públicos en las fechas acordadas por las empresas Emsa, Acueducto de Villavicencio, Junta de Acción Comunal Barrio 12 de Octubre, llanogas y Bioagricola. Parágrafo 2): Se prohíbe la manipulación de los contadores y sellos colocados por las empresas de servicios públicos. Parágrafo 3): Cualquier instalación de internet, telefonía, televisión serán directamente responsabilidad de ${arrendatarioTerm}. Parágrafo 4): ${arrendatarioTerm} se compromete hacer entrega mensual de soporte de pago de las facturas por concepto de los servicios públicos en la fecha de pago del canon de arrendamiento, para verificar estar a paz y salvo con las empresas de servicios públicos. ` };
          case 14:
            return { ...clausula, texto: `CLÁUSULA DECIMA CUARTA. Reparaciones indispensables no locativas: En el caso previsto en el artículo 1993 del Código Civil, salvo pacto en contrario entre las partes, ${arrendatarioTerm} podrá descontar el costo de las reparaciones no locativas. Artículo 1994. ${arrendadorTerm} no está obligada a reembolsar el costo de las mejoras útiles.` };
          case 15:
            return { ...clausula, texto: `CLÁUSULA DECIMA QUINTA. Subarriendo y cesión: ${arrendatarioTerm} no tiene la facultad de ceder el arriendo ni de subarrendar, salvo autorización expresa de ${arrendadorTerm}. En caso de contravención, ${arrendadorTerm} podrá dar por terminado el contrato de arrendamiento y exigir la entrega del inmueble o celebrar un nuevo contrato con los usuarios reales, caso en el cual el contrato anterior quedará sin efectos, situaciones éstas que se comunicarán por escrito a ${arrendatarioTerm}. Para garantizar a ${arrendadorTerm} el cumplimiento de las obligaciones derivadas del presente contrato, comparece como ${coarrendatarioTerm} ${coarrendatarioGenTerm} ${coarrendatarioNombre}, mayor de edad, identificado con cédula de ciudadanía No. ${formatoNumero(coarrendatarioCedula)} expedida en ${coarrendatarioExp}, domiciliado en ${coarrendatarioDireccion}${coarrendatarioBarrio}${coarrendatarioCiudad}. ${coarrendatarioTermD} manifiesta que se constituye en deudor solidario de todas y cada una de las obligaciones contraídas por ${arrendatarioTerm} en el presente contrato, en los términos del artículo 1568 y concordantes del Código Civil. En consecuencia, ${coarrendatarioTermD} responderá solidariamente por: a) El pago del canon de arrendamiento. b) Los incrementos legales del canon. c) Los servicios públicos domiciliarios. d) Las cuotas de administración, si fuere el caso. e) La cláusula penal pactada. f) Los daños imputables al arrendatario. g) Las costas y agencias en derecho que se generen en caso de incumplimiento. La obligación aquí asumida es solidaria, expresa e indivisible, y permanecerá vigente hasta la restitución material del inmueble y el pago total de las obligaciones derivadas del presente contrato. ${coarrendatarioTermD} declara haber leído el contrato, conocer íntegramente su contenido y aceptar expresamente la obligación solidaria aquí pactada. En respaldo de la presente garantía, ${coarrendatarioTermD} entrega copia de su cédula de ciudadanía como constancia de su identificación y aceptación de las obligaciones asumidas. En caso de incumplimiento de cualquiera de las obligaciones contractuales por parte de ${arrendatarioTerm}, ${coarrendatarioTermD} responderá con su patrimonio personal, conforme a las disposiciones legales vigentes en la República de Colombia, en especial las contenidas en el Código Civil y la Ley 820 de 2003.` };
          case 16:
            return { ...clausula, texto: `CLÁUSULA DECIMA SEXTA. - Notificaciones: Para todos los efectos legales, judiciales y extrajudiciales relacionados con el presente contrato, las partes acuerdan que las notificaciones se realizarán en las siguientes direcciones físicas, correos electrónicos y números de WhatsApp: ${arrendatarioTerm} ${arrendatarioNombre}, recibirá notificaciones en la direccion ${arrendatarioDireccion}${arrendatarioBarrio}${arrendatarioCiudad}, ${arrendatarioEmailD} WhatsApp ${arrendatarioCel}. ${coarrendatarioTermD} ${coarrendatarioNombre}, recibirá notificaciones en la ${coarrendatarioDireccion}${coarrendatarioBarrio}${coarrendatarioCiudad}. ${coarrendatarioEmailD} WhatsApp: ${coarrendatarioCel}. ${arrendadorTerm} recibirá notificaciones en la dirección ${arrendadorDireccion}${arrendadorBarrio}${arrendadorCiudad}, ${arrendadorEmailD} WhatsApp: ${arrendadorCel}. PARÁGRAFO 1: Las direcciones físicas, correos electrónicos y números de contacto aquí suministrados conservarán plena validez mientras no se informe formalmente su cambio. Cualquier modificación en los datos de contacto deberá ser comunicada a la otra parte por escrito y de manera oportuna. Solo se autorizarán cambios de contacto en eventos plenamente justificados. PARÁGRAFO 2: Las notificaciones a ${arrendadorTerm} deberán ser reportadas en los horarios establecidos para la atención que son de Lunes a Viernes  de 8:00 am a 1:00 pm y de 2:00 pm a 7:30 pm, Los Sábados de 8:00 am a 1:00 pm Importante los domingos y festivos no se atienden notificaciones.` };
          case 17:
            return { ...clausula, texto: `CLÁUSULA DECIMA SEPTIMA. Hábeas Data y Autorización de Reporte: ${arrendatarioTerm} y ${coarrendatarioTermD}., autorizan de manera previa, expresa e informada a ${arrendadorTerm} para recolectar, almacenar, administrar y utilizar los datos personales suministrados en virtud del presente contrato, con la finalidad de: I) dar cumplimiento a las obligaciones derivadas del mismo; II) efectuar las consultas necesarias ante centrales de información de riesgo financiero, comercial y crediticio; III) reportar ante dichas centrales el incumplimiento de las obligaciones contractuales. ${arrendatarioTerm} y ${coarrendatarioTermD}, declaran que conocen y aceptan que, en caso de incumplimiento en el pago de los cánones de arrendamiento, servicios públicos, cuotas de administración, o cualquier otra obligación derivada del contrato, ${arrendadorTerm} podrá reportar tal situación a las centrales de riesgo, de conformidad con lo previsto en la Ley 1266 de 2008 y demás normas concordantes. Asimismo, ${arrendatarioTerm} y ${coarrendatarioTermD}, podrán ejercer en cualquier momento los derechos de conocimiento, actualización, rectificación o supresión de sus datos personales, mediante comunicación escrita dirigida a ${arrendadorTerm}, de acuerdo con lo establecido en la Ley 1581 de 2012 y demás normas vigentes sobre protección de datos personales.` };
          case 18:
            return { ...clausula, texto: `CLÁUSULA DECIMA OCTAVA. Autorización para Registro y Calificación en Plataforma Camila360; ${arrendatarioTerm} y ${coarrendatarioTermD}, autorizan de manera expresa, libre y voluntaria a ${arrendadorTerm} para registrar sus datos personales en la plataforma Camila360, con la finalidad de llevar un historial de cumplimiento de sus obligaciones contractuales y permitir la generación de una calificación según su comportamiento como ARRENDATARIOS. Ambas partes declaran conocer y aceptar que, en caso de incumplimiento de cualquiera de las obligaciones derivadas del presente contrato, dicho incumplimiento podrá ser registrado en la plataforma Camila360 y quedará asociado a su historial como ARRENDATARIOS, información que podrá ser consultada por otros arrendadores o entidades autorizadas que hagan parte de la misma plataforma. ${arrendatarioTerm} y ${coarrendatarioTermD}, manifiestan que conocen sus derechos de acceso, rectificación, actualización y supresión de la información registrada en la plataforma, de conformidad con lo establecido en la Ley 1581 de 2012 y demás normas aplicables sobre protección de datos personales.` };
          case 19:
            return { ...clausula, texto: `CLÁUSULA DECIMA NOVENA. Cláusulas adicionales: Primera: Deben estar presentes las partes el día ${fechaInicio} para recibir el inmueble y el día ${fechaFin} para la restitución del inmueble  o de acuerdo con las prórrogas. Segunda: ${arrendatarioTerm} autoriza a ${arrendadorTerm} a verificar el estado de la vivienda por medio de visita sin que esto constituya violación a la privacidad. Tercera: El inmueble objeto del presente contrato de arrendamiento se encuentra sometido al régimen de propiedad horizontal, razón por la cual ${arrendatarioTerm} se obliga a cumplir en todo momento con el reglamento de propiedad horizontal, manual de convivencia, decisiones de la Asamblea de Copropietarios y disposiciones de la Administración del conjunto o edificio donde se encuentra ubicado el inmueble. El incumplimiento por parte de ${arrendatarioTerm}, sus familiares, visitantes, dependientes, trabajadores o cualquier persona que de él dependa, de las normas anteriormente señaladas, constituirá causal de incumplimiento contractual, facultando a ${arrendadorTerm} para dar por terminado de manera unilateral e inmediata el contrato de arrendamiento, sin que por ello se genere derecho a indemnización o compensación alguna a favor de ${arrendatarioTerm}, y sin perjuicio de las demás acciones legales a que haya lugar. Cuarta: ${arrendadorTerm} no asume responsabilidad alguna por los daños y perjuicios que ${arrendatarioTerm} pueda sufrir por causas atribuibles a terceros, ni por robos, hurtos, ni por siniestro causados por incendio, inundación, terremotos, ni por ningún daño o perjuicio causado por fenómenos naturales y/o ajenos a la actuación de ${arrendadorTerm}. Quinta: Serán de cargo de ${arrendatarioTerm} las medidas, dirección y manejo tomadas para la seguridad del bien, así mismo ${arrendatarioTerm} no asumirán responsabilidades algunas por daños causados al inmueble que se generen por fenómenos naturales o de terrorismo. Sexta: los servicios públicos como acueducto, energía y gas natural, presentan constantemente intermitencia por múltiples causas ajenas y totalmente alejadas a la voluntad y control de ${arrendadorTerm}, por lo que ${arrendatarioTerm} acepta que esto no se podrá entender como obligatoriedad de ${arrendadorTerm}; teniendo en cuenta que los racionamientos son coordinados desde la administración de la entidad encargada y no de ${arrendadorTerm}. Séptima: La vivienda objeto del presente contrato se entrega en buen estado de pintura (color blanco), conservación y limpieza. En consecuencia, ${arrendatarioTerm} se compromete a restituir el inmueble, al término del contrato, en iguales condiciones de pintura, aseo y presentación, debidamente limpio y recién pintado del mismo color, salvo el deterioro natural por el uso normal del bien. En caso de que ${arrendatarioTerm} no cumpla con esta obligación, deberá reembolsar a ${arrendadorTerm} el valor correspondiente a los gastos de restauración, aseo y pintura en que éste deba incurrir para dejar el inmueble en condiciones equivalentes a las recibidas. Dicho reembolso se entenderá de pleno derecho, sin necesidad de requerimiento jurídico o judicial alguno, bastando para ello la comprobación de los gastos efectuados por ${arrendadorTerm}.` };
          default:
            return clausula;
        }
      }));
    }
  }, [inmuebleSeleccionado, formData.userArrendatario, formData.userAdministrador?.data, formData.userAdministrador?.idCompuesto, formData.coarrendatario,
    formData.canonArrendamiento, formData.duracionMeses, formData.fechainicio, formData.fechafin,
    formData.penalidadDiaria, formData.clausulaPenalPorcentaje, formData.diaHInicioPago, formData.diaFinPago,
    usuariosDisponibles, refreshKey]);

  // ============================================================
  // HANDLERS PARA CLÁUSULAS
  // ============================================================
  const handleCheckboxChange = (id) => {
    setClausulas(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const addClausula = () => {
    setClausulas(prev => [...prev, {
      id: prev.length + 1,
      texto: `CLÁUSULA ADICIONAL: [Texto de la cláusula aquí]`,
      selected: true,
      titulo: `CLÁUSULA ADICIONAL`
    }]);
  };

  const removeClausula = (id) => {
    setClausulas(prev => prev.filter(c => c.id !== id));
  };

  const handleClausulaChange = (id, texto) => {
    setClausulas(prev => prev.map(c => c.id === id ? { ...c, texto } : c));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData(prev => ({ ...prev, inventario: file }));
    } else {
      alert("Por favor, selecciona un archivo PDF.");
    }
  };

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  // ============================================================
  // FUNCIÓN PARA PREPARAR DATOS DEL CONTRATO (COPIA INMUTABLE)
  // ============================================================
  const prepararDatosContrato = () => {
    const inmueble = inmuebleSeleccionado;
    const arrendador = formData.userAdministrador?.data;
    const arrendatario = formData.userArrendatario?.data;
    const coarrendatario = formData.coarrendatario?.data;
    const selectedClausulas = clausulas.filter(c => c.selected);

    // Formatear dependientes para JSON
    let dependientesArray = [];
    if (dependientes) {
      if (Array.isArray(dependientes)) {
        dependientesArray = dependientes;
      } else if (typeof dependientes === 'object') {
        dependientesArray = [dependientes];
      }
    }

    // Preparar datos de dependientes para JSON (solo los campos necesarios)
    const dependientesCopia = dependientesArray.map(d => ({
      first_name: d.first_name || '',
      last_name: d.last_name || '',
      edad: d.edad || '',
      tipo_documento: d.tipo_documento || 'CC',
      doc_identificacion: d.doc_identificacion || d.n_cedula || '',
      lugarExpCedula: d.lugarExpCedula || d.c_exp || 'Villavicencio',
      ocupacion: d.ocupacion || '',
      parentezco: d.parentezco || '',
    }));

    // Preparar cláusulas para JSON
    const clausulasCopia = selectedClausulas.map(c => ({
      titulo: c.titulo || '',
      texto: c.texto || '',
    }));

    return {
      // =============================================
      // DATOS DEL ARRENDADOR (COPIA INMUTABLE)
      // =============================================
      arrendador_nombre_completo: `${arrendador?.first_name || ''} ${arrendador?.last_name || ''}`.trim(),
      arrendador_tipo_documento: arrendador?.tipo_documento || 'CC',
      arrendador_doc_identificacion: arrendador?.doc_identificacion || '',
      arrendador_lugar_exp_cedula: arrendador?.lugarExpCedula || 'Villavicencio',
      arrendador_celular: arrendador?.celular || '',
      arrendador_celular_dos: arrendador?.celularDos || '',
      arrendador_email: arrendador?.email || '',
      arrendador_direccion: arrendador?.direccion || '',
      arrendador_barrio: arrendador?.barrio || '',
      arrendador_ciudad: arrendador?.ciudad || 'Villavicencio',
      arrendador_direccion_correspondencia: arrendador?.direccionCorrespondencia || '',
      arrendador_barrio_correspondencia: arrendador?.barrioCorrespondencia || '',
      arrendador_ciudad_correspondencia: arrendador?.ciudadCorrespondencia || 'Villavicencio',
      arrendador_genero: arrendador?.genero || 'M',
      arrendador_cuenta_bancolombia: arrendador?.CuentaBancolombia || '',
      arrendador_cuenta_nequi: arrendador?.cuentaNequi || '',
      arrendador_cuenta_daviplata: arrendador?.cuentaDaviplata || '',
      arrendador_llave: arrendador?.llave || '',
      arrendador_empresa: arrendador?.empresa || '',
      arrendador_ocupacion: arrendador?.ocupacion || '',
      arrendador_estado_civil: arrendador?.estadoCivil || '',
      arrendador_tipo_usuario: formData.userAdministrador?.tipo || 'propietario',

      // =============================================
      // DATOS DEL ARRENDATARIO (COPIA INMUTABLE)
      // =============================================
      arrendatario_nombre_completo: `${arrendatario?.first_name || ''} ${arrendatario?.last_name || ''}`.trim(),
      arrendatario_tipo_documento: arrendatario?.tipo_documento || 'CC',
      arrendatario_doc_identificacion: arrendatario?.n_cedula || '',
      arrendatario_lugar_exp_cedula: arrendatario?.c_exp || 'Villavicencio',
      arrendatario_celular: arrendatario?.celular || '',
      arrendatario_email: arrendatario?.email || '',
      arrendatario_direccion: arrendatario?.direccion || '',
      arrendatario_barrio: arrendatario?.barrio || '',
      arrendatario_ciudad: arrendatario?.ciudad || 'Villavicencio',
      arrendatario_genero: arrendatario?.genero || 'M',
      arrendatario_ocupacion: arrendatario?.ocupacion || '',
      arrendatario_empresa: arrendatario?.empresa || '',

      // =============================================
      // DATOS DEL COARRENDATARIO (COPIA INMUTABLE)
      // =============================================
      coarrendatario_nombre_completo: coarrendatario ? `${coarrendatario.first_name || ''} ${coarrendatario.last_name || ''}`.trim() : '',
      coarrendatario_tipo_documento: coarrendatario?.tipo_documento || 'CC',
      coarrendatario_doc_identificacion: coarrendatario?.n_cedula || '',
      coarrendatario_lugar_exp_cedula: coarrendatario?.c_exp || 'Villavicencio',
      coarrendatario_celular: coarrendatario?.celular || '',
      coarrendatario_email: coarrendatario?.email || '',
      coarrendatario_direccion: coarrendatario?.direccion || '',
      coarrendatario_barrio: coarrendatario?.barrio || '',
      coarrendatario_ciudad: coarrendatario?.ciudad || 'Villavicencio',
      coarrendatario_genero: coarrendatario?.genero || 'M',
      coarrendatario_ocupacion: coarrendatario?.ocupacion || '',
      coarrendatario_empresa: coarrendatario?.empresa || '',
      tiene_coarrendatario: !!coarrendatario,

      // =============================================
      // DATOS DEL INMUEBLE (COPIA INMUTABLE)
      // =============================================
      inmueble_direccion: inmueble?.direccion || '',
      inmueble_barrio: inmueble?.barrio || '',
      inmueble_ciudad: inmueble?.ciudad || 'Villavicencio',
      inmueble_descripcion: inmueble?.descripcion || '',
      inmueble_tipo: inmueble?.tipoInmueble || '',
      inmueble_matricula: inmueble?.matriculaInmobiliaria || inmueble?.matricula || '',
      inmueble_canon_mensual: parseFloat(inmueble?.canonmensual) || 0,

      // Servicios del inmueble
      inmueble_ser_agua: inmueble?.ser_agua === true || inmueble?.ser_agua === 'true',
      inmueble_observacion_agua: inmueble?.observacion_ser_agua || '',
      inmueble_ser_gas: inmueble?.ser_gas_domiciliario === true || inmueble?.ser_gas_domiciliario === 'true',
      inmueble_observacion_gas: inmueble?.observacion_ser_gas_domiciliario || '',
      inmueble_ser_aseo: inmueble?.ser_bioagricola === true || inmueble?.ser_bioagricola === 'true',
      inmueble_observacion_aseo: inmueble?.observacion_ser_bioagricola || '',
      inmueble_ser_energia: inmueble?.ser_energia === true || inmueble?.ser_energia === 'true',
      inmueble_observacion_energia: inmueble?.observacion_ser_energia || '',

      // =============================================
      // DEPENDIENTES (COPIA EN JSON)
      // =============================================
      dependientes_copia: dependientesCopia,

      // =============================================
      // CLAUSULAS (COPIA EN JSON)
      // =============================================
      clausulas_copia: clausulasCopia,

      // =============================================
      // CONDICIONES DEL CONTRATO
      // =============================================
      fechainicio: formData.fechainicio,
      fechafin: formData.fechafin,
      diaHInicioPago: parseInt(formData.diaHInicioPago) || 3,
      diaFinPago: parseInt(formData.diaFinPago) || 8,
      contrato_Activo: formData.contrato_Activo,
      ciudad: formData.ciudad || 'Villavicencio',
      tipoContrato: formData.tipoContrato || 'vivienda',
      fechaEntregaInmueble: formData.fechaEntregaInmueble || formData.fechainicio,
      fechaRestitucionInmueble: formData.fechaRestitucionInmueble || formData.fechafin,
      fecha: formData.fecha || formData.fechainicio,
      canonArrendamiento: parseFloat(formData.canonArrendamiento) || 0,
      penalidadDiaria: parseFloat(formData.penalidadDiaria) || 9000,
      clausulaPenalPorcentaje: parseInt(formData.clausulaPenalPorcentaje) || 20,
      duracionMeses: parseInt(formData.duracionMeses) || 6,

      // =============================================
      // REFERENCIAS ORIGINALES (AUDITORÍA)
      // =============================================
      arrendador_id_original: arrendador?.id || null,
      arrendatario_id_original: arrendatario?.id || null,
      coarrendatario_id_original: coarrendatario?.id || null,
      inmueble_id_original: inmueble?.id || null,
      solicitud_id: formData.solicitudId || null,

      // =============================================
      // FECHA DE FIN DE OTROSÍ (OPCIONAL)
      // =============================================
      fechafinOtrosi: formData.fechafinOtrosi || null,
    };
  };

  // ============================================================
  // HANDLE SUBMIT (GUARDAR CONTRATO)
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    const requiredFields = {
      arrendador: formData.userAdministrador?.data,
      arrendatario: formData.userArrendatario?.data,
      fechainicio: formData.fechainicio,
      fechafin: formData.fechafin,
      inmueble: inmuebleSeleccionado,
      canonArrendamiento: formData.canonArrendamiento,
    };

    const emptyFields = Object.entries(requiredFields).filter(([_, value]) => !value);
    if (emptyFields.length > 0) {
      alert(`Por favor, complete los campos requeridos: ${emptyFields.map(([key]) => key).join(', ')}`);
      return;
    }

    // Preparar datos con copias inmutables
    const dataToSubmit = prepararDatosContrato();

    console.log('📝 Datos a enviar (con copias inmutables):', dataToSubmit);

    try {
      const response = await fetch(`${API_URL}/api/Contrato_Local_viviendaViewSet/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'X-CSRFToken': csrfToken 
        },
        body: JSON.stringify(dataToSubmit),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (response.ok) {
        // Subir inventario si existe
        if (formData.inventario) {
          await uploadPDF(data.id);
        }
        
        // Navegar a la vista de impresión del contrato
        navigate(`/imprime-contrato/${data.id}`);
      } else {
        console.error('❌ Error del servidor:', data);
        alert(`Error: ${data.error || data.detail || 'No se pudo guardar el contrato'}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al guardar el contrato. Verifica la consola para más detalles.');
    }
  };

  // ============================================================
  // SUBIR PDF DE INVENTARIO
  // ============================================================
  const uploadPDF = async (contratoId) => {
    const formDataToSend = new FormData();
    formDataToSend.append('inventario', formData.inventario);
    formDataToSend.append('contratoId', contratoId);

    try {
      const response = await fetch(`${API_URL}/api/upload-pdf/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: formDataToSend,
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Error al subir el PDF');
      }
    } catch (error) {
      console.error("Error al subir el PDF:", error);
    }
  };

  // ============================================================
  // ESTILOS
  // ============================================================
  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const selectClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border";
  const sectionClass = "bg-white rounded-lg shadow-md p-6 mb-6";
  const titleClass = "text-xl font-semibold text-gray-800 mb-4 pb-2 border-b";

  // ============================================================
  // RENDER
  // ============================================================
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del contrato...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Contrato de Arrendamiento - Vivienda Urbana</h1>
          <Link to="/Crear/Contratos" className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
            ← Volver a Contratos
          </Link>
        </div>

        {solicitudData && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-700">
                <strong>📋 Creando contrato desde solicitud:</strong> ID: {solicitudData.solicitudId}
              </p>
              <Link 
                to={`/solicitud/${solicitudData.solicitudId}`} 
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                🔍 Revisar Solicitud Completa
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ============================================================
              SECCIÓN 1: INFORMACIÓN DEL CONTRATO
              ============================================================ */}
          <div className={sectionClass}>
            <h2 className={titleClass}>📋 Información del Contrato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Arrendador / Propietario:</label>
                <select
                  className={selectClass}
                  onChange={(e) => {
                    const selectedIdCompuesto = e.target.value;
                    if (!selectedIdCompuesto) return;

                    const selected = usuariosDisponibles.find(u => u.idCompuesto === selectedIdCompuesto);
                    if (selected) {
                      handleUserAdminChange(selected.idCompuesto, selected.tipoUsuario);
                    }
                  }}
                  value={formData.userAdministrador?.idCompuesto || ''}
                >
                  <option value="">Selecciona el arrendador</option>
                  {usuariosDisponibles.map((user) => (
                    <option key={user.idCompuesto} value={user.idCompuesto}>
                      {user.tipoUsuario === 'propietario' ? '👑 Propietario' : '🏢 Administrador'}: {user.first_name} {user.last_name}
                      ({user.genero === 'F' ? 'Femenino' : 'Masculino'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Puedes elegir entre propietarios y administradores</p>
              </div>

              {formData.userAdministrador?.data && (
                <div className="col-span-full mt-2 text-sm bg-blue-50 p-2 rounded-lg">
                  <span className="font-medium">✓ Arrendador seleccionado:</span> {formData.userAdministrador.data.first_name} {formData.userAdministrador.data.last_name}
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {formData.userAdministrador.data.genero === 'F' ? '👩 Femenino → LA ARRENDADORA' : '👨 Masculino → EL ARRENDADOR'}
                  </span>
                </div>
              )}

              {formData.userArrendatario?.data && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 col-span-full">
                  <h3 className="font-semibold text-green-800 mb-2">👤 Arrendatario</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="font-medium">Nombre:</span> {formData.userArrendatario.data.first_name} {formData.userArrendatario.data.last_name}</div>
                    <div><span className="font-medium">Cédula:</span> {formatoNumero(formData.userArrendatario.data.n_cedula)}</div>
                    <div><span className="font-medium">Celular:</span> {formData.userArrendatario.data.celular}</div>
                    <div><span className="font-medium">Email:</span> {formData.userArrendatario.data.email}</div>
                    <div><span className="font-medium">Género:</span> {formData.userArrendatario.data.genero === 'F' ? 'Femenino' : 'Masculino'}</div>
                  </div>
                </div>
              )}

              {formData.coarrendatario?.data && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 col-span-full">
                  <h3 className="font-semibold text-yellow-800 mb-2">👥 Coarrendatario (Codeudor Solidario)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="font-medium">Nombre:</span> {formData.coarrendatario.data.first_name} {formData.coarrendatario.data.last_name}</div>
                    <div><span className="font-medium">Cédula:</span> {formatoNumero(formData.coarrendatario.data.n_cedula)}</div>
                    <div><span className="font-medium">Celular:</span> {formData.coarrendatario.data.celular}</div>
                    <div><span className="font-medium">Email:</span> {formData.coarrendatario.data.email}</div>
                    <div><span className="font-medium">Ocupación:</span> {formData.coarrendatario.data.ocupacion}</div>
                    <div><span className="font-medium">Género:</span> {formData.coarrendatario.data.genero === 'F' ? 'Femenino' : 'Masculino'}</div>
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>Inmueble:</label>
                <select className={selectClass} onChange={(e) => handleinmuebleChange(e.target.value)} value={formData.inmueble?.id || ''}>
                  <option value="">Selecciona un inmueble</option>
                  {inmuebles.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.direccion} - {inv.barrio} ({inv.tipoInmueble})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Matrícula Inmobiliaria:</label>
                <input type="text" className={inputClass} value={inmuebleSeleccionado?.matriculaInmobiliaria || inmuebleSeleccionado?.matricula || ''} disabled readOnly />
              </div>
              <div>
                <label className={labelClass}>Fecha de Inicio:</label>
                <input type="date" name="fechainicio" className={inputClass} onChange={handleInputChange} />
              </div>
              <div>
                <label className={labelClass}>Fecha de Fin:</label>
                <input type="date" name="fechafin" className={inputClass} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* ============================================================
              SECCIÓN 2: CONDICIONES ECONÓMICAS
              ============================================================ */}
          <div className={sectionClass}>
            <h2 className={titleClass}>💰 Condiciones Económicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Canon de Arrendamiento ($):</label>
                <input type="number" name="canonArrendamiento" className={inputClass} value={formData.canonArrendamiento} onChange={handleInputChange} placeholder="Ej: 950000" />
              </div>
              <div>
                <label className={labelClass}>Penalidad por día de retraso ($):</label>
                <input type="number" name="penalidadDiaria" className={inputClass} value={formData.penalidadDiaria} onChange={handleInputChange} placeholder="Ej: 9000" />
              </div>
              <div>
                <label className={labelClass}>Días de pago (inicio):</label>
                <input type="number" name="diaHInicioPago" className={inputClass} value={formData.diaHInicioPago} onChange={handleInputChange} placeholder="03" />
              </div>
              <div>
                <label className={labelClass}>Días de pago (fin):</label>
                <input type="number" name="diaFinPago" className={inputClass} value={formData.diaFinPago} onChange={handleInputChange} placeholder="08" />
              </div>
              <div>
                <label className={labelClass}>Duración (meses):</label>
                <input type="number" name="duracionMeses" className={inputClass} value={formData.duracionMeses} onChange={handleInputChange} placeholder="6" />
              </div>
              <div>
                <label className={labelClass}>% Cláusula Penal:</label>
                <input type="number" name="clausulaPenalPorcentaje" className={inputClass} value={formData.clausulaPenalPorcentaje} onChange={handleInputChange} placeholder="20" step="1" />
              </div>
            </div>
          </div>

          {/* ============================================================
              SECCIÓN 3: FECHAS ESPECÍFICAS
              ============================================================ */}
          <div className={sectionClass}>
            <h2 className={titleClass}>📅 Fechas Específicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Fecha de firma del contrato:</label>
                <input type="date" name="fecha" className={inputClass} onChange={handleInputChange} />
              </div>
              <div>
                <label className={labelClass}>Fecha de entrega del inmueble:</label>
                <input type="date" name="fechaEntregaInmueble" className={inputClass} onChange={handleInputChange} />
              </div>
              <div>
                <label className={labelClass}>Fecha de restitución del inmueble:</label>
                <input type="date" name="fechaRestitucionInmueble" className={inputClass} onChange={handleInputChange} />
              </div>
              <div>
                <label className={labelClass}>Ciudad de firma:</label>
                <input type="text" name="ciudad" className={inputClass} value={formData.ciudad} onChange={handleInputChange} placeholder="Villavicencio" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="contrato_Activo" checked={formData.contrato_Activo} onChange={handleInputChange} className="h-4 w-4 text-blue-600 rounded" />
                <label className="ml-2 block text-sm text-gray-700">Contrato activo</label>
              </div>
            </div>
          </div>

          {/* ============================================================
              SECCIÓN 4: DOCUMENTOS ADJUNTOS
              ============================================================ */}
          <div className={sectionClass}>
            <h2 className={titleClass}>📎 Documentos Adjuntos</h2>
            <div>
              <label className={labelClass}>Subir inventario (PDF):</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>

          {/* ============================================================
              SECCIÓN 5: CLÁUSULAS DEL CONTRATO
              ============================================================ */}
          <div className={sectionClass}>
            <h2 className={titleClass}>📜 Cláusulas del Contrato</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {clausulas.map((clausula) => (
                <div key={clausula.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={clausula.selected} onChange={() => handleCheckboxChange(clausula.id)} className="mt-2 h-4 w-4 text-blue-600 rounded" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-700 text-sm mb-1">{clausula.titulo}</div>
                      <textarea
                        value={clausula.texto}
                        onChange={(e) => handleClausulaChange(clausula.id, e.target.value)}
                        rows={8}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border font-mono text-sm"
                      />
                    </div>
                    <button type="button" onClick={() => removeClausula(clausula.id)} className="text-red-600 hover:text-red-800 text-sm px-2 py-1">✕</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addClausula} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2">
                <span>+</span> Agregar Cláusula Adicional
              </button>
            </div>
          </div>

          {/* ============================================================
              BOTÓN DE GUARDAR
              ============================================================ */}
          <div className="sticky bottom-4 bg-white rounded-lg shadow-lg p-4 border-t-4 border-blue-500">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-lg shadow-md">
              💾 Guardar Contrato de Arrendamiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoContratoVivienda;