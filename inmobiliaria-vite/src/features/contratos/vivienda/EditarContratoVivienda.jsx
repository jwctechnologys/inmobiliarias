import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../../utils/csrf';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../../config';

const EditarContratoVivienda = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [primData, setPrimData] = useState([])
  const [formData, setFormData] = useState({

    userAdministradorf: '', // Inicializar como objeto con id
    userAdministradorl: '', // Inicializar como objeto con id
    userArrendatario: '', // Inicializar como objeto con id
    coarrendatario: '',
    dependientes: '',
    tipoContrato: 'vivienda',
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
          fechafinOtrosi: data.fechafinOtrosi,
          fechaEntregaInmueble: data.fechaEntregaInmueble,
          fechaRestitucionInmueble: data.fechaRestitucionInmueble,
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
  console.log('prim', primData)
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
        console.log('ups', data);
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
        first_name: formData.coarrendatario.first_name || 'nn',
        last_name: formData.coarrendatario.last_name || 'nn',
        n_cedula: formData.coarrendatario.n_cedula || '123',
        c_exp: formData.coarrendatario.c_exp,
        c_vive: formData.coarrendatario.c_vive,
        celular: formData.coarrendatario.celular,
        genero: formData.coarrendatario.genero,
        direccion: formData.coarrendatario.direccion,
        barrio: formData.coarrendatario.barrio,
        ciudad: formData.coarrendatario.ciudad,
        dirCorrespondencia: formData.coarrendatario.direccionCorrespondencia,
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
      const dependienteTerm = dependiente
      // Buscar el arrendatario por ID (si tienes una lista similar de arrendatarios)
      const arrendatario = arrendatarios.find(a => a.id === Number(formData.userArrendatario.id));
      const fechaEntregaEnPalabras = formatearFechaEnPalabras(formData.fechaEntregaInmueble);
      const fechaRestitucionEnPalabras = formatearFechaEnPalabras(formData.fechaRestitucionInmueble);
      const canonEnPalabras = convertirNumeroAPalabras(inmuebleSeleccionado.canonmensual);
      const numeroPuntos = formatoNumeroConSeparadores(inmuebleSeleccionado.canonmensual);
      console.log('miraras', formData)
      if (inmueble && administrador && arrendatario) {
        // Determinamos el término correcto para "arrendador" y "arrendatario"
        const arrendadorTerm = administrador.genero === 'F' ? 'LA ARRENDADORA' : 'EL ARRENDADOR';
        const arrendadTerm = administrador.genero === 'F' ? 'obligada' : 'obligado';
        const arrendatarioTerm = arrendatario.genero === 'F' ? 'LA ARRENDATARIA' : 'EL ARRENDATARIO';
        const arrendatTerm = arrendatario.genero === 'F' ? 'ella' : 'él';
        const arrendadorfTerm = administrador.genero === 'F' ? 'facultada' : 'facultado';
        const tipoInmuebleTerm = inmuebleSeleccionado.tipoInmueble === 'apartamento' ? 'el' : 'la';
        setClausulas(prevClausulas => {
          const normalizedClausulas = normalizeClausulasIds(prevClausulas);
          return normalizedClausulas.map(clausula => {
            if (clausula.relativeId === 1) {
              return {
                ...clausula,
                texto: `PRIMERA: Pago, oportunidad y lugar: – a) pago: ${arrendatarioTerm} se obliga a pagar el canon acordado por valor de ${canonEnPalabras} pesos M/cte. ($${numeroPuntos}) en dinero en efectivo b). Oportunidad: dentro de los plazos previstos que son del día ${formData.diaHInicioPago} al ${formData.diaFinPago} de cada mes. c) Lugar: ${arrendadorTerm} estará ${arrendadorfTerm} para recibir el dinero en la ${inmuebleSeleccionado.direccion} barrio ${inmuebleSeleccionado.barrio}. `
              };
            } else if (clausula.relativeId === 2) {
              return {
                ...clausula,
                texto: `SEGUNDA: Sitio: – ${inmuebleSeleccionado.descripcion} ${tipoInmuebleTerm} cual se encuentra ubicado en la ${inmuebleSeleccionado.direccion} barrio ${inmuebleSeleccionado.barrio} y cuenta con Servicios Públicos de: Acueducto, Alcantarillado, Gas, Bioagricola y Luz, cuyo pago en la vigencia del presente contrato y/o de sus prorrogas será responsabilidad de ${arrendatario.first_name.toUpperCase()} ${arrendatario.last_name.toUpperCase()} igualmente quedan a su disposición los  elementos  que figuran en el inventario separado, fotografiado y firmado por las partes. El valor del canon de arrendamiento será reajustado anualmente de acuerdo con lo dispuesto en la Ley 820 de 2003 y demás normas complementarias y reglamentarias que le sean aplicables. El reajuste se realizará al cumplirse cada período anual de vigencia del contrato y será equivalente al 100% del incremento porcentual del Índice de Precios al Consumidor (IPC) del año inmediatamente anterior, conforme lo certifique el Departamento Administrativo Nacional de Estadística (DANE). En caso de que las disposiciones legales aplicables establezcan un mecanismo de reajuste diferente o un porcentaje máximo permitido, se aplicará el reajuste conforme a dichos términos.`
              };
            } else if (clausula.relativeId === 3) {
              return {
                ...clausula,
                texto: `TERCERA: Clausula de Penalidad por Retraso en el Pago del Arriendo: – ${arrendatarioTerm} se compromete a realizar el pago del canon de arrendamiento en la fecha pactada, la cual será del ${formData.diaHInicioPago} al ${formData.diaFinPago} de cada mes. En caso de que ${arrendatarioTerm} no cumpla con dicho pago en la fecha establecida, deberá pagar una penalización fija de Dos Mil Pesos M/cte. ($ 2.000), por cada día de retraso, hasta la fecha efectiva del pago. Esta penalización es independiente y adicional a cualquier interés de mora que pueda generarse conforme a lo dispuesto por la legislación vigente, y no se considerará un interés financiero, sino una compensación por los inconvenientes generados por el incumplimiento en el pago oportuno. La mora por falta de pago de la renta mensual en la oportunidad y forma acordada facultará a ${arrendadorTerm} para inmediatamente hacer cesar el arriendo y exigir judicial o extrajudicialmente la restitución del bien.`
              };
            } else if (clausula.relativeId === 4) {
              return {
                ...clausula,
                texto: `CUARTA: Destinación: – ${arrendatarioTerm} se obliga a usar exclusivamente el inmueble para vivienda de ${arrendatTerm} ${dependienteTerm.descripcion}. ${arrendatarioTerm} no podrá darle otro uso, ni ceder o transferir el arrendamiento sin la autorización escrita de ${arrendadorTerm}. El incumplimiento de esta cláusula dará derecho a ${arrendadorTerm} para dar por terminado el contrato y exigir la entrega del inmueble o, en caso de cesión o subarriendo, celebrar un nuevo contrato con los usuarios reales, sin necesidad de requerimientos judiciales o privados, a los cuales renuncia ${arrendatarioTerm}. PARÁGRAFO PRIMERO – Prohibiciones: ${arrendatarioTerm} tienen prohibida la destinación del inmueble a los fines contemplados en el literal b) del parágrafo del Articulo 34 de la ley 30 de 1986 y en consecuencia ${arrendatarioTerm} se obliga a no usar, el inmueble para ocultamiento de personas, depósito de armas o explosivos, y dinero de grupos terroristas. No destinarán el inmueble para la elaboración, almacenamiento o venta de sustancias alucinógenas tales como marihuana, hachís, cocaína y similares, ${arrendatarioTerm} se abstendrán de guardar o permitir dentro del inmueble animales no domésticos y/o elementos inflamables, tóxicos, insalubres, explosivos o dañosos para la conservación, higiene, seguridad y estética del inmueble y en general de sus ocupantes permanentes o transitorios ${arrendatarioTerm} tiene prohibido el uso del inmueble con fines de explotación sexual, la pornografía, el turismo sexual y demás formas de abuso sexual con menores y mayores de edad.`
              };
            } else if (clausula.relativeId === 5) {
              return {
                ...clausula,
                texto: `QUINTA: Recibo y estado: – ${arrendatarioTerm} declara que han recibido el inmueble objeto de este contrato en buen estado, conforme al inventario que se adjunta, el cual hace parte de este contrato; en el mismo se determinan los servicios, cosas y usos conexos y adicionales. ${arrendatarioTerm}, a la terminación del contrato, deberán devolver a ${arrendadorTerm} el inmueble en el mismo estado, salvo el deterioro proveniente del tiempo y uso legítimo.`
              };
            } else if (clausula.relativeId === 6) {
              return {
                ...clausula,
                texto: `SEXTA: Mejoras: – ${arrendatarioTerm} tendrá a su cargo las reparaciones locativas a que se refiere la ley (C.C. arts. 2028, 2029 y 2030) y no podrá realizar otras sin el consentimiento escrito de ${arrendadorTerm}.`
              };
            } else if (clausula.relativeId === 7) {
              return {
                ...clausula,
                texto: `SEPTIMA: Obligaciones de las partes: – Son obligaciones de las partes las siguientes: a) De ${arrendadorTerm}: - 1. Entregar a ${arrendatarioTerm} en la fecha convenida el inmueble dado en arrendamiento en buen estado de servicio, seguridad y sanidad y poner a su disposición los servicios, cosas o usos conexos y los adicionales aquí convenidos. - 2. Mantener en el inmueble los servicios, las cosas y los usos conexos y adicionales en buen estado de servir para el fin convenido en el contrato. - 3. Las demás obligaciones consagradas para los arrendadores en el capítulo II, Título XXVI, Libro 4 del Código Civil (ley 820 de 2003, art. 8, núm. 5). b) De ${arrendatarioTerm}: - 1. Pagar a ${arrendadorTerm} en el lugar convenido en la cláusula primera del presente contrato, el precio del arrendamiento. En el evento que ${arrendadorTerm} rehúse recibir en las condiciones y lugar aquí acordado, ${arrendatarioTerm} podrá efectuarlo mediante consignación a favor de ${arrendadorTerm} en las instituciones autorizadas por el Gobierno Nacional para tal efecto de acuerdo con el procedimiento legal vigente. - 2. Cuidar el inmueble y las cosas recibidas en arrendamiento. En caso de daños o deterioros distintos derivados del uso normal o de la acción del tiempo y que fueren imputables al mal uso del inmueble o su propia culpa, efectuar oportunamente y por su cuenta las reparaciones. - 3. Cumplir las normas de convivencia y las demás disposiciones que dicte el Gobierno Nacional dirigidas a la protección de los derechos de todos los vecinos. - 4. Las demás obligaciones consagradas para ${arrendatarioTerm} el capítulo III, Título XXVI, Libro 4 del Código Civil (Ley 820 de 2003, art. 9).`
              };
            } else if (clausula.relativeId === 8) {
              return {
                ...clausula,
                texto: `OCTAVA: Terminación del contrato: – Son causales de terminación del contrato en forma unilateral, por parte de ${arrendadorTerm} las previstas por el artículo 22 de la ley 820 de 2003; y por parte de ${arrendatarioTerm} las consagradas en el artículo 23 de la misma ley. Parágrafo. – No obstante, las partes en cualquier tiempo y de común acuerdo podrán dar por terminado el presente contrato (Ley 820 de 2003, art. 21).`
              };
            } else if (clausula.relativeId === 9) {
              return {
                ...clausula,
                texto: `NOVENA: Preaviso: – ${arrendadorTerm} podrá dar por terminado el contrato de arrendamiento durante cualquiera de sus prórrogas, mediante previo aviso escrito dirigido a ${arrendatarioTerm} a través del servicio postal autorizado, con dos meses de anticipación sin el pago de la indemnización que prevé la ley (L. 820 de 2003, art. 22, numeral 7). Así mismo, ${arrendatarioTerm} podrá dar por terminado unilateralmente el contrato de arrendamiento dentro del término inicial o el de sus prórrogas mediante previo aviso escrito dirigido a ${arrendadorTerm} a través del servicio postal autorizado, con un plazo no menor a un mes y el pago de una indemnización equivalente al precio de tres (3) meses de arrendamiento. Cumplidas estas condiciones ${arrendadorTerm} estará obligada a recibir el inmueble; si no lo hiciere, ${arrendatarioTerm} podrá hacer entrega provisional mediante la intervención de la autoridad administrativa competente, sin perjuicio de acudir a la acción judicial correspondiente.`
              };
            } else if (clausula.relativeId === 12) {
              return {
                ...clausula,
                texto: `DECIMA SEGUNDA: Servicios Públicos: – (Se tendrá presente las reglas sobre los servicios públicos y otros, articulo 15 de la Ley 820 de 10 de julio de 2003, con la finalidad de que el inmueble entregado a título de arrendamiento no quede afecto al pago de los servicios públicos domiciliario, por incumpliendo en el pago de las facturas. ${arrendadorTerm} no será responsable ni el inmueble afectado, por la no cancelación oportuna de las facturas, expuestas a reconexiones. Parágrafo 1).  Se Prohíbe el uso de las facturas de servicios públicos (Agua, Alcantarillado, Luz EMSA, Bioagricola y Gas Llano gas), con fines comerciales y/o para solicitar créditos o realizar acuerdos de pago por la NO cancelación de los servicios públicos en las fechas acordadas (Agua, Alcantarillado, Luz EMSA, Bioagricola y Gas Llano gas). Parágrafo 2). Se prohíbe la manipulación de los contadores y sellos colocados por las empresas de servicios Públicos (Agua, Alcantarillado, Luz EMSA, Bioagricola y Gas Llano gas). Parágrafo 3). Cualquier instalación de internet, telefonía, televisión serán directamente responsabilidad de ${arrendatarioTerm}.`
              };
            } else if (clausula.id === 13) {
              return {
                ...clausula,
                texto: `DECIMA TERCERA: Reparaciones indispensables no locativas: – En el caso previsto en el artículo 1993 del Código Civil, salvo pacto en contrario entre las partes, ${arrendatarioTerm} podrá descontar el costo de las reparaciones no locativas. Artículo 1994. ${arrendadorTerm} no es ${arrendadTerm} a rembolsar el costo de las mejoras útiles.`
              };
            } else if (clausula.id === 14) {
              return {
                ...clausula,
                texto: `DECIMA CUARTA: Subarriendo y cesión: – ${arrendatarioTerm} no tienen la facultad de ceder el arriendo ni de subarrendar, salvo autorización expresa de ${arrendadorTerm}. En caso de contravención, ${arrendadorTerm} podrá dar por terminado el contrato de arrendamiento y exigir la entrega del inmueble o celebrar un nuevo contrato con los usuarios reales, caso en el cual el contrato anterior quedará sin efectos, situaciones éstas que se comunicarán por escrito a ${arrendatarioTerm}.`
              };
            } else if (clausula.relativeId === 15) {
              return {
                ...clausula,
                texto: `DECIMA QUINTA: COARRENDATARIO: – Para  garantizar  a  ${arrendatarioTerm} el cumplimiento de sus obligaciones, queda como <strong>${coarrendataTerm}</strong> el señor <strong>${coarrendatario.first_name.toUpperCase()} ${coarrendatario.last_name.toUpperCase()}</strong> identificado con cedula de ciudadanía Nro <strong>${formatoNumeroConSeparadores(coarrendatario.n_cedula)}</strong> expedida en ${coarrendatario.c_exp} , y quien a la fecha  es de ocupación ${coarrendatario.ocupacion} en la entidad ${coarrendatario.empresa} y  declara que se obliga solidariamente con ${arrendadorTerm} durante el término de duración del contrato y el de sus prórrogas y por tanto  el tiempo que permanezca el inmueble en responsabilidad de la señora ${arrendatario.first_name} ${arrendatario.last_name}.`
              };
            } else if (clausula.id === 16) {
              return {
                ...clausula,
                texto: `DECIMA SEXTA: NOTIFICACIONES: – ${arrendatarioTerm},  las recibirá en la ${arrendatario.direccionCorrespondencia} barrio ${arrendatario.barrioCorrespondencia} de la ciudad de ${arrendatario.ciudadCorrespondencia}, y en el correo electrónico ${arrendatario.email}, ${coarrendatarioTerm} las recibirá en la dirección: ${coarrendatario.dirCorrespondencia} barrio ${coarrendatario.barrioCorrespondencia} de la ciudad de ${coarrendatario.ciudadCorrespondencia}, y en el correo electrónico: ${coarrendatario.email}. ${arrendadorTerm} las recibirá en la ${administrador.direccionCorrespondencia} barrio ${administrador.barrioCorrespondencia} de la ciudad de ${administrador.ciudadCorrespondencia} y el correo electrónico ${administrador.email}  Las direcciones y correos electrónicos, aquí suministrados conservarán plena validez para todos los efectos legales. Para efectos de notificaciones judiciales y extrajudiciales relacionadas con el presente contrato, hasta tanto no sea informado a la otra parte del contrato, el cambio de esta, para lo cual se deberá utilizar el servicio postal autorizado, siendo aplicable en lo pertinente, lo dispuesto en el artículo 10 de la Ley 820 de 2003, el cual regula el procedimiento de pago por  consignación  extrajudicial. ${arrendadorTerm} deberá informar  el  cambio  de  dirección a ${arrendatarioTerm} mientras que éstos sólo están obligados a reportar el cambio a ${arrendadorTerm} en las situaciones que se continúen con obligaciones pendientes a la fecha de cambio  de residencia.`
              };
            } else if (clausula.id === 17) {
              return {
                ...clausula,
                texto: `DECIMA SÉPTIMA: Clausulas adicionales: – Primera: Deben estar presentes las partes el día ${fechaEntregaEnPalabras} para recibir el inmueble y el día ${fechaRestitucionEnPalabras} para la restitución del inmueble o de acuerdo con las prórrogas. Segunda: ${arrendadorTerm} entrega a ${arrendatarioTerm} en forma física y detallada conforme al inventario del inmueble el cual se encuentra en buenas condiciones de presentación y funcionamiento. Tercera: ${arrendatarioTerm} se comprometen hacer entrega mensual de las facturas canceladas por concepto de los servicios públicos en la fecha y hora de cancelar el canon de arrendamiento, para verificar estar a paz y salvo con las empresas de servicios públicos y así mismo autorizan a ${arrendadorTerm} a verificar el estado por medio de la visita a la vivienda objeto de arrendamiento sin que esto constituya una violación a la privacidad- Cuarta: El uso de los andenes es exclusivo para ${arrendatarioTerm} por tal razón no se autoriza para negocio, ni otra actividad. De conformidad con ley 769 del 2002. Artículo 76. Lugares prohibidos para estacionar. Modificado Artículo 15 Ley 1383 de 2010.- Quinta: ${arrendadorTerm} no asume responsabilidad alguna por los daños y perjuicios que ${arrendatarioTerm} pueda sufrir por causas atribuibles a terceros, ni por robos, hurtos, ni por siniestro causados por el incendio, inundación terremotos, ni por ningún daño o perjuicio causado por el cierre definitivo del establecimiento. Serán de cargo a ${arrendatarioTerm} las medidas, dirección y manejo tomadas para la seguridad del bien, así mismo ${arrendatarioTerm}, no asumirán responsabilidades algunas por daños causados al inmueble que se generen por fenómenos naturales o de terrorismo.`
              };
            } else if (clausula.relativeId === 18) {
              return {
                ...clausula,
                texto: `DECIMA OCTAVA: – El inmueble objeto de este contrato será destinado para Vivienda familiar. No se permitirá darle uso que atente contra la salud de las personas y la conservación del bien; en caso contrario, los gastos destinados a restablecer su salubridad y seguridad, según lo ordene la autoridad competente, serán por cuenta de ${arrendatarioTerm}.`
              };
            } else if (clausula.relativeId === 19) {
              return {
                ...clausula,
                texto: `Notas: 1). El servicio de AGUA en la ciudad de Villavicencio - Meta presenta constantemente intermitencia por múltiples causas ajenas y totalmente alejadas a la voluntad y control de ${arrendadorTerm}, por lo que ${arrendatarioTerm} acepta que el servicio de acueducto es discontinuo y esto no se podrá entender como obligatoriedad de ${arrendadorTerm}; teniendo en cuenta que los racionamientos de agua son coordinados desde la administración de la entidad encargada y no de ${arrendadorTerm}.`
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
      fechaEntregaInmueble: formData.fechaEntregaInmueble,
      fechaRestitucionInmueble: formData.fechaRestitucionInmueble,
      fechafinOtrosi: formData.fechafin,
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
        navigate(`/imprime-contrato/${responseData.id}`);
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
    <div className="container">
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
          <input type="date" name="fechaEntregaInmueble"  onChange={handleInputChange} /> {primData.fechaEntregaInmueble}
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

export default EditarContratoVivienda;
