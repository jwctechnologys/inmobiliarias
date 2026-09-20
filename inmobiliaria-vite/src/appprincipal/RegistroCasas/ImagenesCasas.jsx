import React, { useState, useEffect } from "react";
import { getCsrfToken } from "../csrf";
import { useParams, useNavigate } from "react-router-dom";

function ImagenesCasas() {
  const { casaId } = useParams();
  const navigate = useNavigate();
  const [imagenes, setImagenes] = useState([]);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (!casaId) {
      console.warn("El ID de la casa no está definido. No se realizará el fetch.");
      return;
    }

    cargarImagenes();
  }, [casaId]);

  const cargarImagenes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/imagenes/?arrendar=${casaId}`
      );
      const data = await response.json();
      setImagenes(data);
    } catch (error) {
      console.error("Error al cargar las imágenes:", error);
      alert("Error al cargar las imágenes");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('image/')) {
        alert("Por favor, selecciona un archivo de imagen válido");
        setFile(null);
        setImagePreview(null);
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("La imagen no debe exceder los 5MB");
        setFile(null);
        setImagePreview(null);
        return;
      }

      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("arrendar", casaId);
    formData.append("imagen", file);
    formData.append("descripcion", description);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/imagenes/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        alert("Imagen subida con éxito");
        setFile(null);
        setDescription("");
        setImagePreview(null);
        cargarImagenes(); // Recargar imágenes sin recargar la página
      } else {
        throw new Error("Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta imagen?")) {
      return;
    }

    setDeleteId(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/imagenes/${id}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      });

      if (response.ok) {
        setImagenes(imagenes.filter((img) => img.id !== id));
        alert("Imagen eliminada con éxito");
      } else {
        throw new Error("Error al eliminar la imagen");
      }
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      alert("Error al eliminar la imagen");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Imágenes
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Administra las imágenes de la casa #{casaId}
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
            Subir nueva imagen
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Área de carga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar imagen
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Subir un archivo</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 5MB
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
                placeholder="Agrega una descripción para esta imagen..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Vista previa:
                  </p>
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="max-h-32 rounded-md border border-gray-300"
                  />
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
                  "Subir imagen"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Galería de imágenes
            </h2>
            <span className="text-sm text-gray-500">
              {imagenes.length} {imagenes.length === 1 ? "imagen" : "imágenes"}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : imagenes.length === 0 ? (
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                No hay imágenes disponibles
              </p>
              <p className="text-xs text-gray-400">
                Sube la primera imagen usando el formulario
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {imagenes.map((img) => (
                <div
                  key={img.id}
                  className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="aspect-w-4 aspect-h-3">
                    <img
                      src={img.imagen}
                      alt={img.descripcion || "Imagen de la casa"}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {img.descripcion || "Sin descripción"}
                    </p>
                  </div>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleDelete(img.id)}
                      disabled={deleteId === img.id}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-colors"
                      title="Eliminar imagen"
                    >
                      {deleteId === img.id ? (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImagenesCasas;