import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../appprincipal/csrf';
import { Link, useNavigate, useParams } from 'react-router-dom';
      
const EditarContratoLocalVivienda = () => {
const { id } = useParams();
const navigate = useNavigate(); 
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



  const [administradores, setAdministradores] = useState([]);
  const [arrendatarios, setArrendatarios] = useState([]);
  const [coarrendatarios, setCoarrendatarios] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [clausulas, setClausulas] = useState([
    {
      id: 1,
      texto: ' ',
      selected: true,
    },
  ]);

// Puedes usar 'id' para cargar los datos del contrato
  useEffect(() => {
    // Llamada a la API para obtener los detalles del contrato
    fetch(`${import.meta.env.VITE_BASE_URL}/api/Contrato_Local_viviendaViewSet/${id}/`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Datos que llegan:', data);
        setFormData({
          userAdministrador: { id: data.userAdministrador.id },
          userArrendatario: { id: data.userArrendatario.id },
          coarrendatario: { id: data.coarrendatario ? data.coarrendatario.id : null },
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
      })
      .catch((error) => console.error('Error al cargar el contrato:', error));
  }, [id]); // La llamada se hará nuevamente cuando el 'id' cambie

/*
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
                      texto: `Cláusula 3: Termino del contrato: se estipula por el término de unos (3) meses, inicia el ${fechainicioEnPalabras} y finaliza el ${fechafinEnPalabras}.`
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

      // Actualiza la cláusula con los datos del coarrendatario
      setClausulas(prevClausulas => 
          prevClausulas.map(clausula => {
              if (clausula.id === 21) {
                  return {
                      ...clausula,
                      texto: `Cláusula 21: Deudores solidarios: ${coarrendatarioTerm} ${coarrendatario.first_name} ${coarrendatario.last_name}, identificada con cédula de ciudadanía no. ${coarrendatario.n_cedula} de ${coarrendatario.c_exp}, con domicilio en la ciudad de ${coarrendatario.c_vive}, por medio del presente documento me declaro deudora del arrendador en forma solidaria e indivisible junto con el arrendatario, de todas las cargas y obligaciones contenidas en el presente contrato, durante el término inicial como durante sus prórrogas o renovaciones expresas o tácitas, por concepto de: arrendamientos, servicios públicos, indemnizaciones, daños en el inmueble, cláusulas penales, gestión de cobro, costas procesales y cualquier otra derivada del contrato.`,
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
        fechainicio: formData.fechainicio,
        fechafin: formData.fechafin,
        diaHInicioPago: formData.diaHInicioPago,
        diaFinPago: formData.diaFinPago,
        contrato_Activo: formData.contrato_Activo,
        inmueble: formData.inmueble?.id,
        ciudad: formData.ciudad,
        fecha: formData.fecha,
        clausulas: selectedClausulas.map(clausula => clausula.texto),
    };

    // Validación básica
    if (!dataToSubmit.userAdministrador || !dataToSubmit.userArrendatario || !dataToSubmit.fechainicio || !dataToSubmit.fechafin) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/contratos/${formData.id_contrato.id}/update/`, {
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
            navigate(`/imprimir-contrato/${responseData.id}`);
        } else {
            console.error('Error al actualizar el contrato:', responseData);
            alert(`Error: ${responseData.message || 'No se pudo actualizar el contrato.'}`);
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        alert('Ocurrió un error al conectar con el servidor.');
    }
};
*/

  return (
    <div className="container"><Link to="/">Ir a Home</Link>
    <form>
      <h1>Crear Contrato</h1>

      <div>
    <label>Administrador:</label>
    {/*onChange={(e) => handleUserAdminChange(e.target.value)}*/}
      <select
       name="userAdministrador"
        value={formData.userAdministrador.id|| ''} // Establecer el valor inicial
        
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
  {/*onChange={(e) => handleUserArrendatarioChange(e.target.value)}*/}
  <select
    name="userArrendatario"
    value={formData.userArrendatario.id|| ''} // Establecer el valor inicial del arrendatario
    
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
  {/*onChange={(e) => handlecoarrendatarioChange(e.target.value)}*/}
  <select
    name="coarrendatario"
    value={formData.coarrendatario.id || ''} // Establecer el valor inicial del coarrendatario
    
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

{/*onChange={handleInputChange} */}
<div>
  <label>Fecha de Inicio:</label>
  <input
    type="date"
    name="fechainicio"
    value={formData.fechainicio} // Establecer el valor de la fecha de inicio
     // Manejador para actualizar el estado
  />
</div>
      {/*onChange={handleInputChange} */}
      <div>
        <label>Fecha de Fin:</label>
        <input type="date" 
        name="fechafin" 
        value={formData.fechafin}
         />
      </div>
      {/*onChange={handleInputChange}*/}
      <div>
        <label>Dia de Inicio de pago:</label>
        <input type="text" name="diaHInicioPago" value={formData.diaHInicioPago}  />
      </div>
      {/*onChange={handleInputChange}*/}
      <div>
        <label>Dia Fin de pago:</label>
        <input type="text" name="diaFinPago" value={formData.diaFinPago}  />
      </div>

      {/*onChange={handleInputChange}*/}
      <div>
        <label>Contrato activo:</label>
        <input type="checkbox"  name="contrato_Activo"  checked={formData.contrato_Activo}  />
      </div>

      <div>
  <label>Inmueble:</label>

  {/*onChange={(e) => handleinmuebleChange(e.target.value)}*/}
  <select
    name="inmueble"
    value={formData.inmueble.id || ''} // Establecer el valor inicial del inmueble
     // Manejador para actualizar el estado
  >
    <option value="">Selecciona un inmueble</option>
    {inmuebles.map((inmueble) => (
      <option key={inmueble.id} value={inmueble.id}>
        {inmueble.direccion}
      </option>
    ))}
  </select>
</div>
      {/*onChange={handleInputChange}*/}
      <div>
        <label>Ciudad donde se firma el contrato:</label>
        <input type="text" name="ciudad" value={formData.ciudad}  />
      </div>

      {/*onChange={handleInputChange}*/}
      <div>
        <label>Fecha de firma del contrato:</label>
        <input type="date" name="fecha" value={formData.fecha}  />
      </div>

      {/*onChange={() => handleCheckboxChange(clausula.id)}*/}
      <div>
      <h2>Cláusulas</h2>
{formData.clausulas && formData.clausulas.map((clausula) => (
  <div key={clausula.id}>
    <input
      type="checkbox"
      id={`clausula-${clausula.id}`}
      checked={clausula.selected || True} // Muestra si está seleccionada o no
       // Cambiar el estado de "selected"
    />
    {/*onChange={(e) => handleClausulaChange(clausula.id, e.target.value)}*/}
    <textarea
      value={clausula.texto || ''} // Muestra el texto de la cláusula (asegurándote que no sea nulo)
       // Cambia el texto
      placeholder="Escribe la cláusula aquí"
      rows={6}
      style={{ width: '100%', height: 'auto', resize: 'none' }} // Ajuste del tamaño
    />
      {/*onClick={() => removeClausula(clausula.id)}*/}
      <button type="button" >Eliminar</button>
    </div>
  ))}
  {/*onClick={addClausula}*/}
  <button type="button" >Agregar Cláusula</button>
</div>
{/*onClick={handleActualizarContrato}*/}
<button type="button" >Guardar Contrato</button>
    </form></div>
  );
};

export default EditarContratoLocalVivienda;
