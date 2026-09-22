import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const RegistrarCasa = () => {
    const [casas, setCasas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener el usuario desde localStorage
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            // Si el usuario es un administrador
            if (user.groups && user.groups[0] === 'administrador') {
                fetch(`${import.meta.env.VITE_BASE_URL}/api/casas/`)
                    .then((response) => response.json())
                    .then((data) => {
                        setCasas(data);
                        console.log('Datos de casas (Administrador):', data);
                    })
                    .catch((error) => console.error("Error al cargar las casas para administrador:", error));
            }
            // Si el usuario es un propietario
            else if (user.groups && user.groups[0] === 'propietario') {
                fetch(`${import.meta.env.VITE_BASE_URL}/api/casas/`)
                    .then((response) => response.json())
                    .then((data) => {
                        // Filtrar las casas que pertenecen al propietario
                        const casasFiltradas = data.filter(casa => casa.propietario === user.id);
                        setCasas(casasFiltradas);
                        console.log('Datos de casas (Propietario filtradas):', casasFiltradas);
                    })
                    .catch((error) => console.error("Error al cargar las casas para propietario:", error));
            }
        }
    }, []);  // Solo se ejecuta una vez al inicio

    const handleActualizarCasas = (casaId) => {
        navigate(`/actualizar/Casas/${casaId}`); // Redirige a la página de actualizar casas
    };
    return (
        <div style={{ padding: "16px" }}>
            <h1>Gestión de Casas</h1>
            {casas.length === 0 ? (
                <p style={{ color: "red", fontWeight: "bold" }}>
                    No hay casas disponibles para actualizar.
                </p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f4f4f4" }}>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Dirección</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Propietario</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {casas.map((casa) => (
                            <tr key={casa.id}>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{casa.direccion}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{casa.propietario}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                                    <button onClick={() => handleActualizarCasas(casa.id)}
                                        style={{
                                            padding: "12px 24px",
                                            backgroundColor: "#ffc107",
                                            color: "#000",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Actualizar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    );
};

export default RegistrarCasa;