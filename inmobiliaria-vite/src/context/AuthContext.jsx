import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/csrf';

const AuthContext = createContext();

function getCookie(name) {
  let cookieValue = null;

  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();

      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(
          cookie.substring(name.length + 1)
        );
        break;
      }
    }
  }

  return cookieValue;
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Genera la cookie CSRF al cargar
  useEffect(() => {
    getCsrfToken();
  }, []);

  // Recuperar usuario guardado
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {

      // Asegura que exista cookie CSRF
      const csrfToken = await getCsrfToken();

      //console.log("TOKEN LOGIN:", csrfToken);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/login/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        console.log('Datos devueltos por el backend:', data);

        const userData = {
          user_id: data.user.user_id,
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          groups: data.user.groups,
          activo: data.user.activo,
          arrendatarioAprobado: data.user.arrendatarioAprobado,
          estadoCivil: data.user.estadoCivil,
        };

        localStorage.setItem(
          'user',
          JSON.stringify(userData)
        );

        setUser(userData);
        setIsLoggedIn(true);

        return data;
      }

      const errorText = await response.text();

      console.error('Error login:', errorText);

      throw new Error('Credenciales incorrectas');

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {

      const csrfToken = await getCsrfToken();
      console.log("TOKEN LOGOUT:", csrfToken);
      console.log("LONGITUD:", csrfToken?.length);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/logout/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-CSRFToken': csrfToken,
          },
        }
      );

      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);

        localStorage.removeItem('user');

        window.location.reload();
      } else {
        const errorData = await response.text();
        console.error('Logout error:', errorData);
      }

    } catch (error) {
      console.error(
        'Error al cerrar sesión:',
        error
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}