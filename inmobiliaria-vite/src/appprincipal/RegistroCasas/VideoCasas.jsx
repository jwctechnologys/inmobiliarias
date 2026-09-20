import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCsrfToken } from "../csrf";

function VideoCasas() {
  const { casaId } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null); // Para el modal

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  // Cargar videos de la casa
  useEffect(() => {
    if (!casaId) {
      console.warn("El ID de la casa no está definido. No se realizará el fetch.");
      return;
    }
    cargarVideos();
  }, [casaId]);

  const cargarVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/videos/?arrendar=${casaId}`
      );
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error("Error al cargar los videos:", error);
      alert("Error al cargar los videos");
    } finally {
      setLoading(false);
    }
  };

  // Manejar la selección de archivo con validaciones
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('video/')) {
        alert("Por favor, selecciona un archivo de video válido");
        setFile(null);
        setVideoPreview(null);
        return;
      }
      
      // Validar tamaño (máximo 100MB para videos)
      if (selectedFile.size > 100 * 1024 * 1024) {
        alert("El video no debe exceder los 100MB");
        setFile(null);
        setVideoPreview(null);
        return;
      }

      setFile(selectedFile);
      const previewURL = URL.createObjectURL(selectedFile);
      setVideoPreview(previewURL);
    } else {
      setFile(null);
      setVideoPreview(null);
    }
  };

  // Manejar la subida de videos
  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("arrendar", casaId);
    formData.append("video_archivo", file);
    formData.append("descripcion", description);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/videos/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        alert("Video subido con éxito");
        setFile(null);
        setDescription("");
        setVideoPreview(null);
        cargarVideos(); // Recargar videos sin recargar la página
      } else {
        throw new Error("Error al subir el video");
      }
    } catch (error) {
      console.error("Error al subir el video:", error);
      alert("Error al subir el video. Por favor, intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este video?")) {
      return;
    }

    setDeleteId(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/videos/${id}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      });

      if (response.ok) {
        setVideos(videos.filter((vid) => vid.id !== id));
        alert("Video eliminado con éxito");
      } else {
        throw new Error("Error al eliminar el video");
      }
    } catch (error) {
      console.error("Error al eliminar el video:", error);
      alert("Error al eliminar el video");
    } finally {
      setDeleteId(null);
    }
  };

  // Formatear tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Obtener duración del video (simulado, podrías implementar una función real)
  const getVideoDuration = (videoUrl) => {
    return "00:00"; // Placeholder, podrías implementar la detección real
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Videos
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Administra los videos de la casa #{casaId}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
          </div>
        </div>

        {/* Formulario de subida */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Subir nuevo video
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Área de carga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar video
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="video-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Subir un archivo</span>
                      <input
                        id="video-upload"
                        name="video-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="video/*"
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP4, MOV, AVI hasta 100MB
                  </p>
                </div>
              </div>
            </div>

            {/* Descripción y botón */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Agrega una descripción para este video..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {videoPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Vista previa:
                  </p>
                  <video
                    controls
                    className="w-full rounded-md border border-gray-300"
                    style={{ maxHeight: "200px" }}
                  >
                    <source src={videoPreview} type="video/mp4" />
                    Tu navegador no soporta videos.
                  </video>
                  <p className="text-xs text-gray-500 mt-1">
                    Tamaño: {file && formatFileSize(file.size)}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className={`mt-4 w-full px-4 py-2 rounded-md text-white font-medium ${
                  uploading || !file
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Subiendo...
                  </span>
                ) : (
                  "Subir video"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Galería de videos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Biblioteca de videos
            </h2>
            <span className="text-sm text-gray-500">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                No hay videos disponibles
              </p>
              <p className="text-xs text-gray-400">
                Sube el primer video usando el formulario
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="group bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative">
                    <video
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setSelectedVideo(vid)}
                    >
                      <source src={vid.video_archivo} type="video/mp4" />
                      Tu navegador no soporta videos.
                    </video>
                    
                    {/* Overlay con botón de reproducción */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => setSelectedVideo(vid)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3 shadow-lg"
                      >
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Botón de eliminar */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleDelete(vid.id)}
                        disabled={deleteId === vid.id}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-colors"
                        title="Eliminar video"
                      >
                        {deleteId === vid.id ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {vid.descripcion || "Sin descripción"}
                    </p>
                    {vid.video_archivo && (
                      <p className="text-xs text-gray-400 mt-2">
                        {formatFileSize(vid.video_archivo.length || 0)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para reproducir video */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedVideo.descripcion || "Video de la propiedad"}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <video
                controls
                autoPlay
                className="w-full rounded-lg"
                style={{ maxHeight: "70vh" }}
              >
                <source src={selectedVideo.video_archivo} type="video/mp4" />
                Tu navegador no soporta videos.
              </video>
              {selectedVideo.descripcion && (
                <p className="mt-4 text-gray-700">{selectedVideo.descripcion}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCasas;