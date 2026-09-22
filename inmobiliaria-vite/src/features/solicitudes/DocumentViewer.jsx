// DocumentViewer.jsx - Versión corregida con URL completa
import React, { useState, useEffect } from 'react';

const DocumentViewer = ({ documento, nombre, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileType, setFileType] = useState('unknown');
    const [documentUrl, setDocumentUrl] = useState('');

    useEffect(() => {
        if (documento) {
            // Construir URL completa
            let url = documento;
            
            // Si la URL es relativa (empieza con 'media/' o '/media/')
            if (url.startsWith('media/') || url.startsWith('/media/')) {
                // Asegurarse de que no tenga doble slash
                const baseUrl = import.meta.env.VITE_BASE_URL || '';
                const cleanUrl = url.startsWith('/') ? url : `/${url}`;
                url = `${baseUrl}${cleanUrl}`;
            }
            
            console.log('URL del documento:', url);
            setDocumentUrl(url);
            
            // Determinar el tipo de archivo
            const extension = documento.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
                setFileType('image');
            } else if (['pdf'].includes(extension)) {
                setFileType('pdf');
            } else if (['doc', 'docx'].includes(extension)) {
                setFileType('word');
            } else {
                setFileType('unknown');
            }
            setLoading(false);
        }
    }, [documento]);

    const handleDownload = () => {
        if (documentUrl) {
            // Abrir en nueva pestaña
            window.open(documentUrl, '_blank');
        }
    };

    const handleOpenPdf = () => {
        if (documentUrl) {
            window.open(documentUrl, '_blank');
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Cargando documento...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-red-500 text-center py-8">
                    ❌ Error al cargar el documento: {error}
                </div>
            );
        }

        if (fileType === 'image') {
            return (
                <img
                    src={documentUrl}
                    alt={nombre || 'Documento'}
                    className="max-w-full h-auto mx-auto"
                    onError={() => {
                        setLoading(false);
                        setError('No se pudo cargar la imagen');
                    }}
                />
            );
        }

        if (fileType === 'pdf') {
            return (
                <div className="text-center py-8">
                    <div className="mb-4">
                        <span className="text-6xl">📄</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                        <strong>{nombre || 'Documento PDF'}</strong>
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button
                            onClick={handleOpenPdf}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                        >
                            <span>📖</span> Abrir PDF en nueva pestaña
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
                        >
                            <span>📥</span> Descargar
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                        El PDF se abrirá en una nueva pestaña para mejor visualización
                    </p>
                </div>
            );
        }

        if (fileType === 'word') {
            return (
                <div className="text-center py-8">
                    <div className="mb-4">
                        <span className="text-6xl">📄</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                        <strong>{nombre || 'Documento de Word'}</strong>
                    </p>
                    <button
                        onClick={handleDownload}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                    >
                        <span>📥</span> Descargar documento
                    </button>
                </div>
            );
        }

        return (
            <div className="text-center py-8">
                <div className="mb-4">
                    <span className="text-6xl">📄</span>
                </div>
                <p className="text-gray-600 mb-4">
                    <strong>{nombre || 'Documento'}</strong>
                </p>
                <button
                    onClick={handleDownload}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                >
                    <span>📥</span> Descargar documento
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-semibold text-gray-800 truncate max-w-xs">
                        {nombre || 'Documento'}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={handleDownload}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition flex items-center gap-1"
                        >
                            📥 Descargar
                        </button>
                        <button
                            onClick={onClose}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition"
                        >
                            ✕ Cerrar
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;