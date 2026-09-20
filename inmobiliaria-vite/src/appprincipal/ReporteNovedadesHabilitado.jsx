import React, { useState, useEffect } from 'react';
import { getCsrfToken } from './csrf';

const ReporteNovedadesHabilitado = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null); // Para manejar el contenido del modal
  const [currentIndex, setCurrentIndex] = useState(0); // Índice actual para desplazarse entre imágenes o videos
  const [contentType, setContentType] = useState(null); // 'image' o 'video'
  const [csrfToken, setCsrfToken] = useState('');
  const [arrendatario, setArrendatario] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  // Obtener datos del usuario desde localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')) || {}; // Obtén el objeto completo
    const role = userData.groups ? userData.groups[0] : null; // Accede al grupo del usuario
    const id = userData.id;

    setUserRole(role);
    setUserId(id);

    // Si el usuario es arrendatario, asigna automáticamente su ID
    if (role === 'arrendatario') {
      setArrendatario(id);

    }
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



  const handleEnviar = (reporteId) => {
    const estaResuelto = resueltos[reporteId]; // Asumiendo que 'resueltos' es un objeto con el reporteId como clave

    // Crear el objeto con los datos que necesitas enviar
    const bodyData = {
      estaResuelto: estaResuelto, // Solo enviar este campo para actualizar
    };

    fetch(`${import.meta.env.VITE_BASE_URL}/api/enviar_reporte/${reporteId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken, // Asegúrate de tener el CSRF Token correctamente configurado
      },
      body: JSON.stringify(bodyData), // Enviar el objeto con los campos necesarios
      credentials: "include", // Incluir las credenciales si es necesario
    })
      .then((response) => {
        if (response.ok) {
          alert("Datos enviados exitosamente.");
          window.location.reload(); // Recargar la página si es necesario
        } else {
          alert("Error al enviar los datos.");
        }
      })
      .catch((error) => console.error("Error al enviar los datos:", error));
  };


  const [resueltos, setResueltos] = useState({});

  const handleMarcarResuelto = (id) => {
    setResueltos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
              <th>Habilitado</th>
              <th>Comentario del Administrador</th>
              <th>Acciones</th>
              <th>Actualizar</th>
            </tr>
          </thead>
          <tbody>
            {reportes
              .filter((reporte) => reporte.estaHabilitado)
              .filter((reporte) => !reporte.estaResuelto)
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
                  {/* Checkbox deshabilitado para "estaHabilitado" */}
                  <td>
                    {reporte.estaHabilitado ? "Autorizado" : "No está autorizado"}
                  </td>
                  {/* Mostrar texto del administrador */}
                  <td>{reporte.textoAdministrador || "Sin comentarios"}</td>
                  {/* Checkbox para indicar si está resuelto */}
                  <td>
                    <input
                      type="checkbox"
                      checked={resueltos[reporte.id] || false}
                      onChange={() => handleMarcarResuelto(reporte.id)}
                    /> Ya esta resuelto
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
              key={modalContent[currentIndex].video_archivo}
              width="80%"
              height="auto"
              controls
              style={{ backgroundColor: "black" }}
            >
              <source
                src={`${import.meta.env.VITE_BASE_URL}/${modalContent[currentIndex].video_archivo}`}
                type="video/mp4"
              />
              Tu navegador no soporta la etiqueta de video.
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

export default ReporteNovedadesHabilitado;
