import { lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import Home from './Home';

const PanelInicio = lazy(() => import('./PanelInicio'));

const hayUsuarioGuardado = () => {
  try { return Boolean(JSON.parse(localStorage.getItem('user'))?.groups?.length); } catch { return false; }
};

// "/" depende de quien entra: un visitante ve el portal de propiedades; quien inicio sesion ve el panel con las
// funciones del programa. El portal publico sigue disponible para todos en /home y /propiedades.
export default function InicioPorRol() {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn || hayUsuarioGuardado()) {
    return <Suspense fallback={null}><PanelInicio /></Suspense>;
  }
  return <Home />;
}
