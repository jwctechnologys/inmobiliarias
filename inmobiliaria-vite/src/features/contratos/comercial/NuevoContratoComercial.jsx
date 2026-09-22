import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../../utils/csrf';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../../../config';

const NuevoContratoComercial = () => {
  const location = useLocation();
  const solicitudData = location.state?.solicitud || null;
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [formData, setFormData] = useState({
    userAdministrador: { idCompuesto: null, idReal: null, tipo: 'propietario', data: null },
    userArrendatario: { id: null, data: null },
    coarrendatario: { id: null, data: null },
    dependientes: '',
    tipoContrato: 'local comercial',
    fechainicio: '',
    fechafin: '',
    fechafinOtrosi: '',
    fechaEntregaInmueble: '',
    fechaRestitucionInmueble: '',
    diaHInicioPago: '09',
    diaFinPago: '14',
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

  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [arrendatarios, setArrendatarios] = useState([]);
  const [coarrendatarios, setCoarrendatarios] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [solicitudCompleta, setSolicitudCompleta] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ============================================================
  // CLÁUSULAS (específicas de Comercial)
  // ============================================================
  const [clausulas, setClausulas] = useState([
    { id: 1, texto: '', selected: true, titulo: 'Clausula primera – Objeto del contrato' },
    { id: 2, texto: '', selected: true, titulo: 'Clausula segunda – Destino del inmueble' },
    { id: 3, texto: '', selected: true, titulo: 'Clausula tercera – Termino del contrato' },
    { id: 4, texto: '', selected: true, titulo: 'Clausula cuarta – Remuneración mensual o canon de arrendamiento' },
    { id: 5, texto: '', selected: true, titulo: 'Clausula quinta – Prorroga del contrato y aumento del canon' },
    { id: 6, texto: '', selected: true, titulo: 'Clausula sexta – Clausula penal' },
    { id: 7, texto: '', selected: true, titulo: 'Clausula séptima – Inspección' },
    { id: 8, texto: '', selected: true, titulo: 'Clausula octava – Recibo y entrega' },
    { id: 9, texto: '', selected: true, titulo: 'Clausula novena – Reparaciones y mejoras' },
    { id: 10, texto: '', selected: true, titulo: 'Clausula decima – Servicios públicos' },
    { id: 11, texto: '', selected: true, titulo: 'Clausula decima primera – Subarriendo y cesión' },
    { id: 12, texto: '', selected: true, titulo: 'Clausula décima segunda – prohibiciones' },
    { id: 13, texto: '', selected: true, titulo: 'Clausula décima tercera – Otras causales de terminación del contrato' },
    { id: 14, texto: '', selected: true, titulo: 'Clausula décima cuarta – Exención de responsabilidad' },
    { id: 15, texto: '', selected: true, titulo: 'Clausula décima quinta – Autorizaciones' },
    { id: 16, texto: '', selected: true, titulo: 'Clausula décima sexta – Mérito ejecutivo' },
    { id: 17, texto: '', selected: true, titulo: 'Clausula décima séptima – Gestión de cobro' },
    { id: 18, texto: '', selected: true, titulo: 'Clausula décima octava – Gastos' },
    { id: 19, texto: '', selected: true, titulo: 'Clausula décima novena – Suspensión de servicios' },
    { id: 20, texto: '', selected: true, titulo: 'Clausula vigésima – Actividad comercial' },
    { id: 21, texto: '', selected: true, titulo: 'Clausula vigésima Primera – Coarrendatario' },
    { id: 22, texto: '', selected: true, titulo: 'Clausula vigésima Segunda – Notificaciones' },
    { id: 23, texto: '', selected: true, titulo: 'Clausula vigésima tercera – Exclusión de responsabilidad por daños a terceros' },
    { id: 24, texto: '', selected: true, titulo: 'Clausula vigésima Cuarta – Acuerdo de firma electrónica' },
  ]);

  // ============================================================
  // FUNCIONES UTILIARIAS
  // ============================================================
  
  // Función CORREGIDA para formatear números con puntos
  const formatoNumero = (numero) => {
    if (!numero) return '0';
    const numStr = String(numero).replace(/[^0-9]/g, '');
    if (!numStr) return '0';
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatearNumeroConPuntos = (numero) => {
    return formatoNumero(numero);
  };

  const formatearFechaEnPalabras = (fechaString) => {
    if (!fechaString) return '';
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const [year, month, day] = fechaString.split('-');
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${parseInt(year)}`;
  };

  const calcularDuracionEnMeses = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
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

  const generarTextoServicios = (inmueble) => {
    if (!inmueble) return 'no se especificaron servicios';
    const servicios = [];
    if (inmueble?.ser_agua === true || inmueble?.ser_agua === 'true') {
      servicios.push('Acueducto y alcantarillado');
    }
    if (inmueble?.ser_gas_domiciliario === true || inmueble?.ser_gas_domiciliario === 'true') {
      servicios.push('Gas domiciliario');
    }
    if (inmueble?.ser_bioagricola === true || inmueble?.ser_bioagricola === 'true') {
      servicios.push('Aseo');
    }
    if (inmueble?.ser_energia === true || inmueble?.ser_energia === 'true') {
      servicios.push('Energía eléctrica');
    }
    if (servicios.length === 0) return 'no se especificaron servicios';
    if (servicios.length === 1) return servicios[0];
    if (servicios.length === 2) return `${servicios[0]} y ${servicios[1]}`;
    const ultimo = servicios.pop();
    return `${servicios.join(', ')} y ${ultimo}`;
  };

  // ============================================================
  // FUNCIÓN PARA PREPARAR DATOS DEL CONTRATO (COPIA INMUTABLE)
  // ============================================================
  const prepararDatosContrato = () => {
    const inmueble = inmuebleSeleccionado;
    const arrendador = formData.userAdministrador?.data;
    const arrendatario = formData.userArrendatario?.data;
    const coarrendatario = formData.coarrendatario?.data;
    const selectedClausulas = clausulas.filter(c => c.selected);

    return {
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

      inmueble_direccion: inmueble?.direccion || '',
      inmueble_barrio: inmueble?.barrio || '',
      inmueble_ciudad: inmueble?.ciudad || 'Villavicencio',
      inmueble_descripcion: inmueble?.descripcion || '',
      inmueble_tipo: inmueble?.tipoInmueble || 'Local Comercial',
      inmueble_matricula: inmueble?.matriculaInmobiliaria || inmueble?.matricula || '',
      inmueble_canon_mensual: parseFloat(inmueble?.canonmensual) || 0,

      inmueble_ser_agua: inmueble?.ser_agua === true || inmueble?.ser_agua === 'true',
      inmueble_observacion_agua: inmueble?.observacion_ser_agua || '',
      inmueble_ser_gas: inmueble?.ser_gas_domiciliario === true || inmueble?.ser_gas_domiciliario === 'true',
      inmueble_observacion_gas: inmueble?.observacion_ser_gas_domiciliario || '',
      inmueble_ser_aseo: inmueble?.ser_bioagricola === true || inmueble?.ser_bioagricola === 'true',
      inmueble_observacion_aseo: inmueble?.observacion_ser_bioagricola || '',
      inmueble_ser_energia: inmueble?.ser_energia === true || inmueble?.ser_energia === 'true',
      inmueble_observacion_energia: inmueble?.observacion_ser_energia || '',

      dependientes_copia: [],
      clausulas_copia: selectedClausulas.map(c => ({
        titulo: c.titulo || '',
        texto: c.texto || '',
      })),

      fechainicio: formData.fechainicio,
      fechafin: formData.fechafin,
      diaHInicioPago: parseInt(formData.diaHInicioPago) || 9,
      diaFinPago: parseInt(formData.diaFinPago) || 14,
      contrato_Activo: formData.contrato_Activo,
      ciudad: formData.ciudad || 'Villavicencio',
      tipoContrato: formData.tipoContrato || 'local comercial',
      fechaEntregaInmueble: formData.fechaEntregaInmueble || formData.fechainicio,
      fechaRestitucionInmueble: formData.fechaRestitucionInmueble || formData.fechafin,
      fecha: formData.fecha || formData.fechainicio,
      canonArrendamiento: parseFloat(formData.canonArrendamiento) || 0,
      penalidadDiaria: parseFloat(formData.penalidadDiaria) || 9000,
      clausulaPenalPorcentaje: parseInt(formData.clausulaPenalPorcentaje) || 20,
      duracionMeses: parseInt(formData.duracionMeses) || 6,

      arrendador_id_original: arrendador?.id || null,
      arrendatario_id_original: arrendatario?.id || null,
      coarrendatario_id_original: coarrendatario?.id || null,
      inmueble_id_original: inmueble?.id || null,
      solicitud_id: formData.solicitudId || null,

      fechafinOtrosi: formData.fechafinOtrosi || null,
    };
  };

  // ============================================================
  // HANDLERS
  // ============================================================
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
            first_name: usuarioSeleccionado.first_name || '',
            last_name: usuarioSeleccionado.last_name || '',
            genero: usuarioSeleccionado.genero || 'M',
            email: usuarioSeleccionado.email || '',
            celular: usuarioSeleccionado.celular || '',
            celularDos: usuarioSeleccionado.celularDos || '',
            tipoUsuario: usuarioSeleccionado.tipoUsuario || 'propietario',
            doc_identificacion: usuarioSeleccionado.doc_identificacion || '',
            tipo_documento: usuarioSeleccionado.tipo_documento || 'CC',
            lugarExpCedula: usuarioSeleccionado.lugarExpCedula || 'Villavicencio',
            direccion: usuarioSeleccionado.direccion || '',
            barrio: usuarioSeleccionado.barrio || '',
            ciudad: usuarioSeleccionado.ciudad || 'Villavicencio',
            direccionCorrespondencia: usuarioSeleccionado.direccionCorrespondencia || '',
            barrioCorrespondencia: usuarioSeleccionado.barrioCorrespondencia || '',
            ciudadCorrespondencia: usuarioSeleccionado.ciudadCorrespondencia || 'Villavicencio',
            CuentaBancolombia: usuarioSeleccionado.CuentaBancolombia || '',
            cuentaNequi: usuarioSeleccionado.cuentaNequi || '',
            cuentaDaviplata: usuarioSeleccionado.cuentaDaviplata || '',
            llave: usuarioSeleccionado.llave || '',
            activo: usuarioSeleccionado.activo || false,
            is_active: usuarioSeleccionado.is_active || false,
            empresa: usuarioSeleccionado.empresa || '',
            ocupacion: usuarioSeleccionado.ocupacion || '',
            estadoCivil: usuarioSeleccionado.estadoCivil || '',
            descActividadEconomica: usuarioSeleccionado.descActividadEconomica || '',
            CodClasificaIndustrialIU: usuarioSeleccionado.CodClasificaIndustrialIU || ''
          }
        }
      }));

      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
    }
  };

  const handleInmuebleChange = (id) => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData(prev => ({ ...prev, inventario: file }));
    } else {
      alert("Por favor, selecciona un archivo PDF.");
      setFormData(prev => ({ ...prev, inventario: null }));
    }
  };

  const handleCheckboxChange = (id) => {
    setClausulas(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const addClausula = () => {
    const newId = clausulas.length + 1;
    setClausulas(prev => [...prev, {
      id: newId,
      texto: `Cláusula ${newId}: [Texto de la cláusula aquí]`,
      selected: true,
      titulo: `Cláusula ${newId}`
    }]);
  };

  const removeClausula = (id) => {
    setClausulas(prev => prev.filter(c => c.id !== id));
  };

  const handleClausulaChange = (id, texto) => {
    setClausulas(prev => prev.map(c => c.id === id ? { ...c, texto } : c));
  };

  // ============================================================
  // CARGAR DATOS INICIALES Y DE LA SOLICITUD
  // ============================================================
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [adminRes, propRes, arrRes, inmRes] = await Promise.all([
          fetch(`${API_URL}/api/usuarios_por_grupo/administrador/`),
          fetch(`${API_URL}/api/usuarios_por_grupo/propietario/`),
          fetch(`${API_URL}/api/usuarios_por_grupo/arrendatario/`),
          fetch(`${API_URL}/api/inmuebles/`)
        ]);

        const adminData = await adminRes.json();
        const propData = await propRes.json();
        const arrData = await arrRes.json();
        const inmData = await inmRes.json();

        console.log('Administradores:', adminData);
        console.log('Propietarios:', propData);
        console.log('Arrendatarios:', arrData);
        console.log('Inmuebles:', inmData);

        setAdministradores(adminData);
        setArrendatarios(arrData);
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

        // ============================================================
        // CARGAR DATOS DE LA SOLICITUD
        // ============================================================
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

          // Datos del inmueble
          const inmuebleData = {
            id: casaData.id,
            direccion: casaData.direccion || '',
            barrio: casaData.barrio || '',
            ciudad: casaData.ciudad || 'Villavicencio',
            descripcion: casaData.descripcion || '',
            tipoInmueble: casaData.tipoInmueble || '',
            canonmensual: casaData.canonmensual || 0,
            matricula: casaData.matricula || '',
            matriculaInmobiliaria: casaData.matriculaInmobiliaria || casaData.matricula || '',
            propietario_id: casaData.propietario_id || null,
            ser_agua: casaData.ser_agua || false,
            observacion_ser_agua: casaData.observacion_ser_agua || '',
            ser_gas_domiciliario: casaData.ser_gas_domiciliario || false,
            observacion_ser_gas_domiciliario: casaData.observacion_ser_gas_domiciliario || '',
            ser_bioagricola: casaData.ser_bioagricola || false,
            observacion_ser_bioagricola: casaData.observacion_ser_bioagricola || '',
            ser_energia: casaData.ser_energia || false,
            observacion_ser_energia: casaData.observacion_ser_energia || '',
          };
          setInmuebleSeleccionado(inmuebleData);

          // Datos del arrendatario
          const arrendatarioObj = {
            id: arrendatarioData?.id || null,
            first_name: arrendatarioData?.first_name || '',
            last_name: arrendatarioData?.last_name || '',
            n_cedula: arrendatarioData?.doc_identificacion || arrendatarioData?.n_cedula || '',
            c_exp: arrendatarioData?.c_exp || arrendatarioData?.lugarExpCedula || 'Villavicencio',
            celular: arrendatarioData?.celular || '',
            email: arrendatarioData?.email || '',
            direccion: arrendatarioData?.direccion || '',
            barrio: arrendatarioData?.barrio || '',
            ciudad: arrendatarioData?.ciudad || 'Villavicencio',
            genero: arrendatarioData?.genero || 'M',
            ocupacion: arrendatarioData?.ocupacion || '',
            empresa: arrendatarioData?.empresa || '',
            CodClasificaIndustrialIU: arrendatarioData?.CodClasificaIndustrialIU || '',
            descActividadEconomica: arrendatarioData?.descActividadEconomica || '',
            direccionCorrespondencia: arrendatarioData?.direccionCorrespondencia || '',
            barrioCorrespondencia: arrendatarioData?.barrioCorrespondencia || '',
            ciudadCorrespondencia: arrendatarioData?.ciudadCorrespondencia || 'Villavicencio',
          };

          // Datos del coarrendatario
          let coarrendatarioObj = null;
          if (coarrendatarioData) {
            coarrendatarioObj = {
              id: coarrendatarioData.id || null,
              first_name: coarrendatarioData.first_name || '',
              last_name: coarrendatarioData.last_name || '',
              direccion: coarrendatarioData.direccion || '',
              barrio: coarrendatarioData.barrio || '',
              ciudad: coarrendatarioData.ciudad || 'Villavicencio',
              n_cedula: coarrendatarioData.doc_identificacion || coarrendatarioData.n_cedula || '',
              c_exp: coarrendatarioData.c_exp || coarrendatarioData.lugarExpCedula || 'Villavicencio',
              celular: coarrendatarioData.celular || '',
              email: coarrendatarioData.email || '',
              genero: coarrendatarioData.genero || 'M',
              ocupacion: coarrendatarioData.ocupacion || '',
              empresa: coarrendatarioData.empresa || '',
              direccionCorrespondencia: coarrendatarioData.direccionCorrespondencia || '',
              barrioCorrespondencia: coarrendatarioData.barrioCorrespondencia || '',
              ciudadCorrespondencia: coarrendatarioData.ciudadCorrespondencia || 'Villavicencio',
            };
          }

          // Buscar el propietario en la lista unificada
          const propietarioData = unificados.find(u => u.idReal === casaData.propietario_id && u.tipoUsuario === 'propietario');

          setFormData(prev => ({
            ...prev,
            inmueble: { id: inmuebleData.id, data: inmuebleData },
            userArrendatario: { id: arrendatarioObj.id, data: arrendatarioObj },
            coarrendatario: { id: coarrendatarioObj?.id || null, data: coarrendatarioObj },
            canonArrendamiento: inmuebleData.canonmensual || '',
            duracionMeses: solicitudCompletaData.duracionContrato || 6,
            userAdministrador: {
              idCompuesto: propietarioData?.idCompuesto || null,
              idReal: casaData.propietario_id || null,
              tipo: 'propietario',
              data: propietarioData ? {
                id: propietarioData.idReal,
                first_name: propietarioData.first_name || '',
                last_name: propietarioData.last_name || '',
                genero: propietarioData.genero || 'M',
                email: propietarioData.email || '',
                celular: propietarioData.celular || '',
                celularDos: propietarioData.celularDos || '',
                tipoUsuario: propietarioData.tipoUsuario || 'propietario',
                doc_identificacion: propietarioData.doc_identificacion || '',
                tipo_documento: propietarioData.tipo_documento || 'CC',
                lugarExpCedula: propietarioData.lugarExpCedula || 'Villavicencio',
                direccion: propietarioData.direccion || '',
                barrio: propietarioData.barrio || '',
                ciudad: propietarioData.ciudad || 'Villavicencio',
                direccionCorrespondencia: propietarioData.direccionCorrespondencia || '',
                barrioCorrespondencia: propietarioData.barrioCorrespondencia || '',
                ciudadCorrespondencia: propietarioData.ciudadCorrespondencia || 'Villavicencio',
                CuentaBancolombia: propietarioData.CuentaBancolombia || '',
                cuentaNequi: propietarioData.cuentaNequi || '',
                cuentaDaviplata: propietarioData.cuentaDaviplata || '',
                activo: propietarioData.activo || false,
                is_active: propietarioData.is_active || false,
                empresa: propietarioData.empresa || '',
                ocupacion: propietarioData.ocupacion || '',
                estadoCivil: propietarioData.estadoCivil || '',
                descActividadEconomica: propietarioData.descActividadEconomica || '',
                CodClasificaIndustrialIU: propietarioData.CodClasificaIndustrialIU || ''
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

  // Forzar actualización cuando cambia el arrendador
  useEffect(() => {
    if (formData.userAdministrador?.data) {
      setRefreshKey(prev => prev + 1);
    }
  }, [formData.userAdministrador?.data]);

  // ============================================================
  // OBTENER CSRF TOKEN
  // ============================================================
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  // ============================================================
  // GENERAR CLÁUSULAS CON DATOS DEL CONTRATO
  // ============================================================
  useEffect(() => {
    if (inmuebleSeleccionado && formData.userArrendatario?.data && formData.canonArrendamiento) {

      const inmueble = inmuebleSeleccionado;
      const usuarioSeleccionado = formData.userAdministrador?.data;
      const arrendatario = formData.userArrendatario.data;
      const coarrendatario = formData.coarrendatario?.data;

      const canonNumero = parseFloat(formData.canonArrendamiento) || 0;
      const canonPalabras = convertirNumeroAPalabras(canonNumero);
      const canonFormateado = formatoNumero(canonNumero);
      const valorTotalContrato = canonNumero * (formData.duracionMeses || 6);
      const clausulaPenalValor = Math.round(valorTotalContrato * (formData.clausulaPenalPorcentaje / 100));

      const fechaInicio = formatearFechaEnPalabras(formData.fechainicio);
      const fechaFin = formatearFechaEnPalabras(formData.fechafin);
      const fechaEntrega = formatearFechaEnPalabras(formData.fechaEntregaInmueble);
      const fechaRestitucion = formatearFechaEnPalabras(formData.fechaRestitucionInmueble);

      const duracionMeses = calcularDuracionEnMeses(formData.fechainicio, formData.fechafin);
      const duracionPalabras = convertirNumeroAPalabras(duracionMeses);

      // Determinar términos según género
      const arrendadorTerm = usuarioSeleccionado?.genero === 'F' ? 'LA ARRENDADORA' : 'EL ARRENDADOR';
      const arrendadorTermMin = usuarioSeleccionado?.genero === 'F' ? 'la arrendadora' : 'el arrendador';
      const arrendadTerm = usuarioSeleccionado?.genero === 'F' ? 'obligada' : 'obligado';
      const arrendadorfTerm = usuarioSeleccionado?.genero === 'F' ? 'facultada' : 'facultado';
      
      const arrendatarioTerm = arrendatario?.genero === 'F' ? 'LA ARRENDATARIA' : 'EL ARRENDATARIO';
      const arrendatarioTermMin = arrendatario?.genero === 'F' ? 'la arrendataria' : 'el arrendatario';
      const arrendatTerm = arrendatario?.genero === 'F' ? 'la señora' : 'el señor';

      // Nombres completos
      const arrendadorNombre = `${usuarioSeleccionado?.first_name || ''} ${usuarioSeleccionado?.last_name || ''}`.trim().toUpperCase() || 'ARRENDADOR';
      const arrendatarioNombre = `${arrendatario?.first_name || ''} ${arrendatario?.last_name || ''}`.trim().toUpperCase() || 'ARRENDATARIO';

      // Datos del coarrendatario
      const coarrendatarioTerm = coarrendatario?.genero === 'F' ? 'LA COARRENDATARIA' : 'EL COARRENDATARIO';
      const coarrendataTerm = coarrendatario?.genero === 'F' ? 'COARRENDATARIA' : 'COARRENDATARIO';
      const coarrendataSTerm = coarrendatario?.genero === 'F' ? 'la señora' : 'el señor';

      const mesesEnPalabras = convertirNumeroAPalabras(formData.duracionMeses || 6);
      const mesesConCero = String(formData.duracionMeses || 6).padStart(2, '0');

      setClausulas(prev => prev.map(clausula => {
        switch (clausula.id) {
          case 1:
            return {
              ...clausula,
              texto: `Clausula primera – Objeto del contrato: mediante el presente contrato ${arrendadorTerm} concede a ${arrendatarioTerm} el goce del ${formData.tipoContrato || 'local comercial'}, ubicado en la ${inmueble.direccion || ''} barrio ${inmueble.barrio || ''} de la ciudad de ${inmueble.ciudad || 'Villavicencio'}, identificada con el folio de matrícula inmobiliaria No. ${inmueble.matriculaInmobiliaria || inmueble.matricula || ''}.`
            };
          case 2:
            return {
              ...clausula,
              texto: `Clausula segunda – Destino del inmueble: solo se autoriza desarrollar actividades contempladas en el Código de Clasificación Industrial Internacional Uniforme Nro. ${arrendatario?.CodClasificaIndustrialIU || '9602'}. ${arrendatarioTerm} destinara el Inmueble para el funcionamiento de ${arrendatario?.descActividadEconomica || 'actividades comerciales'}.`
            };
          case 3:
            return {
              ...clausula,
              texto: `Clausula tercera – Termino del contrato: se estipula por el término de ${duracionPalabras} (${duracionMeses}) meses, inicia el ${fechaInicio || 'fecha de inicio'} y finaliza el ${fechaFin || 'fecha de terminación'}.`
            };
          case 4:
            return {
              ...clausula,
              texto: `Clausula cuarta – Remuneración mensual o canon de arrendamiento: del ${convertirNumeroAPalabras(formData.diaHInicioPago || 9)} (${formData.diaHInicioPago || 9}) al ${convertirNumeroAPalabras(formData.diaFinPago || 14)} (${formData.diaFinPago || 14}) de cada mes, ${arrendatarioTerm} se obliga a pagar a ${arrendadorTerm} la suma de ${canonPalabras} pesos M/cte. ($${canonFormateado}), en dinero en efectivo y que serán recibidos en la ubicación del inmueble objeto del presente contrato.`
            };
          case 5:
            return {
              ...clausula,
              texto: `Clausula quinta – Prorroga del contrato y aumento del canon: las partes aceptan la prórroga, y se conviene que el reajuste del canon mensual se hará anualmente con base al último informe anual de Índice de Precios al Consumidor (IPC).`
            };
          case 6:
            return {
              ...clausula,
              texto: `Clausula sexta – Clausula penal: El incumplimiento o el cumplimiento tardío de cualquiera de las obligaciones que contrae ${arrendatarioTerm} en este contrato lo obliga, al pago de una suma equivalente a tres (3) cánones de arrendamiento vigente al momento del incumplimiento o del cumplimiento tardío, a título de pena, exigible sin necesidad de los requerimientos previos ni constitución en mora de que tratan los artículos 1594 y 1595 del Código Civil o cualquier otra disposición que así lo contemple, sin que su cobro implique la extinción de la obligación principal o de cualquiera de las obligaciones, derivadas del contrato y sin perjuicio del cobro de las demás indemnizaciones que ese incumplimiento o cumplimiento tardío causen.`
            };
          case 7:
            return {
              ...clausula,
              texto: `Clausula séptima – Inspección: ${arrendatarioTerm} permite las visitas que ${arrendadorTerm} o sus representantes tengan a bien realizar para constatar el estado y conservación del inmueble y otras circunstancias que sean de su interés.`
            };
          case 8:
            return {
              ...clausula,
              texto: `Clausula octava – Recibo y entrega: ${arrendatarioTerm} declara que ha recibido el inmueble objeto del presente contrato en buen estado, de conformidad con el inventario denominado "Anexo fotográfico" que se firma por las partes en pliego separado y que para todos los efectos legales forma parte de este contrato y se obligan a conservarlo y restituirle en las mismas condiciones a más tardar dentro de los 05 días calendario contados a partir de la terminación del presente contrato, especialmente en lo referente a la pintura del inmueble. Además, ${arrendatarioTerm} declara que ha recibido el inmueble con todas las instalaciones eléctricas, y estructurales en buen estado de funcionamiento y así deberá entregarlas a la terminación del contrato.`
            };
          case 9:
            return {
              ...clausula,
              texto: `Clausula novena – Reparaciones y mejoras: las reparaciones, variaciones y reformas de cualquier clase que haga ${arrendatarioTerm} son por cuenta de éste y para efectuarlas se requiere previa autorización escrita de ${arrendadorTerm}. Parágrafo. ${arrendadorTerm} no queda obligada a pagar tales mejoras o reformas ni a indemnizar en forma alguna a ${arrendatarioTerm} aún en los casos en que aquellas hayan autorizado expresamente.`
            };
          case 10:
            return {
              ...clausula,
              texto: `Clausula decima – Servicios públicos: los servicios de energía eléctrica, y demás que tenga o llegue a tener el inmueble objeto de este contrato durante su vigencia, serán por cuenta y pagados directamente por la parte arrendataria, sin que ${arrendadorTerm} tenga responsabilidad alguna por la correcta o deficiente prestación de tales servicios.`
            };
          case 11:
            return {
              ...clausula,
              texto: `Clausula decima primera – Subarriendo y cesión: ${arrendatarioTerm} no puede subarrendar el inmueble ni ceder el contrato sin autorización previa y escrita de ${arrendadorTerm}, al igual que, ${arrendatarioTerm} acepta la cesión del contrato que haga ${arrendadorTerm} bastando para esto la información previa verbal o escrita.`
            };
          case 12:
            return {
              ...clausula,
              texto: `Clausula décima segunda – prohibiciones: No se podrá depositar, guardar o almacenar en el inmueble arrendado materiales inflamables, sustancias explosivas o tóxicas, elementos destinados para uso ilícito.`
            };
          case 13:
            return {
              ...clausula,
              texto: `Clausula décima tercera – Otras causales de terminación del contrato: ${arrendadorTerm} además podrá dar por terminado el presente contrato por los siguientes motivos: a) la cesión del contrato o del goce del inmueble y subarriendo total o parcial del inmueble arrendado sin autorización expresa y escrita del arrendador; b) cambio de destinación del inmueble por parte de ${arrendatarioTerm}; c) el no pago del precio y los reajustes dentro del término previsto en este contrato; d) la destinación del inmueble para fines ilícitos o que presente peligro para el inmueble o salubridad de sus habitantes; e) la realización de mejoras, cambios, ampliaciones del inmueble sin autorización expresa y escrita de ${arrendadorTerm} y/o la destrucción total y parcial del inmueble; f) la no cancelación de los servicios públicos a cargo de ${arrendatarioTerm} siempre que se origine la desconexión o pérdida del servicio; g) cuando el propietario o poseedor necesite el inmueble para ocuparlo o cuando el inmueble haya de demolerse para efectuar una nueva construcción o cuando se requiere desocupado con el fin de ejecutar obras indispensables para su reparación; h) cuando el inmueble haya de entregarse en cumplimiento de las obligaciones originadas en un contrato de compraventa; i) las demás previstas por la ley.`
            };
          case 14:
            return {
              ...clausula,
              texto: `Clausula décima cuarta – Exención de responsabilidad: ${arrendadorTerm} no asume responsabilidad alguna por los daños o perjuicios que ${arrendatarioTerm} pueda sufrir por caso fortuito, fuerza mayor o causas atribuibles a terceros.`
            };
          case 15:
            return {
              ...clausula,
              texto: `Clausula décima quinta – Autorizaciones: ${arrendatarioTerm} autoriza de manera irrevocable a ${arrendadorTerm} o a quien represente sus derechos u ostente en el futuro la calidad de acreedor, a consultar, solicitar, suministrar, reportar, procesar y divulgar toda la información que se refiera al comportamiento crediticio, personales o económicos para que en el evento que se constituya mora en el pago de cualquier servicio público, arrendamiento en o cualquier otro concepto que sea a su cargo, durante el término inicial o el de sus prorrogas o a la terminación del contrato, se incorporen sus nombres, apellidos y documento de identificación a los archivos de deudores morosos o con referencias negativas que se lleve o cualquier banco de datos comerciales, personales o económicos. ${arrendatarioTerm} conoce que el alcance de esta autorización implica que el comportamiento frente a sus obligaciones será registrado con el objeto de suministrar información suficiente y adecuada al mercado sobre el estado de sus obligaciones financieras, comerciales, crediticias, de servicios etc. en consecuencia, quienes se encuentren afiliados y/o tengan acceso a las centrales de información y entidades aquí relacionadas o cualquier otra entidad encargada del manejo de datos comerciales, personales o económicos, podrán conocer esta información de conformidad con la legislación y jurisprudencia aplicable. La información podrá ser igualmente utilizada para efectos estadísticos. los derechos y obligaciones del arrendatario, así como la permanencia de su información en las bases de datos corresponden a lo determinado por el ordenamiento jurídico aplicable del cual, por ser de carácter público, manifiesta que está enterado. así mismo, manifiesta ${arrendatarioTerm} que conoce el contenido del reglamento de las citadas entidades. En caso de que, en el futuro, La arrendadora, efectúe, a favor de un tercero, una venta de cartera o una cesión a cualquier título de las obligaciones a cargo del arrendatario, los efectos de la anterior autorización se extenderán a este en los mismos términos y condiciones. Así mismo, autoriza a las entidades encargadas del manejo de la información a que, en su calidad de operadores, pongan la información a disposición de otros operadores nacionales o extranjeros, en los términos que establece la ley, siempre y cuando su objeto sea similar al aquí establecido. los deudores solidarios: autorizamos a ${arrendadorTerm} o a quien represente sus derechos u ostente en el futuro la calidad de acreedor, para que, en los mismos términos señalados en esta cláusula, consulten, suministren, reporten, procesen y divulguen toda nuestra información, que se refiera al comportamiento crediticio, financiero, comercial, de servicios etc.`
            };
          case 16:
            return {
              ...clausula,
              texto: `Clausula décima sexta – Mérito ejecutivo: ${arrendatarioTerm} acepta como suficiente título ejecutivo el presente contrato de arrendamiento de manera que, si quedare a deber ${arrendadorTerm} suma alguna por concepto de cánones de arrendamientos, pago e instalación de servicios públicos, sumas indemnizatorias y cláusula penal, cualquiera que sea, este último podrá hacerlas efectivas sirviendo como recaudo ejecutivo el presente contrato.`
            };
          case 17:
            return {
              ...clausula,
              texto: `Clausula décima séptima – Gestión de cobro: en caso de retardo en el pago del canon mensual ${arrendatarioTerm} reconocerá a ${arrendadorTerm} los gastos que por gestión de cobro se generen, sin que este pago signifique convalidación o consentimiento en la mora por parte de ${arrendadorTerm} y sin menoscabo de las acciones que interpongan o deba instaurar la misma.`
            };
          case 18:
            return {
              ...clausula,
              texto: `Clausula décima octava – Gastos: son de cargo de ${arrendatarioTerm} los gastos que se causen con la formalización de este contrato.`
            };
          case 19:
            return {
              ...clausula,
              texto: `Clausula décima novena – Suspensión de servicios: ${arrendatarioTerm} autorizan de manera irrevocable a ${arrendadorTerm} para que, si incurren en mora en pago de cualquiera de los servicios públicos, durante el término inicial o el de sus prórrogas, solicitar de inmediato la suspensión temporal o definitiva del servicio que esté en mora y no se le instalará hasta estar a paz y salvo con la empresa respectiva.`
            };
          case 20:
            return {
              ...clausula,
              texto: `Clausula vigésima – Actividad comercial: Al destinarse el inmueble arrendado a actividad comercial, se aplicarán las disposiciones del código de comercio y a lo no dispuesto en este se le aplicarán las reglas del código civil.`
            };
          case 21:
            if (coarrendatario) {
              return {
                ...clausula,
                texto: `Clausula vigésima Primera – Coarrendatario: Para garantizar a ${arrendadorTerm} el cumplimiento de sus obligaciones consignadas en el presente contrato de arrendamiento, queda como coarrendatario ${coarrendataSTerm} ${coarrendatario.first_name || ''} ${coarrendatario.last_name || ''} residente en la ${coarrendatario.direccion || ''} barrio ${coarrendatario.barrio || ''}, mayor de edad y vecino de Villavicencio (Meta), identificado con cédula de ciudadanía Nro. ${formatoNumero(coarrendatario.n_cedula || '')} expedida en ${coarrendatario.c_exp || 'Villavicencio'}, quien a la fecha se desempeña como ${coarrendatario.ocupacion || 'comerciante'}, y declara que se obliga solidariamente con ${arrendadorTerm} durante el término de duración del contrato y el de sus prórrogas y por el tiempo que permanezca el inmueble en responsabilidad de ${arrendatTerm} ${arrendatario.first_name || ''} ${arrendatario.last_name || ''}.`
              };
            }
            return clausula;
          case 22:
            return {
              ...clausula,
              texto: `Clausula vigésima Segunda – Notificaciones: ${arrendadorTerm} recibirá notificaciones en la dirección: ${usuarioSeleccionado?.direccionCorrespondencia || ''} barrio ${usuarioSeleccionado?.barrioCorrespondencia || ''}, E-mail: ${usuarioSeleccionado?.email || ''}, WhatsApp: ${usuarioSeleccionado?.celular || ''}, ${arrendatarioTerm} recibirá notificaciones en: la dirección: ${arrendatario?.direccionCorrespondencia || ''} barrio ${arrendatario?.barrioCorrespondencia || ''}, E-mail: ${arrendatario?.email || ''} o al WhatsApp: ${arrendatario?.celular || ''}, ${coarrendatarioTerm} recibirá notificaciones en la dirección: ${coarrendatario?.direccionCorrespondencia || ''} barrio ${coarrendatario?.barrioCorrespondencia || ''}, E-mail: ${coarrendatario?.email || ''} o al WhatsApp: ${coarrendatario?.celular || ''}. Parágrafo: A partir de la fecha de suscripción de la presente autorización, ${usuarioSeleccionado?.first_name?.toUpperCase() || ''} ${usuarioSeleccionado?.last_name?.toUpperCase() || ''} queda ${arrendadorfTerm} para remitir vía correo electrónico a la dirección incluida en el presente documento, los actos administrativos proferidos por ${usuarioSeleccionado?.first_name?.toUpperCase() || ''} ${usuarioSeleccionado?.last_name?.toUpperCase() || ''} en el marco de la gestión y vigencia del contrato de arrendamiento genéticos y sus compromiso derivados que deban ser objeto de notificación, así como de las prórrogas de contratos que se suscriban, y de los que se encuentren en vigencia.`
            };
          case 23:
            return {
              ...clausula,
              texto: `Clausula vigésima tercera – Exclusión de responsabilidad por daños a terceros: ${arrendatarioTerm} se hará responsable de manera exclusiva por los daños y perjuicios que cause a terceros durante la vigencia de arrendamiento con ocasión del funcionamiento del establecimiento de comercio que resulte de su propiedad, sin que ${arrendadorTerm} y el propietario del inmueble deban responder solidariamente por reclamaciones e indemnizaciones por daños y perjuicios de tipo extracontractual.`
            };
          case 24:
            return {
              ...clausula,
              texto: `Clausula vigésima Cuarta: – Acuerdo de firma electrónica: las partes acuerdan firmar de forma electrónica el presente contrato, Su vigencia corresponde a la misma del contrato, sus adiciones o modificaciones, Su uso entre será solamente para la relación contractual, sin que, a la finalización, el contrato de arrendamiento, sus prorrogas y/o modificaciones firmado(s) electrónicamente pierdan su validez, eficacia y fuerza probatoria.`
            };
          default:
            return clausula;
        }
      }));
    }
  }, [inmuebleSeleccionado, formData.userArrendatario, formData.userAdministrador?.data, formData.userAdministrador?.idCompuesto, formData.coarrendatario,
    formData.canonArrendamiento, formData.duracionMeses, formData.fechainicio, formData.fechafin,
    formData.fechaEntregaInmueble, formData.fechaRestitucionInmueble,
    formData.penalidadDiaria, formData.clausulaPenalPorcentaje, formData.diaHInicioPago, formData.diaFinPago,
    usuariosDisponibles, refreshKey]);

  // ============================================================
  // SUBMIT
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

    const dataToSubmit = prepararDatosContrato();
    console.log('📝 Datos a enviar (con copias inmutables):', dataToSubmit);

    try {
      const response = await fetch(`${API_URL}/api/Contrato_Local_viviendaViewSet/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(dataToSubmit),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Contrato guardado exitosamente', data);
        if (formData.inventario) {
          await uploadPDF(data.id);
        }
        navigate(`/imprimir-contrato/${data.id}`);
      } else {
        console.error('❌ Error del servidor:', data);
        alert(`Error: ${data.error || data.detail || 'No se pudo guardar el contrato'}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al guardar el contrato');
    }
  };

  // ============================================================
  // SUBIR PDF
  // ============================================================
  const uploadPDF = async (contratoId) => {
    if (!formData.inventario) return;

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

      if (response.ok) {
        console.log('✅ PDF subido exitosamente');
      } else {
        console.error('❌ Error al subir el PDF');
      }
    } catch (error) {
      console.error('❌ Error al subir el PDF:', error);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Contrato Comercial</h1>
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
          {/* SECCIÓN 1: INFORMACIÓN DEL CONTRATO */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">📋 Información del Contrato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrendador / Propietario:</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Inmueble:</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  onChange={(e) => handleInmuebleChange(e.target.value)}
                  value={formData.inmueble?.id || ''}
                >
                  <option value="">Selecciona un inmueble</option>
                  {inmuebles.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.direccion} - {inv.barrio} ({inv.tipoInmueble})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula Inmobiliaria:</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={inmuebleSeleccionado?.matriculaInmobiliaria || inmuebleSeleccionado?.matricula || ''} disabled readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio:</label>
                <input type="date" name="fechainicio" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" onChange={handleInputChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin:</label>
                <input type="date" name="fechafin" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" onChange={handleInputChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega de inmueble:</label>
                <input type="date" name="fechaEntregaInmueble" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" onChange={handleInputChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Restitución inmueble:</label>
                <input type="date" name="fechaRestitucionInmueble" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONDICIONES ECONÓMICAS */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">💰 Condiciones Económicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canon de Arrendamiento ($):</label>
                <input type="number" name="canonArrendamiento" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={formData.canonArrendamiento} onChange={handleInputChange} placeholder="Ej: 450000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penalidad por día de retraso ($):</label>
                <input type="number" name="penalidadDiaria" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={formData.penalidadDiaria} onChange={handleInputChange} placeholder="Ej: 9000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días de pago (inicio):</label>
                <input type="number" name="diaHInicioPago" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={formData.diaHInicioPago} onChange={handleInputChange} placeholder="09" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días de pago (fin):</label>
                <input type="number" name="diaFinPago" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={formData.diaFinPago} onChange={handleInputChange} placeholder="14" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (meses):</label>
                <input type="number" name="duracionMeses" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={formData.duracionMeses} onChange={handleInputChange} placeholder="6" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Cláusula Penal:</label>
                <input type="number" name="clausulaPenalPorcentaje" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={formData.clausulaPenalPorcentaje} onChange={handleInputChange} placeholder="20" step="1" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FECHAS ESPECÍFICAS */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">📅 Fechas Específicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de firma del contrato:</label>
                <input type="date" name="fecha" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad de firma:</label>
                <input type="text" name="ciudad" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={formData.ciudad} onChange={handleInputChange} placeholder="Villavicencio" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="contrato_Activo" checked={formData.contrato_Activo} onChange={handleInputChange} className="h-4 w-4 text-blue-600 rounded" />
                <label className="ml-2 block text-sm text-gray-700">Contrato activo</label>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: DOCUMENTOS ADJUNTOS */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">📎 Documentos Adjuntos</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subir inventario (PDF):</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>

          {/* SECCIÓN 5: CLÁUSULAS */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">📜 Cláusulas del Contrato</h2>
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

          {/* BOTÓN DE GUARDAR */}
          <div className="sticky bottom-4 bg-white rounded-lg shadow-lg p-4 border-t-4 border-blue-500">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-lg shadow-md">
              💾 Guardar Contrato Comercial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoContratoComercial;