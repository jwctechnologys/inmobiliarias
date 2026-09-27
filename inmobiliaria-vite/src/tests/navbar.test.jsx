import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import NavBar from '../components/NavBar';

// Reproduce el bug reportado: al iniciar sesion, las opciones del menu de escritorio no aparecian
// hasta que el usuario cambiaba el tamano de la ventana. La causa era que el efecto que engancha el
// ResizeObserver no dependia de "loading": mientras loading es true la fila de escritorio ni
// siquiera esta montada (su ref es null), asi que el observer nunca llegaba a observar el elemento
// real una vez el usuario cargaba (loading pasaba a false sin que el efecto se volviera a ejecutar).
//
// jsdom no calcula layout real (offsetWidth siempre da 0), asi que aqui se le da a cada elemento un
// ancho fijo generoso para que TODOS los items quepan sin necesitar "Más": lo que se comprueba es
// que el menu deje de estar vacio, no la matematica de cuantos caben (eso no se puede probar sin
// layout real).
const anchoFijo = (valor) => ({ configurable: true, get: () => valor });

// Node 25 trae un localStorage propio (sin metodos) que tapa al de jsdom: se usa uno en memoria.
const crearAlmacenamiento = () => {
  let datos = {};
  return {
    getItem: (clave) => (clave in datos ? datos[clave] : null),
    setItem: (clave, valor) => { datos[clave] = String(valor); },
    removeItem: (clave) => { delete datos[clave]; },
    clear: () => { datos = {}; },
    key: (i) => Object.keys(datos)[i] ?? null,
    get length() { return Object.keys(datos).length; },
  };
};

describe('NavBar', () => {
  beforeEach(() => {
    const almacen = crearAlmacenamiento();
    vi.stubGlobal('localStorage', almacen);
    Object.defineProperty(window, 'localStorage', { value: almacen, configurable: true });
    localStorage.setItem('user', JSON.stringify({
      id: 1, username: 'admin_prueba', groups: ['administrador'], activo: true, is_active: true,
    }));
    // Varias respuestas se usan como array (ej. estaFirmadoArrendatario.filter(...)).
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true, json: () => Promise.resolve([]),
    })));

    // Un ResizeObserver de verdad (no un no-op): dispara su callback la primera vez que se observa
    // un elemento, como hace el navegador real, para poder probar que el efecto lo engancha.
    class ResizeObserverDeMentiras {
      constructor(cb) { this.cb = cb; }
      observe() { this.cb([]); }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverDeMentiras);

    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', anchoFijo(2000));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete HTMLElement.prototype.offsetWidth;
  });

  it('muestra las opciones del menu sin necesidad de cambiar el tamano de la ventana', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <NavBar />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      const items = container.querySelector('.flex-1.justify-end');
      expect(items?.children.length).toBeGreaterThan(0);
    });

    expect(container.textContent).toContain('Registrar Usuarios');
  });
});
