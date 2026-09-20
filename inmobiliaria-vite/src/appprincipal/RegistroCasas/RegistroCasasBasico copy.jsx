import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../csrf';
import { Link, useNavigate } from 'react-router-dom';

const RegistroCasasBasico = () => {
    const [formData, setFormData] = useState({
        propietario: { id: null },
        tipoInmueble: '',
        direccion: '',
        barrio: '',
        ciudad: '',
        descripcion: '',
        con_administracion: false,
        fotoPrincipal: null,
        publicar: false,
    });
    const [propietarios, setPropietarios] = useState([]);

    useEffect(() => {
        // Cargar administradores
        fetch(`${import.meta.env.VITE_BASE_URL}/api/usuarios_por_grupo/propietario/`)
            .then((response) => response.json())
            .then((data) => {
                console.log('Datos de propietarios:', data);
                setPropietarios(data);
            })
            .catch((error) => console.error('Error al cargar administradores:', error));
    }, []);
    const [csrfToken, setCsrfToken] = useState('');
    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);
    const handleUserPropietarioChange = (id) => {
        setFormData((prevData) => ({
          ...prevData,
          userPropietario: { id },  // Update userAdministrador with an ID
        }));
      };
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData((prevData) => ({
            ...prevData, [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        for (const key in formData) {
            if (formData[key] !== null) {
                form.append(key, formData[key]);
            }
        }
        console.log("Datos enviados:", formData);

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/crear_casa/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken, // Si es necesario
                },
                body: form,
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                alert('Casa registrada exitosamente');
            } else {
                const errorData = await response.json();
                console.error(errorData);
                alert(`Error: ${errorData.detail || 'Algo salió mal'}`);
            }
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }

    };


    return (
        <form onSubmit={handleSubmit}>
      <div>
        <label>Propietario:</label>
        <select name="propietario" onChange={(e) => handleUserPropietarioChange(e.target.value)}>
          <option value="">Selecciona un Propietario</option>
          {propietarios.map((propietario) => (
            <option key={propietario.id} value={propietario.id}>
              {propietario.first_name} {propietario.last_name}
            </option>
          ))}
        </select>
      </div>
            <div>
                <label>Tipo de Inmueble:</label>
                <input type="text" name="tipoInmueble" value={formData.tipoInmueble} onChange={handleChange} />
            </div>
            <div>
                <label>Dirección:</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
            </div>
            <div>
                <label>Barrio:</label>
                <input type="text" name="barrio" value={formData.barrio} onChange={handleChange} />
            </div>
            <div>
                <label>Ciudad:</label>
                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} />
            </div>
            <div>
                <label>Descripción:</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}></textarea>
            </div>
            <div>
                <label>Con administración:</label>
                <input type="checkbox" name="con_administracion" checked={formData.con_administracion} onChange={handleChange} />
            </div>
            <div>
                <label>Foto Principal:</label>
                <input type="file" name="fotoPrincipal" onChange={handleChange} />
            </div>
            <div>
                <label>Publicar:</label>
                <input type="checkbox" name="publicar" checked={formData.publicar} onChange={handleChange} />
            </div>
            <button type="submit">Registrar Casa</button> </form>
    );
}; export default RegistroCasasBasico;