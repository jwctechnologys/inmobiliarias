import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { rutas } from './rutas';

// Mientras se descarga una pantalla se muestra este aviso.
function Cargando() {
  return <div data-cargando-pagina>Cargando...</div>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        {rutas.map(({ path, Pagina, protegida }) => (
          <Route
            key={path}
            path={path}
            element={protegida ? <ProtectedRoute><Pagina /></ProtectedRoute> : <Pagina />}
          />
        ))}
      </Routes>
    </Suspense>
  );
}
