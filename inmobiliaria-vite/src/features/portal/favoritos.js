import { useCallback, useEffect, useState } from 'react';
import { registrarEvento } from './analitica';

// Favoritos guardados en el navegador de cada visitante (sin cuenta). Se sincronizan entre pestañas.
const CLAVE = 'portal.favoritos';

const leer = () => {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(CLAVE));
    return Array.isArray(guardado) ? guardado.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
};

export function useFavoritos() {
  const [ids, setIds] = useState(leer);

  useEffect(() => {
    const alCambiar = (e) => { if (e.key === CLAVE) setIds(leer()); };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);

  const alternar = useCallback((id) => {
    setIds((actuales) => {
      const nuevos = actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id];
      try { window.localStorage.setItem(CLAVE, JSON.stringify(nuevos)); } catch { /* sin almacenamiento: queda solo en pantalla */ }
      if (nuevos.includes(id)) registrarEvento('agregar_favorito', { inmueble: id });
      return nuevos;
    });
  }, []);

  return { ids, esFavorito: (id) => ids.includes(id), alternar };
}
