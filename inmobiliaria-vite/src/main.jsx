import React from 'react';
import ReactDOM from 'react-dom/client'; // Importa desde react-dom/client
import App from './App';
import { AuthProvider } from './appprincipal/AuthContext'; // Corrige también esta ruta si es necesario
import './index.css'  // <-- Esta línea es crucial
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
