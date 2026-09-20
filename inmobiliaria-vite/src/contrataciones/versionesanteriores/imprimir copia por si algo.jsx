import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './ImprimirContrato.css'; // Importar el CSS de impresión

function formatearFechaConPalabras(fechaString) {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const [year, month, day] = fechaString.split('-');  // Asumiendo que el formato de fecha es 'YYYY-MM-DD'
  const dia = parseInt(day);  // Asegúrate de convertir el día a número
  const mes = meses[parseInt(month) - 1];  // Convierte el mes a índice
  const año = parseInt(year);

  const diaEnPalabras = convertirNumeroAPalabras(dia);
  const añoEnPalabras = convertirAñoAPalabras(año);

  return `el día ${diaEnPalabras} (${dia}) de ${mes} de ${añoEnPalabras} (${año})`;
}

// Función para convertir números en palabras
function convertirNumeroAPalabras(numero) {
  const numerosEnPalabras = [
    'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 
    'seis', 'siete', 'ocho', 'nueve', 'diez', 
    'once', 'doce', 'trece', 'catorce', 'quince', 
    'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 
    'veinte', 'veintiuno', 'veintidós', 'veintitrés', 
    'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 
    'veintiocho', 'veintinueve', 
    'treinta', 'treinta y uno', 'treinta y dos', 'treinta y tres', 
    'treinta y cuatro', 'treinta y cinco', 'treinta y seis', 
    'treinta y siete', 'treinta y ocho', 'treinta y nueve', 
    'cuarenta', 'cuarenta y uno', 'cuarenta y dos', 'cuarenta y tres', 
    'cuarenta y cuatro', 'cuarenta y cinco', 'cuarenta y seis', 
    'cuarenta y siete', 'cuarenta y ocho', 'cuarenta y nueve', 
    'cincuenta', 'cincuenta y uno', 'cincuenta y dos', 'cincuenta y tres', 
    'cincuenta y cuatro', 'cincuenta y cinco', 'cincuenta y seis', 
    'cincuenta y siete', 'cincuenta y ocho', 'cincuenta y nueve', 
    'sesenta', 'sesenta y uno', 'sesenta y dos', 'sesenta y tres', 
    'sesenta y cuatro', 'sesenta y cinco', 'sesenta y seis', 
    'sesenta y siete', 'sesenta y ocho', 'sesenta y nueve', 
    'setenta', 'setenta y uno', 'setenta y dos', 'setenta y tres', 
    'setenta y cuatro', 'setenta y cinco', 'setenta y seis', 
    'setenta y siete', 'setenta y ocho', 'setenta y nueve', 
    'ochenta', 'ochenta y uno', 'ochenta y dos', 'ochenta y tres', 
    'ochenta y cuatro', 'ochenta y cinco', 'ochenta y seis', 
    'ochenta y siete', 'ochenta y ocho', 'ochenta y nueve', 
    'noventa', 'noventa y uno', 'noventa y dos', 'noventa y tres', 
    'noventa y cuatro', 'noventa y cinco', 'noventa y seis', 
    'noventa y siete', 'noventa y ocho', 'noventa y nueve'
];

  return numerosEnPalabras[numero]; // Ajustar el índice ya que los arrays comienzan en 0
}

// Función para convertir el año a palabras
function convertirAñoAPalabras(año) {
  const miles = Math.floor(año / 1000);
  const resto = año % 1000;
  
  return `dos mil ${convertirNumeroAPalabras(resto)}`;
}
const ImprimirContratoLocalVivienda = () => {
  const { id } = useParams(); // Obtén el ID del contrato desde la URL
  const [contrato, setContrato] = useState(null);


  
  useEffect(() => {
    // Llamada a la API para obtener los detalles del contrato por ID
    const fetchContrato = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Contrato_Local_viviendaViewSet/${id}/`);
        const data = await response.json();
        console.log('Data:', data);
        setContrato(data);
      } catch (error) {
        console.error('Error al cargar el contrato:', error);
      }
    };

    fetchContrato();
  }, [id]);

  // Verifica que el contrato y la fecha existen antes de formatear
  const fechaFirmaEnPalabras = contrato && contrato.fecha ? formatearFechaConPalabras(contrato.fecha) : '';


  
  // Función para agregar negritas a palabras clave
const destacarTexto = (texto, cuentas) => {
  const palabrasEnNegritas = [
    'LA ARRENDATARIA', 'EL ARRENDATARIO', 'LA ARRENDADORA', 'EL ARRENDADOR',
    'Cláusula 23: Exclusión de responsabilidad por daños a terceros:',
    'Cláusula 22: Notificaciones:', 'Cláusula 21: Deudores solidarios:',
    'Cláusula 20: Actividad comercial:', 'Cláusula 19: Suspensión de servicios:',
    'Cláusula 18: Gastos:', 'Cláusula 17: Gestión de cobro:',
    'Cláusula 16: Mérito ejecutivo:', 'Cláusula 15: Autorizaciones:',
    'Cláusula 14: Exención de responsabilidad:', 'Cláusula 13: Otras causales de terminación del contrato:',
    'Cláusula 12: Depósito:', 'Cláusula 11: Subarriendo y cesión:',
    'Cláusula 10: Servicios públicos:', 'Cláusula 9: Reparaciones y mejoras:',
    'Cláusula 8: Recibo y entrega:', 'Cláusula 7: Inspección:',
    'Cláusula 6: Clausula penal:', 'Cláusula 5: Prorroga del contrato y aumento del canon:',
    'Cláusula 4: Remuneración mensual o canon de arrendamiento:', 'Cláusula 3: Término del contrato:',
    'Cláusula 2: Destino del inmueble:', 'Cláusula 1: Objeto del contrato:'
  ];

  // Agregar cuentas a las palabras en negrita
  const cuentasEnNegritas = [
    `Cuenta Daviplata N. ${cuentas.cuentaDaviplata}`,
    `y/o cuenta Nequi N. ${cuentas.cuentaNequi}`,
    `y Cuenta de ahorros Bancolombia N. ${cuentas.cuentaBancolombia}`,
    `${cuentas.nombresco}`,
    `${cuentas.apellidosco}`,
    `${cuentas.direccionadmi}`,
    `Barrio ${cuentas.barrioadmi}`,
  ];

  const todasLasPalabrasEnNegritas = palabrasEnNegritas.concat(cuentasEnNegritas);

  let textoProcesado = texto;

  todasLasPalabrasEnNegritas.forEach((palabra) => {
    // Utiliza un regex que respete la palabra completa con posibles espacios
    const regex = new RegExp(`(${palabra})`, 'g');
    textoProcesado = textoProcesado.replace(regex, '<strong>$1</strong>');
  });

  return textoProcesado;
};




  if (!contrato) {
    return <div>Cargando...</div>;
  }
  const cuentas = {
    cuentaDaviplata: contrato.userAdministrador.cuentaDaviplata,
    cuentaNequi: contrato.userAdministrador.cuentaNequi,
    cuentaBancolombia: contrato.userAdministrador.CuentaBancolombia,
    nombresco: contrato.coarrendatario.first_name,
    apellidosco: contrato.coarrendatario.last_name,
    direccionadmi: contrato.userAdministrador.direccion,
    barrioadmi: contrato.userAdministrador.barrio
  };
  

  return (
<div>
  <header>
    <img src="/images/logoLaverde.png" alt="Logo Laverde" className="logo" style={{ maxHeight: '100px' }} />
  </header>
  
  <main>
    <h4>CONTRATO DE ARRENDAMIENTO PARA LOCAL COMERCIAL Y VIVIENDA</h4>
    <p>
      En Villavicencio, {fechaFirmaEnPalabras || 'fecha no disponible'}, por una parte, en
      calidad de <b>{contrato.userAdministrador.genero === 'M' ? 'arrendador' : 'arrendadora'}</b>, 
      {contrato.userAdministrador.genero === 'M' ? 'el señor' : 'la señora'} <b>{contrato.userAdministrador.user.first_name} {contrato.userAdministrador.user.last_name}</b>, 
      identificada con cédula de ciudadanía no. {contrato.userAdministrador.doc_identificacion} de 
      {contrato.userAdministrador.lugarExpCedula}, y, por otra parte, en calidad
      de <b>{contrato.userArrendatario.genero === 'M' ? 'arrendatario' : 'arrendataria'}</b>, 
      {contrato.userArrendatario.genero === 'M' ? 'el señor' : 'la señora'} <b>{contrato.userArrendatario.user.first_name} {contrato.userArrendatario.user.last_name}</b>, 
      identificado con cédula de ciudadanía no. {contrato.userArrendatario.doc_identificacion} de 
      {contrato.userArrendatario.lugarExpCedula}, acuerdan celebrar el presente contrato de arrendamiento
      para local comercial con vivienda que se rige por la ley colombiana y las siguientes
      cláusulas:
    </p>
    
    {contrato.clausulas.map((clausula) => (
      <div key={clausula.id}>
        <p dangerouslySetInnerHTML={{ __html: destacarTexto(clausula.texto, cuentas) }}></p>
      </div>
    ))}
    
    <p>
      En constancia de lo anterior el arrendatario y la deudora solidaria manifiestan que han
      recibido copia del presente contrato con las firmas originales. 
      <br /><br />
      Para constancia firman,
    </p>
    
    <br /><br />
    
    <p>
      <b>{contrato.userAdministrador.user.first_name} {contrato.userAdministrador.user.last_name}</b>
      <br />C.C. {contrato.userAdministrador.doc_identificacion} de {contrato.userAdministrador.lugarExpCedula}
      <br />{contrato.userAdministrador.direccion} Barrio {contrato.userAdministrador.barrio}
      <br />Cel. {contrato.userAdministrador.celular} - {contrato.userAdministrador.celularDos}
      <br /><b>{contrato.userAdministrador.genero === 'M' ? 'ARRENDADOR' : 'ARRENDADORA'}</b>
      <br /><img src="/images/Campohuella.png" alt="Huella arrendadora" />
    </p>
    
    <p>
      <b>{contrato.userArrendatario.user.first_name} {contrato.userArrendatario.user.last_name}</b>
      <br />C.C. {contrato.userArrendatario.doc_identificacion} de {contrato.userArrendatario.lugarExpCedula}
      <br />{contrato.inmueble.arrendar.direccion} Barrio {contrato.inmueble.arrendar.barrio}
      <br />Cel. {contrato.userArrendatario.celular}
      <br /><b>{contrato.userArrendatario.genero === 'M' ? 'ARRENDATARIO' : 'ARRENDATARIA'}</b>
      <br /><img src="/images/Campohuella.png" alt="Huella arrendadora" />
    </p>
    
    <p>
      <b>{contrato.coarrendatario.first_name} {contrato.coarrendatario.last_name}</b>
      <br />C.C. {contrato.coarrendatario.doc_identificacion} de {contrato.coarrendatario.lugarExpCedula}
      <br />{contrato.coarrendatario.direccion} Barrio {contrato.coarrendatario.barrio}
      <br />Cel. {contrato.coarrendatario.celular}
      <br /><b>{contrato.userArrendatario.genero === 'M' ? 'ARRENDATARIO' : 'ARRENDATARIA'} - 
      {contrato.coarrendatario.genero === 'M' ? 'COARRENDATARIO' : 'COARRENDATARIA'}</b>
      <br /><img src="/images/Campohuella.png" alt="Huella arrendadora" />
    </p>
  </main>
  
  <footer>
    <p>Página 1 de X</p> {/* Aquí puedes cambiar "X" por la cantidad total de páginas cuando sea necesario */}
  </footer>
  
<button className="print-button" onClick={() => window.print()}>Imprimir</button>
</div>
    
  );
};

export default ImprimirContratoLocalVivienda;