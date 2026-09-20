import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../appprincipal/csrf';
import { Link, useNavigate } from 'react-router-dom';
      
const NuevoContratoLocalVivienda = () => {
const [formData, setFormData] = useState({
  userAdministrador: { id: null }, // Inicializar como objeto con id
  userArrendatario: { id: null }, // Inicializar como objeto con id
  coarrendatario: { id: null },
  fechainicio: '',
  fechafin: '',
  diaHInicioPago: '',
  diaFinPago: '',
  contrato_Activo: true,
  inmueble: { id: null }, // Inicializar como objeto con id
  ciudad: '',
  fecha: '',
});

  const navigate = useNavigate(); 

  const [administradores, setAdministradores] = useState([]);
  const [arrendatarios, setArrendatarios] = useState([]);
  const [coarrendatarios, setCoarrendatarios] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);

  // Definición de cláusulas con mensajes por defecto
  const [clausulas, setClausulas] = useState([
    {
      id: 1,
      texto: 'Cláusula 1: Objeto del contrato: mediante el presente contrato, el arrendador concede al arrendatario el goce del local con vivienda ubicado en la direccion.',
      selected: true,
    },
    {
      id: 2,
      texto: 'Cláusula 2: Destino del inmueble: se deben desarrollar las actividades contempladas en el Código de Clasificación Industrial Internacional Uniforme no 9512, «Mantenimiento y reparación de equipos de comunicación»... y para vivienda conformada por EL ARRENDATARIO',
      selected: true,
    },
    {
      id: 3,
      texto: 'Cláusula 3: Término del contrato: se estipula por el término de unos (3), meses, inicia el 24 de julio de dos mil veinticuatro  (2024) y finaliza el 03 de octubre  de dos mil veinticuatro (2024).',
      selected: true,
    },
    {
      id: 4,
      texto: 'Cláusula 4: Remuneración mensual o canon de arrendamiento: del (25) al  (29) de cada mes, EL ARRENDATARIA se obliga a pagar ALA ARRENDADORA la suma de cuatrocientos cincuenta  mil pesos mc ($450.000), mediante consignación bancaria a la cuentas habilitadas para Consignación: Cuenta Daviplata  3144568091 Y/o cuenta Nequi 3144568091 y Cuenta de ahorros Bancolombia N. 05725675161.',
      selected: true,
    },
    {
      id: 5,
      texto: 'Cláusula 5: Prorroga del contrato y aumento del canon: las partes aceptan la prórroga, y se conviene que el reajuste del canon mensual se hará anualmente con base al último informe anual de Índice de Precios al Consumidor (IPC).',
      selected: true,
    },
    {
      id: 6,
      texto: 'Cláusula 6: Clausula penal: El incumplimiento ó el cumplimiento tardío de cualquiera de las obligaciones que contrae el arrendatario en este contrato lo obliga, al pago de una suma equivalente a tres (2) canon de arrendamiento vigente al momento del incumplimiento  ó del cumplimiento tardío, a título de pena, exigible sin necesidad de los requerimientos previos ni constitución en mora de que tratan los artículos 1594 y 1595 del Código Civil ó  cualquier otra disposición que así lo contemple, sin que su cobro implique la extinción de la  obligación principal ó de cualquiera de las obligaciones, derivadas del contrato y sin perjuicio del cobro de las demás indemnizaciones que ese incumplimiento ó cumplimiento tardío causen.',
      selected: true,
    },
    {
      id: 7,
      texto: 'Cláusula 7: Inspección: el arrendatario permite las visitas que el arrendador ó sus representantes tengan a bien realizar para constatar el estado y conservación del inmueble y otras circunstancias que sean de su interés.',
      selected: true,
    },
    {
      id: 8,
      texto: 'Cláusula 8: Recibo y entrega: el arrendatario declara que ha recibido el inmueble objeto del presente contrato en buen estado, de conformidad con el inventario denominado “Anexo fotográfico” que se firma por las partes en pliego separado y que para todos los efectos legales forma parte de este contrato y se obligan a conservarlo y restituirle en las mismas condiciones a más tardar dentro de los 15 días calendario contados a partir de la terminación del presente contrato, especialmente en lo referente a la pintura del inmueble. Además, el arrendatario declara que ha recibido el inmueble con todas las instalaciones eléctricas, y estructurales en perfecto estado de funcionamiento y así deberá entregarlas a la terminación del contrato.',
      selected: true,
    },
    {
      id: 9,
      texto: 'Cláusula 9: Reparaciones y mejoras: las reparaciones, variaciones y reformas de cualquier clase que haga el arrendatario son por cuenta de éste y para efectuarlas se requiere previa autorización escrita de la arrendadora. Parágrafo. la arrendadora no queda obligada a pagar tales mejoras ó reformas ni a indemnizar en forma alguna a la arrendataria aún en los casos en que aquellas hayan autorizado expresamente.',
      selected: true,
    },
    {
      id: 10,
      texto: 'Cláusula 10: Servicios públicos: los servicios de energía eléctrica,  y demás que tenga o llegue a tener el inmueble objeto de este contrato durante su vigencia, serán por cuenta y pagados directamente por el arrendatario. sin que la arrendadora tenga responsabilidad alguna por la correcta ó deficiente prestación de tales servicios.',
      selected: true,
    },
    {
      id: 11,
      texto: 'Cláusula 11: Subarriendo y cesión: el arrendataria no puede subarrendar el inmueble ni ceder el contrato sin autorización previa y escrita de la arrendadora, al igual que, la arrendataria acepta la cesión del contrato que haga la arrendadora bastando para esto la información previa verbal o escrita.',
      selected: true,
    },
    {
      id: 12,
      texto: 'Cláusula 12: Depósito: No se podrá depositar, guardar ó almacenar en el inmueble arrendado materiales inflamables, sustancias explosivas ó tóxicas, elementos destinados para uso ilícito.',
      selected: true,
    },
    {
      id: 13,
      texto: 'Cláusula 13: Otras causales de terminación del contrato: la arrendadora además podrá dar por terminado el presente contrato por los siguientes motivos: a) la cesión del contrato ó del goce del inmueble y subarriendo total ó parcial del inmueble arrendado sin autorización expresa y escrita del arrendador; b) cambio de destinación del inmueble por parte de la arrendataria; c) el no pago del precio y los reajustes dentro del término previsto en este contrato; d) la destinación del inmueble para fines ilícitos ó  que presente peligro para el inmueble ó salubridad de sus habitantes; e) la realización de mejoras, cambios, ampliaciones del inmueble sin autorización expresa y escrita de la arrendadora y/ó la destrucción total y parcial del inmueble; f) la no cancelación de los servicios públicos a cargo de la arrendataria siempre que se origine la desconexión ó pérdida del servicio; g) cuando el propietario ó poseedor necesite el inmueble para ocuparlo ó cuando el inmueble haya de demolerse para efectuar una nueva construcción ó cuando se requiere desocupado con el fin de ejecutar obras indispensables para su reparación; h) cuando el inmueble haya de entregarse en cumplimiento de las obligaciones originadas en un contrato de compraventa; i) las demás previstas por la ley.',
      selected: true,
    },
    {
      id: 14,
      texto: 'Cláusula 14: Exención de responsabilidad: LA ARRENDADORA no asume responsabilidad alguna por los daños ó perjuicios que EL ARRENDATARIO pueda sufrir por caso fortuito, fuerza mayor ó causas atribuibles a terceros.',
      selected: true,
    },
    {
      id: 15,
      texto: 'Cláusula 15: Autorizaciones: LA arrendataria y deudores solidarios autorizan de manera irrevocable al arrendador ó a quien represente sus derechos u ostente en el futuro la calidad de acreedor, a consultar, solicitar, suministrar, reportar, procesar y divulgar toda la información que se refiera al comportamiento crediticio, personales ó económicos para que en el evento que se constituya mora en el pago de cualquier servicio público, arrendamiento en ó cualquier otro concepto que sea a su cargo, durante el término inicial ó el de sus prorrogas ó a la terminación del contrato, se incorporen sus nombres, apellidos y documento de identificación a los archivos de deudores morosos ó con referencias negativas que se lleve ó cualquier banco de datos comerciales,  personales ó económicos. el arrendatario conoce que el alcance de esta autorización implica que el comportamiento frente a sus obligaciones será registrado con el objeto de suministrar información suficiente y adecuada al mercado sobre el estado de sus obligaciones financieras, comerciales, crediticias, de servicios etc. en consecuencia, quienes se encuentren afiliados y/ó tengan acceso a las centrales de información y entidades aquí relacionadas ó cualquier otra entidad encargada del manejo de datos comerciales, personales ó económicos, podrán conocer esta información de conformidad con la legislación y jurisprudencia aplicable. la información podrá ser igualmente utilizada para efectos estadísticos. los derechos y obligaciones del arrendatario, así como la permanencia de su información en las bases de datos corresponden a lo determinado por el ordenamiento jurídico aplicable del cual, por ser de carácter público, manifiesta que está enterado. así mismo, manifiesta LA arrendataria que conoce el contenido del reglamento de las citadas entidades. en caso de que, en el futuro, La arrendadora, efectúe, a favor de un tercero, una venta de cartera ó una cesión a cualquier título de las obligaciones a cargo del arrendatario, los efectos de la anterior autorización se extenderán a este en los mismos términos y condiciones. así mismo, autoriza a las entidades encargadas del manejo de la información a que, en su calidad de operadores, pongan la información a disposición de otros operadores nacionales ó extranjeros, en los términos que establece la ley, siempre y cuando su objeto sea similar al aquí establecido. los deudores solidarios: autorizamos a la arrendadora ó a quien represente sus derechos u ostente en el futuro la calidad de acreedor, para que, en los mismos términos señalados en esta cláusula, consulten, suministren, reporten, procesen y divulguen toda nuestra información, que se refiera al comportamiento crediticio, financiero, comercial, de servicios etc.',
      selected: true,
    },
    {
      id: 16,
      texto: 'Cláusula 16: Mérito ejecutivo: la arrendataria y los deudores solidarios acepta como suficiente título ejecutivo el presente contrato de arrendamiento de manera que, si quedare a deber al arrendador suma alguna por concepto de cánones de arrendamientos, pago e instalación de servicios públicos, sumas indemnizatorias y cláusula penal, cualquiera que sea, este último podrá hacerlas efectivas sirviendo como recaudo ejecutivo el presente contrato.',
      selected: true,
    },
    {
      id: 17,
      texto: 'Cláusula 17: Gestión de cobro: en caso de retardo en el pago del canon mensual el arrendatario reconocerá a la arrendadora los gastos que por gestión de cobro se generen, sin que este pago signifique convalidación ó consentimiento en la mora por parte de la arrendadora y sin menoscabo de las acciones que interpongan ó deba instaurar la misma.',
      selected: true,
    },
    {
      id: 18,
      texto: 'Cláusula 18: Gastos: son de cargo de la arrendataria los gastos que se causen con la formalización de este contrato.',
      selected: true,
    },
    {
      id: 19,
      texto: 'Cláusula 19: Suspensión de servicios: los arrendatarios autorizan de manera irrevocable al arrendador para que, si incurren en mora en pago de cualquiera de los servicios públicos, durante el término inicial ó el de sus prórrogas, solicitar de inmediato la suspensión temporal ó definitiva del servicio que esté en mora y no se le instalará hasta estar a paz y salvo con la empresa respectiva.',
      selected: true,
    },
    {
      id: 20,
      texto: 'Cláusula 20: Actividad comercial: Al destinarse el inmueble arrendado a actividad comercial, se aplicarán las disposiciones del código de comercio y a lo no dispuesto en este se le aplicarán las reglas del código civil.',
      selected: true,
    },
    {
      id: 21,
      texto: 'Cláusula 21: Deudores solidarios: La suscrita LUISA FERNANDA SANCHEZ VELEZ, identificada con cedula de ciudadanía no. 1.121.923.315 de Villavicencio, con domicilio en la ciudad de  Villavicencio, por medio del presente documento me declaro deudora de el arrendador en forma solidaria indivisible junto con el arrendatario, de todas las cargas y obligaciones contenidas en el presente contrato, durante el término inicial como durante sus prórrogas ó renovaciones expresas ó tácitas, por concepto de: arrendamientos, servicios públicos, indemnizaciones, daños en el inmueble, cláusulas penales,  gestión de cobro, costas procesales y cualquier otra derivada del contrato.',
      selected: true,
    },
    {
      id: 22,
      texto: 'Cláusula 22: Notificaciones: la arrendadora recibirá notificaciones en la Carrera 19A 5A-61 LOCAL 1 Barrio Ariguani.',
      selected: true,
    },
    {
      id: 23,
      texto: 'Cláusula 23: Exclusión de responsabilidad por daños a terceros: el arrendatario se hará responsable de manera exclusiva por los daños y perjuicios que cause a  terceros durante la vigencia de arrendamiento  con  ocasión  del funcionamiento  del establecimiento de comercio que resulte de su propiedad, sin que la arrendadora y el propietario del inmueble deban responder solidariamente por reclamaciones e indemnizaciones por daños y perjuicios de tipo extracontractual.',
      selected: true,
    },
    
  ]);


  useEffect(() => {
    // Cargar administradores
    fetch(`${import.meta.env.VITE_BASE_URL}/api/usuarios_por_grupo/administrador/`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Datos de ADMINISTRADORES:', data);
        setAdministradores(data);
    }) 
      .catch((error) => console.error('Error al cargar administradores:', error));

    // Cargar arrendatarios
    fetch(`${import.meta.env.VITE_BASE_URL}/api/usuarios_por_grupo/arrendatario/`)
      .then((response) => response.json())
      .then((data) => {
          console.log('Datos de arrendatarios:', data); // Agrega esto
          setArrendatarios(data);
      })
      .catch((error) => console.error('Error al cargar arrendatarios:', error));

      // Cargar inmuebles
    fetch(`${import.meta.env.VITE_BASE_URL}/api/inmuebles/`)
      .then((response) => response.json())
      .then((data) => {
        //console.log('Datos de inmueble:', data);
        setInmuebles(data)})
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
  fetch(`${import.meta.env.VITE_BASE_URL}/api/coarrendatario/?arrendatario_id=${id}`)
      .then((response) => response.json())
      .then((data) => {
          console.log('Coarrendatarios relacionados:', data);
          setCoarrendatarios(data);
      })
      .catch((error) => console.error('Error al cargar coarrendatarios relacionados:', error));
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
              c_vive: selectedCoarrendatario.c_vive
          }
      }));
  }
};

useEffect(() => {
  if (formData.inmueble && formData.userAdministrador && formData.userArrendatario) {
    const inmueble = inmuebles.find(i => i.id === Number(formData.inmueble.id));

    // Buscar el administrador por ID
    const administrador = administradores.find(a => a.id === Number(formData.userAdministrador.id));

    // Buscar el arrendatario por ID (si tienes una lista similar de arrendatarios)
    const arrendatario = arrendatarios.find(a => a.id === Number(formData.userArrendatario.id));

    if (inmueble && administrador && arrendatario) {
      // Determinamos el término correcto para "arrendador" y "arrendatario"
      const arrendadorTerm = administrador.genero === 'F' ? 'la arrendadora' : 'el arrendador';
      const arrendatarioTerm = arrendatario.genero === 'F' ? 'la arrendataria' : 'el arrendatario';

      setClausulas(prevClausulas =>
        prevClausulas.map(clausula => {
          if (clausula.id === 1) {
            return {
              ...clausula,
              texto: `Cláusula 1: Objeto del contrato: mediante el presente contrato, ${arrendadorTerm} concede a ${arrendatarioTerm} el goce del local con vivienda ubicado en ${inmueble.direccion}.`
            };
          } else if (clausula.id === 2) {
            return {
              ...clausula,
              texto: `Cláusula 2: Destino del inmueble: se deben desarrollar las actividades contempladas en el Código de Clasificación Industrial Internacional Uniforme no 9512, «Mantenimiento y reparación de equipos de comunicación»... y para vivienda conformada por ${arrendatarioTerm.toUpperCase()}.`
            };
          }
          return clausula;
        })
      );
    }
  }
}, [formData.inmueble, formData.userAdministrador, formData.userArrendatario, inmuebles, administradores, arrendatarios]);

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

useEffect(() => {
  if (formData.fechainicio && formData.fechafin) {
      const fechainicioEnPalabras = formatearFechaEnPalabras(formData.fechainicio);
      const fechafinEnPalabras = formatearFechaEnPalabras(formData.fechafin);

      // Actualiza la cláusula 3 con las fechas formateadas en palabras
      setClausulas(prevClausulas =>
          prevClausulas.map(clausula => {
              if (clausula.id === 3) {  // Asegúrate de que el ID de la cláusula sea el correcto
                  return {
                      ...clausula,
                      texto: `Cláusula 3: Término del contrato: se estipula por el término de unos (3) meses, inicia el ${fechainicioEnPalabras} y finaliza el ${fechafinEnPalabras}.`
                  };
              }
              return clausula;
          })
      );
  }
}, [formData.fechainicio, formData.fechafin]);

useEffect(() => {
  if (formData.diaHInicioPago && formData.diaFinPago && formData.inmueble && inmuebleSeleccionado && administradores && formData.userArrendatario) {
    
    // Buscar el arrendatario por ID
    const arrendatario = arrendatarios.find(a => a.id === Number(formData.userArrendatario.id));
    
    // Buscar el administrador por ID
    const administrador = administradores.find(a => a.id === Number(formData.userAdministrador.id));

    if (arrendatario && administrador) {
      // Determinar el género en mayúsculas para la cláusula 4
      const arrendatarioTerm = arrendatario.genero === 'F' ? 'LA ARRENDATARIA' : 'EL ARRENDATARIO'; // En mayúsculas
      const arrendadorTerm = administrador.genero === 'F' ? 'LA ARRENDADORA' : 'EL ARRENDADOR'; // En mayúsculas
      const lowarrendatarioTerm = arrendatario.genero === 'F' ? 'la arrendataria' : 'el arrendatario'; // En minusculas
      const lowarrendadorTerm = administrador.genero === 'F' ? 'la arrendadora' : 'el arrendador'; // En minusculas
      setClausulas(prevClausulas =>
        prevClausulas.map(clausula => {
          if (clausula.id === 4) {
            return {
              ...clausula,
              texto: `Cláusula 4: Remuneración mensual o canon de arrendamiento: del (${formData.diaHInicioPago}) al (${formData.diaFinPago}) de cada mes, ${arrendatarioTerm} se obliga a pagar a ${arrendadorTerm} la suma de ${inmuebleSeleccionado.canonmensual} pesos mc ($${inmuebleSeleccionado.canonmensual}), mediante consignación bancaria a las cuentas habilitadas para Consignación: Cuenta Daviplata N. ${administrador.cuentaDaviplata} y/o cuenta Nequi N. ${administrador.cuentaNequi} y Cuenta de ahorros Bancolombia N. ${administrador.CuentaBancolombia}`,
            };
          }else if (clausula.id === 14) {
            return {
              ...clausula,
              texto: `Cláusula 14: Exención de responsabilidad: ${arrendadorTerm} no asume responsabilidad alguna por los daños o perjuicios que ${arrendatarioTerm} pueda sufrir por caso fortuito, fuerza mayor o causas atribuibles a terceros.`,
            };
          }else if (clausula.id === 22) {
            // Agregar lógica para actualizar la cláusula 22
            return {
              ...clausula,
              texto: `Cláusula 22: Notificaciones: la arrendadora recibirá notificaciones en la ${administrador.direccion} Barrio ${administrador.barrio}.`,
            };
          }else if (clausula.id === 23) {
            // Agregar lógica para actualizar la cláusula 22
            return {
              ...clausula,
              texto: `Cláusula 23: Exclusión de responsabilidad por daños a terceros: ${lowarrendatarioTerm}  se hará responsable de manera exclusiva por los daños y perjuicios que cause a  terceros durante la vigencia de arrendamiento  con  ocasión  del funcionamiento  del establecimiento de comercio que resulte de su propiedad, sin que ${lowarrendadorTerm} y el propietario del inmueble deban responder solidariamente por reclamaciones e indemnizaciones por daños y perjuicios de tipo extracontractual.`,
            };
          }
          return clausula;
        })
      );
    }
  }
}, [formData.diaHInicioPago, formData.diaFinPago, formData.inmueble, inmuebleSeleccionado, administradores, formData.userArrendatario]);


useEffect(() => {
  if (formData.coarrendatario && formData.coarrendatario.id) {
      const coarrendatario = {
          first_name: formData.coarrendatario.first_name,
          last_name: formData.coarrendatario.last_name,
          n_cedula: formData.coarrendatario.n_cedula,
          c_exp: formData.coarrendatario.c_exp,
          c_vive: formData.coarrendatario.c_vive,
          genero: formData.coarrendatario.genero, // Asumiendo que también tienes el género aquí
      };

      // Determina el término correcto para "suscrito"
      const coarrendatarioTerm = coarrendatario.genero === 'F' ? 'La suscrita' : 'El suscrito'; // Cambia según el género
      const deudorTerm = coarrendatario.genero === 'F' ? 'deudora' : 'deudor'; 
      const identifiTerm = coarrendatario.genero === 'F' ? 'identificada' : 'identificado'; 

      // Actualiza la cláusula con los datos del coarrendatario
      setClausulas(prevClausulas => 
          prevClausulas.map(clausula => {
              if (clausula.id === 21) {
                  return {
                      ...clausula,
                      texto: `Cláusula 21: Deudores solidarios: ${coarrendatarioTerm} ${coarrendatario.first_name} ${coarrendatario.last_name}, ${identifiTerm}  con cédula de ciudadanía no. ${coarrendatario.n_cedula} de ${coarrendatario.c_exp}, con domicilio en la ciudad de ${coarrendatario.c_vive}, por medio del presente documento me declaro ${deudorTerm} del arrendador en forma solidaria e indivisible junto con el arrendatario, de todas las cargas y obligaciones contenidas en el presente contrato, durante el término inicial como durante sus prórrogas o renovaciones expresas o tácitas, por concepto de: arrendamientos, servicios públicos, indemnizaciones, daños en el inmueble, cláusulas penales, gestión de cobro, costas procesales y cualquier otra derivada del contrato.`,
                  };
              }
              return clausula;
          })
      );
  }
}, [formData.coarrendatario]);

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


  useEffect(() => {
    const fetchCsrfToken = async () => {
        const token = await getCsrfToken();
        setCsrfToken(token);
    };
    fetchCsrfToken();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  const selectedClausulas = clausulas.filter(clausula => clausula.selected);
  // Campos requeridos para validar
  const requiredFields = {
    userAdministrador: formData.userAdministrador.id,
    userArrendatario: formData.userArrendatario.id,
    coarrendatario: formData.coarrendatario.id,
    fechainicio: formData.fechainicio,
    fechafin: formData.fechafin,
    diaHInicioPago: formData.diaHInicioPago,
    diaFinPago: formData.diaFinPago,
    inmueble: formData.inmueble.id,
    ciudad: formData.ciudad,
    fecha: formData.fecha,
    clausulas: selectedClausulas.length, // Asegura que haya al menos una cláusula seleccionada
  };

  // Verificar si hay algún campo vacío
  const emptyFields = Object.entries(requiredFields).filter(([key, value]) => !value);

  if (emptyFields.length > 0) {
    const fieldNames = emptyFields.map(([key]) => key).join(', ');
    alert(`Por favor, complete los siguientes campos: ${fieldNames}`);
    return; // Detener el envío del formulario
  }
  const dataToSubmit = {
    userAdministrador: formData.userAdministrador.id, // Envía solo el ID del administrador
    userArrendatario: formData.userArrendatario.id, // Envía solo el ID del arrendatario
    coarrendatario: formData.coarrendatario.id, // Envía solo el ID del coarrendatario
    fechainicio: formData.fechainicio,
    fechafin: formData.fechafin,
    diaHInicioPago: formData.diaHInicioPago,
    diaFinPago: formData.diaFinPago,
    contrato_Activo: formData.contrato_Activo,
    inmueble: formData.inmueble.id, // Envía solo el ID del inmueble
    ciudad: formData.ciudad,
    fecha: formData.fecha,
    clausulas: selectedClausulas.map(clausula => ({ texto: clausula.texto })), // Solo los textos de las cláusulas
};

    console.log('enviado nuevo', dataToSubmit); // Para depuración

  try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Contrato_Local_viviendaViewSet/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken, // Asegúrate de incluir el token CSRF
          },
          body: JSON.stringify(dataToSubmit), // Enviamos dataToSubmit aquí
          credentials: 'include',
      });

      const data = await response.json();
      
      //console.log('Response:', response);
      //console.log('Data:', data);
      
      if (response.ok) {
          alert('Contrato guardado exitosamente');
          // Redirige a la vista de impresión, pasando el ID del contrato
          console.log('Data:', data);
          navigate(`/imprimir-contrato/${data.id}`);
          // Redirigir o realizar otra acción después de guardar
      } else {
          console.error('Error details:', data); // Imprime detalles del error
          alert(`Error: ${data.error}`);
      }
  } catch (error) {
      console.error('Error:', error);
  }
};

  return (
    <div className="container"><Link to="/">Ir a Home</Link>
    <form onSubmit={handleSubmit}>
      <h1>Crear Contrato</h1>

      <div>
        <label>Administrador:</label>
        <select name="userAdministrador" onChange={(e) => handleUserAdminChange(e.target.value)}>
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
        <select name="userArrendatario" onChange={(e) => handleUserArrendatarioChange(e.target.value)}>
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
        <select name="coarrendatario" onChange={(e) => handlecoarrendatarioChange(e.target.value)} disabled={!formData.userArrendatario.id}>
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
        <input type="date" name="fechainicio" onChange={handleInputChange} />
      </div>

      <div>
        <label>Fecha de Fin:</label>
        <input type="date" name="fechafin" onChange={handleInputChange} />
      </div>

      <div>
        <label>Dia de Inicio de pago:</label>
        <input type="text" name="diaHInicioPago" onChange={handleInputChange} />
      </div>

      <div>
        <label>Dia Fin de pago:</label>
        <input type="text" name="diaFinPago" onChange={handleInputChange} />
      </div>
      <div>
        <label>Contrato activo:</label>
        <input type="checkbox"  name="contrato_Activo"  checked={formData.contrato_Activo} onChange={handleInputChange} />
      </div>

      <div>
        <label>Inmueble:</label>
        <select name="inmueble" onChange={(e) => handleinmuebleChange(e.target.value)}>
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
        <input type="text" name="ciudad" onChange={handleInputChange} />
      </div>

      <div>
        <label>Fecha de firma del contrato:</label>
        <input type="date" name="fecha" onChange={handleInputChange} />
      </div>

      <div>
  <h2>Cláusulas</h2>
  {clausulas.map((clausula) => (
    <div key={clausula.id}>
      <input
        type="checkbox"
        id={`clausula-${clausula.id}`} // Corrección en la interpolación de la cadena
        checked={clausula.selected}
        onChange={() => handleCheckboxChange(clausula.id)}
      />
      <textarea
        value={clausula.texto}
        onChange={(e) => {
          handleClausulaChange(clausula.id, e.target.value);
          adjustTextareaHeight(e.target); // Ajustar altura al cambiar
        }}
        placeholder="Escribe la cláusula aquí"
        rows={6}
        style={{ width: '100%', height: 'auto', resize: 'none' }} // Cambia a 'none' si no quieres redimensionar
      />
      <button type="button" onClick={() => removeClausula(clausula.id)}>Eliminar</button>
    </div>
  ))}
  <button type="button" onClick={addClausula}>Agregar Cláusula</button>
</div>

      <button type="submit">Guardar Contrato</button>
    </form></div>
  );
};

export default NuevoContratoLocalVivienda;
