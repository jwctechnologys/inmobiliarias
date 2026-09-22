import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../../utils/csrf';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../../config';

const EditarContratoComercial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [primData, setPrimData] = useState([])
  const [formData, setFormData] = useState({

    userAdministrador: { id: null }, // Inicializar como objeto con id
    userArrendatario: { id: null }, // Inicializar como objeto con id
    coarrendatario: { id: null },
    tipoContrato: 'local comercial',
    fechainicio: '',
    fechafin: '',
    fechafinOtrosi: '',
    fechaEntregaInmueble: '',
    fechaRestitucionInmueble: '',
    diaHInicioPago: '',
    diaFinPago: '',
    contrato_Activo: true,
    inmueble: { id: null }, // Inicializar como objeto con id
    ciudad: '',
    fecha: '',
    inventario: null, // Agregar este campo para el archivo PDF
  });



  const [administradores, setAdministradores] = useState([]);
  const [arrendatarios, setArrendatarios] = useState([]);
  const [coarrendatarios, setCoarrendatarios] = useState([]);
  const [dependiente, setDependiente] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [clausulas, setClausulas] = useState([
    {
      id: 1,
      texto: '',
      selected: true,
    },

  ]);

  // Puedes usar 'id' para cargar los datos del contrato
  useEffect(() => {
    // Llamada a la API para obtener los detalles del contrato
    fetch(`${API_URL}/api/Contrato_Local_viviendaViewSet/${id}/`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Datos que llegan:', data);
        setFormData({
          userAdministrador: { id: data.userAdministrador.id },
          userArrendatario: { id: data.userArrendatario.id },
          coarrendatario: { id: data.coarrendatario ? data.coarrendatario.id : null },
          tipoContrato: data.tipoContrato,
          fechainicio: data.fechainicio,
          fechafin: data.fechafin,
          diaHInicioPago: data.diaHInicioPago,
          diaFinPago: data.diaFinPago,
          contrato_Activo: data.contrato_Activo,
          inmueble: { id: data.inmueble.id },
          ciudad: data.ciudad,
          fecha: data.fecha,
          clausulas: data.clausulas,
        });
        setPrimData(data);
        // Actualiza las cláusulas
        if (data.clausulas) {
          setClausulas(
            data.clausulas.map((clausula) => ({
              id: clausula.id,  // Usa el id que viene de la API
              texto: clausula.texto,
              selected: true, // Ajusta según sea necesario
            }))
          );
        }

      })
      .catch((error) => console.error('Error al cargar el contrato:', error));
  }, [id]); // La llamada se hará nuevamente cuando el 'id' cambie

  const normalizeClausulasIds = (clausulas) => {
    // Determinar el ID base
    const minId = Math.min(...clausulas.map(clausula => clausula.id));

    // Normalizar los IDs relativos
    return clausulas.map(clausula => ({
      ...clausula,
      relativeId: clausula.id - minId + 1, // Calcular ID relativo
    }));
  };
  useEffect(() => {
    // Cargar administradores
    fetch(`${API_URL}/api/usuarios_por_grupo/administrador/`)
      .then((response) => response.json())
      .then((data) => {
        //console.log('Datos de ADMINISTRADORES:', data);
        setAdministradores(data);
      })
      .catch((error) => console.error('Error al cargar administradores:', error));

    // Cargar arrendatarios
    fetch(`${API_URL}/api/usuarios_por_grupo/arrendatario/`)
      .then((response) => response.json())
      .then((data) => {
        //console.log('Datos de arrendatarios:', data); // Agrega esto
        setArrendatarios(data);
      })
      .catch((error) => console.error('Error al cargar arrendatarios:', error));

    // Cargar inmuebles
    fetch(`${API_URL}/api/inmuebles/`)
      .then((response) => response.json())
      .then((data) => {
        //console.log('Datos de inmueble:', data);
        setInmuebles(data)
      })
      .catch((error) => console.error('Error al cargar inmuebles:', error));
  }, []);
  // El useEffect que actualiza la cláusula con la dirección


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Ejemplo para establecer el usuario administrador (cuando lo selecciones)
  const handleUserAdminChange = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      userAdministrador: { id },  // Update userAdministrador with an ID
    }));
  };

  // Handler para cambiar el arrendatario
  const handleUserArrendatarioChange = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      userArrendatario: { id }, // Actualizar el arrendatario seleccionado
    }));

    // Cargar coarrendatarios relacionados
    fetch(`${API_URL}/api/coarrendatario/?arrendatario_id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        //console.log('Coarrendatarios relacionados:', data);
        setCoarrendatarios(data);
      })
      .catch((error) => console.error('Error al cargar coarrendatarios relacionados:', error));
    fetch(`${API_URL}/api/dependientes/${id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Dependientes del arrendatario:', data);
        setDependiente(data);

      })
      .catch((error) => console.error('Error al cargar dependientes relacionados:', error));

  };


  const handlecoarrendatarioChange = (id) => {
    const selectedCoarrendatario = coarrendatarios.find(coa => coa.id === parseInt(id));
    if (selectedCoarrendatario) {
      setFormData(prevData => ({
        ...prevData,
        coarrendatario: {
          id: selectedCoarrendatario.id,
          first_name: selectedCoarrendatario.first_name,
          last_name: selectedCoarrendatario.last_name,
          n_cedula: selectedCoarrendatario.n_cedula,
          c_exp: selectedCoarrendatario.c_exp,
          c_vive: selectedCoarrendatario.c_vive,
          celular: selectedCoarrendatario.celular,
          email: selectedCoarrendatario.email,
          direccion: selectedCoarrendatario.direccion,
          barrio: selectedCoarrendatario.barrio,
          ciudad: selectedCoarrendatario.ciudad,
          direccionCorrespondencia: selectedCoarrendatario.direccionCorrespondencia,
          barrioCorrespondencia: selectedCoarrendatario.barrioCorrespondencia,
          ciudadCorrespondencia: selectedCoarrendatario.ciudadCorrespondencia,
          genero: selectedCoarrendatario.genero,
          ocupacion: selectedCoarrendatario.ocupacion,
          empresa: selectedCoarrendatario.empresa,
        }
      }));
    }
  };
  function formatearFechaEnPalabras(fechaString) {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    // Convierte la fecha sin hora para evitar el desfase de zonas horarias
    const [year, month, day] = fechaString.split('-');  // Asumiendo que el formato de fecha es 'YYYY-MM-DD'
    const dia = parseInt(day);  // Asegúrate de convertir el día a número
    const mes = meses[parseInt(month) - 1];  // Convierte el mes a índice
    const año = parseInt(year);

    return `${dia} de ${mes} de ${año}`;
  }
  const calcularDuracionEnMeses = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
  };

  function convertirNumeroAPalabras(numero) {
    if (numero === 0) return 'Cero';

    const unidades = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    function capitalizarPrimeraLetra(texto) {
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function convertirCentenas(numero) {
      if (numero === 0) return '';
      if (numero === 100) return 'cien';
      const centena = Math.floor(numero / 100);
      const resto = numero % 100;

      return `${centenas[centena]} ${convertirDecenas(resto)}`.trim();
    }

    function convertirDecenas(numero) {
      if (numero === 0) return '';
      if (numero < 10) return unidades[numero];
      if (numero >= 10 && numero < 20) return especiales[numero - 10];
      const decena = Math.floor(numero / 10);
      const unidad = numero % 10;

      return unidad === 0 ? decenas[decena] : `${decenas[decena]} y ${unidades[unidad]}`;
    }

    function convertirMiles(numero) {
      const miles = Math.floor(numero / 1000);
      const resto = numero % 1000;

      const milesPalabra = miles === 1 ? 'mil' : `${convertirCentenas(miles)} mil`;
      const restoPalabra = convertirCentenas(resto);

      return `${milesPalabra} ${restoPalabra}`.trim();
    }

    function convertirMillones(numero) {
      const millones = Math.floor(numero / 1000000);
      const resto = numero % 1000000;

      const millonesPalabra = millones === 1 ? 'un millón' : `${convertirCentenas(millones)} millones`;
      const restoPalabra = convertirMiles(resto);

      return `${millonesPalabra} ${restoPalabra}`.trim();
    }

    let resultado;

    if (numero < 100) {
      resultado = convertirDecenas(numero);
    } else if (numero < 1000) {
      resultado = convertirCentenas(numero);
    } else if (numero < 1000000) {
      resultado = convertirMiles(numero);
    } else {
      resultado = convertirMillones(numero);
    }

    return capitalizarPrimeraLetra(resultado);
  }
  function formatoNumeroConSeparadores(numero) {
    return numero.toLocaleString('es-ES'); // Formatea el número con separadores de miles
  }
  useEffect(() => {
    if (formData.inmueble && formData.coarrendatario && formData.coarrendatario.id && inmuebleSeleccionado && formData.userAdministrador && formData.userArrendatario && formData.diaHInicioPago && formData.diaFinPago && formData.fechaEntregaInmueble && formData.fechaRestitucionInmueble && formData.fecha) {
      const inmueble = inmuebles.find(i => i.id === Number(formData.inmueble.id));
      const coarrendatario = {
        first_name: formData.coarrendatario.first_name,
        last_name: formData.coarrendatario.last_name,
        n_cedula: formData.coarrendatario.n_cedula,
        c_exp: formData.coarrendatario.c_exp,
        c_vive: formData.coarrendatario.c_vive,
        celular: formData.coarrendatario.celular,
        genero: formData.coarrendatario.genero,
        direccion: formData.coarrendatario.direccion,
        barrio: formData.coarrendatario.barrio,
        ciudad: formData.coarrendatario.ciudad,
        direccionCorrespondencia: formData.coarrendatario.direccionCorrespondencia,
        barrioCorrespondencia: formData.coarrendatario.barrioCorrespondencia,
        ciudadCorrespondencia: formData.coarrendatario.ciudadCorrespondencia,
        email: formData.coarrendatario.email,
        ocupacion: formData.coarrendatario.ocupacion,
        empresa: formData.coarrendatario.empresa, 
        // Asumiendo que también tienes el género aquí
      };
      // Buscar el administrador por ID
      const administrador = administradores.find(a => a.id === Number(formData.userAdministrador.id));
      const coarrendatarioTerm = coarrendatario.genero === 'F' ? 'LA COARRENDATARIA' : 'EL COARRENDATARIO';
      const coarrendataTerm = coarrendatario.genero === 'F' ? 'COARRENDATARIA' : 'COARRENDATARIO';
      const coarrendataSTerm = coarrendatario.genero === 'F' ? 'la señora' : 'el señor';
      // Buscar el arrendatario por ID (si tienes una lista similar de arrendatarios)
      const arrendatario = arrendatarios.find(a => a.id === Number(formData.userArrendatario.id));
      const fechaEntregaEnPalabras = formatearFechaEnPalabras(formData.fechaEntregaInmueble);
      const fechaRestitucionEnPalabras = formatearFechaEnPalabras(formData.fechaRestitucionInmueble);
      const fechaInicioEnPalabras = formatearFechaEnPalabras(formData.fechainicio);
      const fechaFinEnPalabras = formatearFechaEnPalabras(formData.fechafin);
      const canonEnPalabras = convertirNumeroAPalabras(inmuebleSeleccionado.canonmensual);
      const numeroPuntos = formatoNumeroConSeparadores(inmuebleSeleccionado.canonmensual);

      if (inmueble && administrador && arrendatario) {
        // Determinamos el término correcto para "arrendador" y "arrendatario"
        const arrendadorTerm = administrador.genero === 'F' ? 'LA ARRENDADORA' : 'EL ARRENDADOR';
        const arrendadTerm = administrador.genero === 'F' ? 'obligada' : 'obligado';
        const arrendatarioTerm = arrendatario.genero === 'F' ? 'LA ARRENDATARIA' : 'EL ARRENDATARIO';
        const arrendatTerm = arrendatario.genero === 'F' ? 'la señora' : 'el señor';
        const arrendadorfTerm = administrador.genero === 'F' ? 'facultada' : 'facultado';
        setClausulas(prevClausulas => {
          const normalizedClausulas = normalizeClausulasIds(prevClausulas);
          return normalizedClausulas.map(clausula => {
            if (clausula.relativeId === 1) {
              return {
                ...clausula,
                texto: `Clausula primera – Objeto del contrato: mediante el presente contrato ${arrendadorTerm} concede a ${arrendatarioTerm} el goce del ${formData.tipoContrato}, ubicado en la ${inmuebleSeleccionado.direccion} barrio ${inmuebleSeleccionado.barrio}.`
              };
            } else if (clausula.relativeId === 2) {
              return {
                ...clausula,
                texto: `Clausula segunda – Destino del inmueble: solo se autoriza desarrollar actividades contempladas en el Código de Clasificación Industrial Internacional Uniforme Nro. ${arrendatario.CodClasificaIndustrialIU}. ${arrendatarioTerm} destinara el Inmueble para el funcionamiento de ${arrendatario.descActividadEconomica}`
              };
            } else if (clausula.relativeId === 3) {
              return {
                ...clausula,
                texto: `Clausula tercera – Termino del contrato: se estipula por el término de ${convertirNumeroAPalabras(calcularDuracionEnMeses(formData.fechainicio, formData.fechafin))} (${calcularDuracionEnMeses(formData.fechainicio, formData.fechafin)}) meses, inicia el ${fechaInicioEnPalabras} y finaliza el ${fechaFinEnPalabras}.`
              };
            } else if (clausula.relativeId === 4) {
              return {
                ...clausula,
                texto: `Clausula cuarta – Remuneración mensual o canon de arrendamiento: del ${convertirNumeroAPalabras(formData.diaHInicioPago)} (${formData.diaHInicioPago}) al ${convertirNumeroAPalabras(formData.diaFinPago)} (${formData.diaFinPago}) de cada mes, ${arrendatarioTerm} se obliga a pagar a ${arrendadorTerm} la suma de ${canonEnPalabras} pesos M/cte. ($${numeroPuntos}), en dinero en efectivo y que serán recibidos en la ubicación del inmueble objeto del presente contrato.`
              };
            } else if (clausula.relativeId === 6) {
              return {
                ...clausula,
                texto: `Clausula sexta – Clausula penal: El incumplimiento o el cumplimiento tardío de cualquiera de las obligaciones que contrae ${arrendatarioTerm} en este contrato lo obliga, al pago de una suma equivalente a tres (3) cánones de arrendamiento vigente al momento del incumplimiento o del cumplimiento tardío, a título de pena, exigible sin necesidad de los requerimientos previos ni constitución en mora de que tratan los artículos 1594 y 1595 del Código Civil o cualquier otra disposición que así lo contemple, sin que su cobro implique la extinción de la obligación principal o de cualquiera de las obligaciones, derivadas del contrato y sin perjuicio del cobro de las demás indemnizaciones que ese incumplimiento o cumplimiento tardío causen.`
              };
            } else if (clausula.relativeId === 7) {
              return {
                ...clausula,
                texto: `Clausula séptima – Inspección: ${arrendatarioTerm} permite las visitas que ${arrendadorTerm} o sus representantes tengan a bien realizar para constatar el estado y conservación del inmueble y otras circunstancias que sean de su interés.`
              };
            } else if (clausula.relativeId === 8) {
              return {
                ...clausula,
                texto: `Clausula octava – Recibo y entrega: ${arrendatarioTerm} declara que ha recibido el inmueble objeto del presente contrato en buen estado, de conformidad con el inventario denominado “Anexo fotográfico” que se firma por las partes en pliego separado y que para todos los efectos legales forma parte de este contrato y se obligan a conservarlo y restituirle en las mismas condiciones a más tardar dentro de los 05 días calendario contados a partir de la terminación del presente contrato, especialmente en lo referente a la pintura del inmueble. Además, ${arrendatarioTerm} declara que ha recibido el inmueble con todas las instalaciones eléctricas, y estructurales en buen estado de funcionamiento y así deberá entregarlas a la terminación del contrato.`
              };
            } else if (clausula.relativeId === 9) {
              return {
                ...clausula,
                texto: `Clausula novena – Reparaciones y mejoras: las reparaciones, variaciones y reformas de cualquier clase que haga ${arrendatarioTerm} son por cuenta de éste y para efectuarlas se requiere previa autorización escrita de ${arrendadorTerm}. Parágrafo. ${arrendadorTerm} no queda obligada a pagar tales mejoras o reformas ni a indemnizar en forma alguna a ${arrendatarioTerm} aún en los casos en que aquellas hayan autorizado expresamente.`
              };
            } else if (clausula.relativeId === 10) {
              return {
                ...clausula,
                texto: `Clausula decima – Servicios públicos: los servicios de energía eléctrica, y demás que tenga o llegue a tener el inmueble objeto de este contrato durante su vigencia, serán por cuenta y pagados directamente por la parte arrendataria, sin que ${arrendadorTerm} tenga responsabilidad alguna por la correcta o deficiente prestación de tales servicios.`
              };
            } else if (clausula.relativeId === 11) {
              return {
                ...clausula,
                texto: `Clausula decima primera – Subarriendo y cesión: ${arrendatarioTerm} no puede subarrendar el inmueble ni ceder el contrato sin autorización previa y escrita de ${arrendadorTerm}, al igual que, ${arrendatarioTerm} acepta la cesión del contrato que haga ${arrendadorTerm} bastando para esto la información previa verbal o escrita.`
              };
            } else if (clausula.relativeId === 13) {
              return {
                ...clausula,
                texto: `Clausula décima tercera – Otras causales de terminación del contrato: ${arrendadorTerm} además podrá dar por terminado el presente contrato por los siguientes motivos: a) la cesión del contrato o del goce del inmueble y subarriendo total o parcial del inmueble arrendado sin autorización expresa y escrita del arrendador; b) cambio de destinación del inmueble por parte de ${arrendatarioTerm}; c) el no pago del precio y los reajustes dentro del término previsto en este contrato; d) la destinación del inmueble para fines ilícitos o  que presente peligro para el inmueble o salubridad de sus habitantes; e) la realización de mejoras, cambios, ampliaciones del inmueble sin autorización expresa y escrita de ${arrendadorTerm} y/o la destrucción total y parcial del inmueble; f) la no cancelación de los servicios públicos a cargo de ${arrendatarioTerm} siempre que se origine la desconexión o pérdida del servicio; g) cuando el propietario o poseedor necesite el inmueble para ocuparlo o cuando el inmueble haya de demolerse para efectuar una nueva construcción o cuando se requiere desocupado con el fin de ejecutar obras indispensables para su reparación; h) cuando el inmueble haya de entregarse en cumplimiento de las obligaciones originadas en un contrato de compraventa; i) las demás previstas por la ley.`
              };
            } else if (clausula.relativeId === 14) {
              return {
                ...clausula,
                texto: `Clausula décima cuarta – Exención de responsabilidad: ${arrendadorTerm} no asume responsabilidad alguna por los daños o perjuicios que ${arrendatarioTerm} pueda sufrir por caso fortuito, fuerza mayor o causas atribuibles a terceros.`
              };
            } else if (clausula.relativeId === 15) {
              return {
                ...clausula,
                texto: `Clausula décima quinta – Autorizaciones: ${arrendatarioTerm} autoriza de manera irrevocable ${arrendadorTerm} o a quien represente sus derechos u ostente en el futuro la calidad de acreedor, a consultar, solicitar, suministrar, reportar, procesar y divulgar toda la información que se refiera al comportamiento crediticio, personales o económicos para que en el evento que se constituya mora en el pago de cualquier servicio público, arrendamiento en o cualquier otro concepto que sea a su cargo, durante el término inicial o el de sus prorrogas o a la terminación del contrato, se incorporen sus nombres, apellidos y documento de identificación a los archivos de deudores morosos o con referencias negativas que se lleve o cualquier banco de datos comerciales, personales o económicos. ${arrendatarioTerm} conoce que el alcance de esta autorización implica que el comportamiento frente a sus obligaciones será registrado con el objeto de suministrar información suficiente y adecuada al mercado sobre el estado de sus obligaciones financieras, comerciales, crediticias, de servicios etc. en consecuencia, quienes se encuentren afiliados y/o tengan acceso a las centrales de información y entidades aquí relacionadas o cualquier otra entidad encargada del manejo de datos comerciales, personales o económicos, podrán conocer esta información de conformidad con la legislación y jurisprudencia aplicable. La información podrá ser igualmente utilizada para efectos estadísticos. los derechos y obligaciones del arrendatario, así como la permanencia de su información en las bases de datos corresponden a lo determinado por el ordenamiento jurídico aplicable del cual, por ser de carácter público, manifiesta que está enterado. así mismo, manifiesta ${arrendatarioTerm} que conoce el contenido del reglamento de las citadas entidades. En caso de que, en el futuro, La arrendadora, efectúe, a favor de un tercero, una venta de cartera o una cesión a cualquier título de las obligaciones a cargo del arrendatario, los efectos de la anterior autorización se extenderán a este en los mismos términos y condiciones. Así mismo, autoriza a las entidades encargadas del manejo de la información a que, en su calidad de operadores, pongan la información a disposición de otros operadores nacionales o extranjeros, en los términos que establece la ley, siempre y cuando su objeto sea similar al aquí establecido. los deudores solidarios: autorizamos a ${arrendadorTerm} o a quien represente sus derechos u ostente en el futuro la calidad de acreedor, para que, en los mismos términos señalados en esta cláusula, consulten, suministren, reporten, procesen y divulguen toda nuestra información, que se refiera al comportamiento crediticio, financiero, comercial, de servicios etc.`
              };
            } else if (clausula.relativeId === 16) {
              return {
                ...clausula,
                texto: `Clausula décima sexta – Mérito ejecutivo: ${arrendatarioTerm} acepta como suficiente título ejecutivo el presente contrato de arrendamiento de manera que, si quedare a deber ${arrendadorTerm} suma alguna por concepto de cánones de arrendamientos, pago e instalación de servicios públicos, sumas indemnizatorias y cláusula penal, cualquiera que sea, este último podrá hacerlas efectivas sirviendo como recaudo ejecutivo el presente contrato.`
              };
            } else if (clausula.relativeId === 17) {
              return {
                ...clausula,
                texto: `Clausula décima séptima – Gestión de cobro: en caso de retardo en el pago del canon mensual ${arrendatarioTerm} reconocerá a ${arrendadorTerm} los gastos que por gestión de cobro se generen, sin que este pago signifique convalidación o consentimiento en la mora por parte de ${arrendadorTerm} y sin menoscabo de las acciones que interpongan o deba instaurar la misma.`
              };
            } else if (clausula.relativeId === 18) {
              return {
                ...clausula,
                texto: `Clausula décima octava – Gastos: son de cargo de ${arrendatarioTerm} los gastos que se causen con la formalización de este contrato.`
              };
            } else if (clausula.relativeId === 19) {
              return {
                ...clausula,
                texto: `Clausula décima novena – Suspensión de servicios: ${arrendatarioTerm} autorizan de manera irrevocable a ${arrendadorTerm} para que, si incurren en mora en pago de cualquiera de los servicios públicos, durante el término inicial o el de sus prórrogas, solicitar de inmediato la suspensión temporal o definitiva del servicio que esté en mora y no se le instalará hasta estar a paz y salvo con la empresa respectiva.`
              };
            } else if (clausula.relativeId === 21) {
              return {
                ...clausula,
                texto: `Clausula vigésima Primera – Coarrendatario: Para garantizar a ${arrendadorTerm} el cumplimiento de sus obligaciones consignadas en el presente contrato de arrendamiento, queda como coarrendatario ${coarrendataSTerm} ${coarrendatario.first_name} ${coarrendatario.last_name} residente en la ${coarrendatario.direccion} barrio ${coarrendatario.barrio}, mayor de edad y vecino de Villavicencio (Meta), identificado con cédula de ciudadanía Nro. ${formatoNumeroConSeparadores(coarrendatario.n_cedula)} expedida en ${coarrendatario.c_exp}, quien a la fecha se desempeña como ${coarrendatario.ocupacion}, y declara que se obliga solidariamente con ${arrendadorTerm} durante el término de duración del contrato y el de sus prórrogas y por el tiempo que permanezca el inmueble en responsabilidad de ${arrendatTerm} ${arrendatario.first_name} ${arrendatario.last_name}.`
              };
            } else if (clausula.relativeId === 22) {
              return {
                ...clausula,
                texto: `Clausula vigésima Segunda – Notificaciones: ${arrendadorTerm} recibirá notificaciones en la dirección: ${administrador.direccionCorrespondencia} barrio ${administrador.barrioCorrespondencia}, E-mail: ${administrador.email}, WhatsApp:  ${administrador.celular}, ${arrendatarioTerm} recibirá notificaciones en: la dirección: ${arrendatario.direccionCorrespondencia} barrio ${arrendatario.barrioCorrespondencia}, E-mail: ${arrendatario.email} o al WhatsApp: ${arrendatario.celular}, ${coarrendatarioTerm} recibirá notificaciones en la dirección: ${coarrendatario.direccionCorrespondencia} barrio ${coarrendatario.barrioCorrespondencia}, E-mail: ${coarrendatario.email} o al WhatsApp: ${formData.coarrendatario.celular}. Parágrafo: A partir de la fecha de suscripción de la presente autorización, ${administrador.first_name.toUpperCase()} ${administrador.last_name.toUpperCase()} queda ${arrendadorfTerm} para remitir vía correo electrónico a la dirección incluida en el presente documento, los actos administrativos proferidos por ${administrador.first_name.toUpperCase()} ${administrador.last_name.toUpperCase()} en el marco de la gestión y vigencia  del contrato de arrendamiento genéticos y sus compromiso derivados que deban ser objeto de notificación, así como de  las prórrogas de  contratos que se suscriban, y de los que se encuentren en vigencia.`
              };
            } else if (clausula.relativeId === 23) {
              return {
                ...clausula,
                texto: `Clausula vigésima tercera – Exclusión de responsabilidad por daños a terceros: ${arrendatarioTerm} se hará responsable de manera exclusiva por los daños y perjuicios que cause a terceros durante la vigencia de arrendamiento con ocasión del funcionamiento del establecimiento de comercio que resulte de su propiedad, sin que ${arrendadorTerm} y el propietario del inmueble deban responder solidariamente por reclamaciones e indemnizaciones por daños y perjuicios de tipo extracontractual.`
              };
            }

            return clausula;
          })
        });
      }
    }
  }, [formData.inmueble, inmuebleSeleccionado, formData.userAdministrador, formData.userArrendatario, inmuebles, administradores, arrendatarios, formData.diaHInicioPago, formData.diaFinPago, formData.fechaEntregaInmueble, formData.fechaRestitucionInmueble, formData.fecha]);




  const handleinmuebleChange = (id) => {
    //console.log('Inmueble seleccionado:', id);
    setFormData((prevData) => ({
      ...prevData,
      inmueble: { id },  // Update userArrendatario with an ID
    }));
  };

  useEffect(() => {
    if (formData.inmueble && inmuebles.length > 0) {
      const inmueble = inmuebles.find(i => i.id === parseInt(formData.inmueble.id));
      if (inmueble) {
        //console.log('Inmueble encontrado:', inmueble);
        setInmuebleSeleccionado(inmueble);
      } else {
        //console.log('Inmueble no encontrado');
      }
    }
  }, [formData.inmueble, inmuebles]);
  const handleCheckboxChange = (id) => {
    setClausulas((prevClausulas) =>
      prevClausulas.map((clausula) =>
        clausula.id === id ? { ...clausula, selected: !clausula.selected } : clausula
      )
    );
  };

  const addClausula = () => {
    setClausulas((prevClausulas) => {
      const newId = prevClausulas.length + 1;
      return [
        ...prevClausulas,
        {
          id: newId,
          texto: `Cláusula ${newId}: [Texto de la cláusula aquí]`, // Aquí se establece el texto con el número correspondiente
          selected: true,
        },
      ];
    });
  };


  const removeClausula = (id) => {
    setClausulas((prevClausulas) => prevClausulas.filter((clausula) => clausula.id !== id));
  };

  const handleClausulaChange = (id, texto) => {
    setClausulas((prevClausulas) =>
      prevClausulas.map((clausula) =>
        clausula.id === id ? { ...clausula, texto } : clausula
      )
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Obtener el archivo seleccionado
    if (file && file.type === "application/pdf") {
      // Guardar el archivo PDF en el estado
      setFormData((prevState) => ({
        ...prevState,
        inventario: file,
      }));
    } else {
      alert("Por favor, selecciona un archivo PDF.");
      // Limpiar el archivo en caso de que el usuario seleccione uno no válido
      setFormData((prevState) => ({
        ...prevState,
        inventario: null,
      }));
    }
  };

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      if (!token) {
        console.error('No se pudo obtener el token CSRF.');
        return;
      }
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);
  const handleActualizarContrato = async () => {
    const selectedClausulas = clausulas.filter(clausula => clausula.selected);

    const dataToSubmit = {
      userAdministrador: formData.userAdministrador?.id,
      userArrendatario: formData.userArrendatario?.id,
      coarrendatario: formData.coarrendatario?.id,
      tipoContrato: formData.tipoContrato,
      fechainicio: formData.fechainicio,
      fechafin: formData.fechafin,
      diaHInicioPago: formData.diaHInicioPago,
      diaFinPago: formData.diaFinPago,
      contrato_Activo: formData.contrato_Activo,
      inmueble: formData.inmueble?.id,
      ciudad: formData.ciudad,
      fecha: formData.fecha,
      clausulas: selectedClausulas.map(clausula => ({
        id: clausula.id,       // ID de la cláusula
        texto: clausula.texto, // Texto de la cláusula
      })),
    };
    console.log("lo enviado", dataToSubmit)
    // Validación básica
    if (!dataToSubmit.userAdministrador || !dataToSubmit.userArrendatario || !dataToSubmit.fechainicio || !dataToSubmit.fechafin) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    // Verificar los datos que se enviarán
    console.log('Datos enviados:', dataToSubmit);

    try {
      const response = await fetch(`${API_URL}/api/contratos/${id}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Retira esta línea si no usas CSRF
        },
        body: JSON.stringify(dataToSubmit),
        credentials: 'include', // Opcional si no usas cookies
      });

      const responseData = await response.json();
      if (response.ok) {
        alert('El contrato ha sido actualizado exitosamente.');
        const contratoId = responseData.id;
        uploadPDF(contratoId);
        navigate(`/imprimio-contrato/${responseData.id}`);
      } else {
        console.error('Error al actualizar el contrato:', responseData);
        alert(`Error: ${responseData.message || 'No se pudo actualizar el contrato.'}`);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('Ocurrió un error al conectar con el servidor.');
    }
  };
  const uploadPDF = async (contratoId) => {
    if (!formData.inventario) {
      alert("No se ha seleccionado un archivo PDF.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('inventario', formData.inventario);  // Archivo PDF
    formDataToSend.append('contratoId', contratoId);  // ID del contrato

    try {
      const response = await fetch(`${API_URL}/api/upload-pdf/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken, // Asegúrate de incluir el token CSRF si es necesario
        },
        body: formDataToSend,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        alert("PDF subido exitosamente");
      } else {
        console.error("Error al subir el PDF:", data);
        alert(`Error al subir el PDF: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al subir el PDF:", error);
    }
  };
  return (
    <div className="container"><Link to="/">Ir a Home</Link>
      <form>
        <h1>Editar Contrato de Vivienda</h1>

        <div>
          <label>Administrador:</label>
          <select
            name="userAdministrador"
            // Establecer el valor inicial
            onChange={(e) => handleUserAdminChange(e.target.value)}
          >
            <option value="">Selecciona un administrador</option>
            {administradores.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.first_name} {admin.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Arrendatario:</label>
          <select
            name="userArrendatario"
            // Establecer el valor inicial del arrendatario
            onChange={(e) => handleUserArrendatarioChange(e.target.value)}
          >
            <option value="">Selecciona un arrendatario</option>
            {arrendatarios.map((arrendatario) => (
              <option key={arrendatario.id} value={arrendatario.id}>
                {arrendatario.first_name} {arrendatario.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Coarrendatario:</label>
          <select
            name="coarrendatario"
            // Establecer el valor inicial del coarrendatario
            onChange={(e) => handlecoarrendatarioChange(e.target.value)}
            disabled={!formData.userArrendatario.id} // Deshabilitar si no hay arrendatario seleccionado
          >
            <option value="">Selecciona un coarrendatario</option>
            {coarrendatarios.map((coarrendatario) => (
              <option key={coarrendatario.id} value={coarrendatario.id}>
                {coarrendatario.first_name} {coarrendatario.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            name="fechainicio"
            // Establecer el valor de la fecha de inicio
            onChange={handleInputChange} // Manejador para actualizar el estado
          /> {primData.fechainicio}
        </div>

        <div>
          <label>Fecha de Fin:</label>
          <input type="date"
            name="fechafin"
            onChange={handleInputChange} /> {primData.fechafin}
        </div>
        <div>
          <label>Fecha de Entrega de inmueble:</label>
          <input type="date" name="fechaEntregaInmueble" onChange={handleInputChange} /> {primData.fechaEntregaInmueble}
        </div>

        <div>
          <label>Fecha de Restitucion inmueble:</label>
          <input type="date" name="fechaRestitucionInmueble" onChange={handleInputChange} /> {primData.fechaRestitucionInmueble}
        </div>

        <div>
          <label>Dia de Inicio de pago:</label>
          <input type="text" name="diaHInicioPago" onChange={handleInputChange} /> {primData.diaHInicioPago}
        </div>

        <div>
          <label>Dia Fin de pago:</label>
          <input type="text" name="diaFinPago" onChange={handleInputChange} /> {primData.diaFinPago}
        </div>
        <div>
          <label>Contrato activo:</label>
          <input type="checkbox" defaultChecked={true}  name="contrato_Activo" onChange={handleInputChange} />
        </div>

        <div>
          <label>Inmueble:</label>
          <select
            name="inmueble"
            // Establecer el valor inicial del inmueble
            onChange={(e) => handleinmuebleChange(e.target.value)} // Manejador para actualizar el estado
          >
            <option value="">Selecciona un inmueble</option>
            {inmuebles.map((inmueble) => (
              <option key={inmueble.id} value={inmueble.id}>
                {inmueble.direccion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Ciudad donde se firma el contrato:</label>
          <input type="text" name="ciudad" onChange={handleInputChange} /> {primData.ciudad}
        </div>

        <div>
          <label>Fecha de firma del contrato:</label>
          <input type="date" name="fecha" onChange={handleInputChange} /> {primData.fecha}
        </div>
        <div>
          <label>Subir inventario (PDF):</label>
          <input
            type="file"
            name="inventario"
            accept=".pdf"
            onChange={handleFileChange} // Esta función manejará el archivo seleccionado
          />
        </div>
        <div>
          <h2>Cláusulas</h2>

          {clausulas && clausulas.map((clausula) => (
            <div key={clausula.id}>
              <input
                type="checkbox"
                id={`clausula-${clausula.id}`}
                checked={clausula.selected || false} // Muestra si está seleccionada o no
                onChange={() => handleCheckboxChange(clausula.id)} // Cambiar el estado de "selected"
              />
              <textarea
                value={clausula.texto || ''} // Muestra el texto de la cláusula
                onChange={(e) => handleClausulaChange(clausula.id, e.target.value)} // Cambia el texto
                placeholder="Escribe la cláusula aquí"
                rows={6}
                style={{ width: '100%', height: 'auto', resize: 'none' }} // Ajuste del tamaño
              />
              <button type="button" onClick={() => removeClausula(clausula.id)}>Eliminar</button>
            </div>
          ))}
          <button type="button" onClick={addClausula}>Agregar Cláusula</button>
        </div>

        <button type="button" onClick={handleActualizarContrato}>Guardar Contrato</button>
      </form></div>
  );
};

export default EditarContratoComercial;
