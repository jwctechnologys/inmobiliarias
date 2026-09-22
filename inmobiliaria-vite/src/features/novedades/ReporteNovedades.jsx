import React, { useState, useEffect } from 'react';
import { getCsrfToken } from '../../utils/csrf';

const ReportesNovedades = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null); // Para manejar el contenido del modal
  const [currentIndex, setCurrentIndex] = useState(0); // Índice actual para desplazarse entre imágenes o videos
  const [contentType, setContentType] = useState(null); // 'image' o 'video'
  const [comentarios, setComentarios] = useState({});
  const [autorizaciones, setAutorizaciones] = useState({});
  const [csrfToken, setCsrfToken] = useState('');
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);
  useEffect(() => {
    // Función para cargar los reportes desde el backend
    const fetchReportes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/verreportes-novedades/`, {
          method: 'GET',
          credentials: 'include', // Si es necesario para la autenticación
        });
        if (response.ok) {
          const data = await response.json();
          setReportes(data);
          console.log('loque llega', data);
        } else {
          throw new Error('Error al cargar los reportes');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, []);

  const handleCheckboxChange = (id) => {
    setAutorizaciones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleComentarioChange = (id, value) => {
    setComentarios((prev) => ({ ...prev, [id]: value }));
  };

  const handleEnviar = (reporteId) => {
    const data = {
      autorizacion: autorizaciones[reporteId] || false,
      comentario: comentarios[reporteId] || "",
    };

    fetch(`${import.meta.env.VITE_BASE_URL}/api/enviar_reporte/${reporteId}/`, {
      method: "PATCH", // Cambiado a PATCH
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(data),
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          alert("Datos enviados exitosamente.");
          window.location.reload();
        } else {
          alert("Error al enviar los datos.");
        }
      })
      .catch((error) => console.error("Error al enviar los datos:", error));
  };



  const openModal = (type, contentArray, index) => {
    setContentType(type);
    setModalContent(contentArray);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setModalContent(null);
    setCurrentIndex(0);
  };

  const nextItem = () => {
    if (modalContent && currentIndex < modalContent.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevItem = () => {
    if (modalContent && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Reportes de Novedades</h2>
      {reportes.length === 0 ? (
        <p>No hay reporte de novedades.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Fecha</th>
              <th>Texto</th>
              <th>Imágenes</th>
              <th>Videos</th>
              <th>Autorizar Reparación</th>
              <th>Comentario del Administrador</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
  {reportes
    .filter((reporte) => !reporte.estaHabilitado) // Excluye los reportes habilitados
    .map((reporte) => (
      <tr key={reporte.id}>
        <td>{reporte.contratoNum}</td>
        <td>{new Date(reporte.fechaReporte).toLocaleDateString()}</td>
        <td>{reporte.texto}</td>
        <td>
          {reporte.imagenes && reporte.imagenes.length > 0 ? (
            <img
              src={`${import.meta.env.VITE_BASE_URL}/${reporte.imagenes[0].imagen}`}
              alt="Imagen principal"
              style={{ width: "100px", height: "100px", cursor: "pointer" }}
              onClick={() => openModal("image", reporte.imagenes, 0)}
            />
          ) : (
            "No hay imágenes"
          )}
        </td>
        <td>
          {reporte.videos && reporte.videos.length > 0 ? (
            <button
              onClick={() => openModal("video", reporte.videos, 0)}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Ver Video
            </button>
          ) : (
            "No hay videos"
          )}
        </td>
        <td>
          <input
            type="checkbox"
            checked={autorizaciones[reporte.id] || false}
            onChange={() => handleCheckboxChange(reporte.id)}
          />
        </td>
        <td>
          <textarea
            value={comentarios[reporte.id] || ""}
            onChange={(e) => handleComentarioChange(reporte.id, e.target.value)}
            placeholder="Agregar comentario"
            style={{ width: "100%", resize: "none" }}
          />
        </td>
        <td>
          <button
            onClick={() => handleEnviar(reporte.id)}
            style={{
              padding: "5px 10px",
              backgroundColor: "#28A745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Enviar
          </button>
        </td>
      </tr>
    ))}
</tbody>
        </table>
      )}

      {/* Modal */}
      {modalContent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              backgroundColor: "white",
              border: "none",
              padding: "10px 15px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Cerrar
          </button>
          {contentType === "image" && (
            <img
              src={`${import.meta.env.VITE_BASE_URL}/${modalContent[currentIndex].imagen}`}
              alt="Imagen ampliada"
              style={{ maxWidth: "90%", maxHeight: "90%" }}
            />
          )}
          {contentType === "video" && (
            <video
              key={modalContent[currentIndex].video_archivo} // Clave dinámica
              width="80%"
              height="auto"
              controls
              style={{ backgroundColor: "black" }}
            >
              <source
                src={`${import.meta.env.VITE_BASE_URL}/${modalContent[currentIndex].video_archivo}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          )}
          {modalContent.length > 1 && (
            <>
              <button
                onClick={prevItem}
                disabled={currentIndex === 0}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px",
                  backgroundColor: "white",
                  border: "none",
                  padding: "10px",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                &#8249;
              </button>
              <button
                onClick={nextItem}
                disabled={currentIndex === modalContent.length - 1}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  backgroundColor: "white",
                  border: "none",
                  padding: "10px",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                &#8250;
              </button>
            </>
          )}
        </div>

      )}

    </div>
  );

};

export default ReportesNovedades;
