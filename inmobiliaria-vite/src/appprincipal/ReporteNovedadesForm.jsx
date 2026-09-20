import React, { useState, useEffect } from 'react';
import { getCsrfToken } from './csrf';
import { Link } from "react-router-dom";

function ReporteNovedadesForm() {
  const [formData, setFormData] = useState({
    contratoNum: '',
    texto: '',
    imagenes: [[]], // Lista de listas para imágenes (en caso de que quieras manejar más de una)
    videos: [[]], // Lista de listas para videos
  });
  const [contratos, setContratos] = useState([]); // Lista de contratos cargados desde la API
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')) || {};  // O donde tengas guardado el id del arrendatario
  
    fetch(`${import.meta.env.VITE_BASE_URL}/api/contratos-arrendatario/${userData.id}/`)  // Incluir el ID en la URL
      .then((response) => response.json())
      .then((data) => {
        setContratos(data);
        console.log('datos cargados, ', data);
      })
      .catch((error) => {
        console.error('Error al cargar contratos:', error);
      });
  }, []);

  const handleFileChange = (e, type, index) => {
    const files = Array.from(e.target.files); // Convertir FileList a array
    if (type === 'imagen') {
      setFormData((prevData) => {
        const newImagenes = [...prevData.imagenes];
        newImagenes[index] = files; // Reemplazar la lista de imágenes por la nueva selección
        return { ...prevData, imagenes: newImagenes };
      });
    } else if (type === 'video') {
      setFormData((prevData) => {
        const newVideos = [...prevData.videos];
        newVideos[index] = files; // Reemplazar la lista de videos por la nueva selección
        return { ...prevData, videos: newVideos };
      });
    }
  };

  const addFileField = (type) => {
    if (type === 'imagen') {
      setFormData((prevData) => ({
        ...prevData,
        imagenes: [...prevData.imagenes, []], // Añadir un nuevo array para imágenes
      }));
    } else if (type === 'video') {
      setFormData((prevData) => ({
        ...prevData,
        videos: [...prevData.videos, []], // Añadir un nuevo array para videos
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.contratoNum || !formData.texto) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const form = new FormData();
    form.append('contratoNum', formData.contratoNum);
    form.append('texto', formData.texto);

    // Añadir imágenes
    formData.imagenes.flat().forEach((file) => {
      form.append('imagenes', file);
    });

    // Añadir videos
    formData.videos.flat().forEach((file) => {
      form.append('videos', file);
    });

    console.log('Datos enviados:', formData);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/reportes-novedades/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken, // Agregar CSRF si es necesario
        },
        body: form,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        alert('Reporte de novedades registrado exitosamente');
        setFormData({
          contratoNum: '',
          texto: '',
          imagenes: [[]], // Limpiar los campos después de enviar
          videos: [[]],
        });
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
    <div className="reporte-novedades">
      <h2>Crear Reporte de Novedades</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="contratoNum">Número de Contrato</label>
          <select
            id="contratoNum"
            value={formData.contratoNum}
            onChange={(e) => setFormData({ ...formData, contratoNum: e.target.value })}
            required
          >
            <option value="">Seleccione un contrato</option>
            {contratos.map((contrato) => (
              <option key={contrato.id} value={contrato.id}>
                {contrato.id} - {contrato.direccion}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="texto">Descripción del reporte</label>
          <textarea
            id="texto"
            value={formData.texto}
            onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <h3>Imágenes</h3>
          {formData.imagenes.map((_, index) => (
            <div key={index} className="file-group">
              <label>Imágenes #{index + 1}</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'imagen', index)}
              />
            </div>
          ))}
          <button type="button" onClick={() => addFileField('imagen')}>
            Añadir más imágenes
          </button>
        </div>

        <div className="form-group">
          <h3>Videos</h3>
          {formData.videos.map((_, index) => (
            <div key={index} className="file-group">
              <label>Videos #{index + 1}</label>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video', index)}
              />
            </div>
          ))}
          <button type="button" onClick={() => addFileField('video')}>
            Añadir más videos
          </button>
        </div>

        <button type="submit" className="btn-submit">
          Enviar Reporte
        </button>
      </form>

      <Link to="/VerReporteNovedades-arrendatario" className="btn-submit">
  Ver estado de los reportes
</Link>
    </div>
  );
}

export default ReporteNovedadesForm;
