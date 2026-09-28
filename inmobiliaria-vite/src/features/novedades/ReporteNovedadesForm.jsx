import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../utils/csrf';
import { Link } from "react-router-dom";
import { API_URL } from '../../config';
import { estilosFormulario } from '../../utils/formStyles';

const st = estilosFormulario('indigo');

// Imagenes, videos y audios se cargan de la misma forma (varios campos, "Añadir mas ..."): un solo
// componente para los tres, en vez de repetir la misma seccion tres veces.
const SeccionArchivos = ({ titulo, tipo, accept, listas, onFileChange, onAgregar }) => (
  <div>
    <h3 className={st.seccionTitulo}>{titulo}</h3>
    <div className="space-y-3">
      {listas.map((_, index) => (
        <div key={index}>
          <label className={st.label}>{titulo} #{index + 1}</label>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={(e) => onFileChange(e, tipo, index)}
            className={st.archivo}
          />
        </div>
      ))}
    </div>
    <button type="button" onClick={() => onAgregar(tipo)} className={`${st.botonSecundario} mt-3 text-sm`}>
      + Añadir más {titulo.toLowerCase()}
    </button>
  </div>
);

function ReporteNovedadesForm() {
  const [formData, setFormData] = useState({
    contratoNum: '',
    texto: '',
    imagenes: [[]], // Lista de listas para imágenes (en caso de que quieras manejar más de una)
    videos: [[]], // Lista de listas para videos
    audios: [[]], // Lista de listas para audios
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

    // Este endpoint exige sesion iniciada (IsAuthenticated): sin "credentials: include" no manda la
    // cookie de sesion, el servidor responde 403 y el cuerpo del error (un objeto, no una lista) se
    // guardaba igual, haciendo fallar el .map() del <select> de contratos.
    fetch(`${API_URL}/api/contratos-arrendatario/${userData.id}/`, { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || data.error || 'No se pudieron cargar los contratos');
        return data;
      })
      .then((data) => {
        setContratos(Array.isArray(data) ? data : []);
        console.log('datos cargados, ', data);
      })
      .catch((error) => {
        console.error('Error al cargar contratos:', error);
        setContratos([]);
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
    } else if (type === 'audio') {
      setFormData((prevData) => {
        const newAudios = [...prevData.audios];
        newAudios[index] = files; // Reemplazar la lista de audios por la nueva selección
        return { ...prevData, audios: newAudios };
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
    } else if (type === 'audio') {
      setFormData((prevData) => ({
        ...prevData,
        audios: [...prevData.audios, []], // Añadir un nuevo array para audios
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

    // Añadir audios
    formData.audios.flat().forEach((file) => {
      form.append('audios', file);
    });

    console.log('Datos enviados:', formData);

    try {
      const response = await fetch(`${API_URL}/api/reportes-novedades/`, {
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
          audios: [[]],
        });
      } else {
        const errorData = await response.json();
        console.error(errorData);
        alert(`Error: ${errorData.error || errorData.detail || 'Algo salió mal'}`);
      }
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className={st.pagina}>
      <div className={st.contenedor}>
        <h1 className={st.titulo}>Crear Reporte de Novedades</h1>
        <div className={st.tarjeta}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="contratoNum" className={st.label}>Número de Contrato</label>
              <select
                id="contratoNum"
                value={formData.contratoNum}
                onChange={(e) => setFormData({ ...formData, contratoNum: e.target.value })}
                required
                className={st.select}
              >
                <option value="">Seleccione un contrato</option>
                {contratos.map((contrato) => (
                  <option key={contrato.id} value={contrato.id}>
                    Contrato #{contrato.id} - {contrato.inmueble}
                    {contrato.inmuebleTipo ? ` (${contrato.inmuebleTipo})` : ''}
                    {contrato.inmuebleBarrio ? `, Barrio ${contrato.inmuebleBarrio}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="texto" className={st.label}>Descripción del reporte</label>
              <textarea
                id="texto"
                value={formData.texto}
                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                required
                className={st.textarea}
              ></textarea>
            </div>

            <SeccionArchivos titulo="Imágenes" tipo="imagen" accept="image/*"
              listas={formData.imagenes} onFileChange={handleFileChange} onAgregar={addFileField} />

            <SeccionArchivos titulo="Videos" tipo="video" accept="video/*"
              listas={formData.videos} onFileChange={handleFileChange} onAgregar={addFileField} />

            <SeccionArchivos titulo="Audios" tipo="audio" accept="audio/*"
              listas={formData.audios} onFileChange={handleFileChange} onAgregar={addFileField} />

            <button type="submit" className={st.botonPrimario}>
              Enviar Reporte
            </button>
          </form>

          <Link to="/VerReporteNovedades-arrendatario" className="block mt-4 text-center text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            Ver estado de los reportes →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ReporteNovedadesForm;
