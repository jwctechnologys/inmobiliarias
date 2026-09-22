import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos la carga de datos o puedes hacer alguna lógica de inicialización
    if (isLoggedIn !== undefined) {
      setIsLoading(false); // Datos de usuario cargados
    }
  }, [isLoggedIn]);

  // Mientras cargan los datos de autenticación, muestra un loader
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Si no está logueado, redirige al login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, muestra el componente hijo
  return children;
}

export default ProtectedRoute;
