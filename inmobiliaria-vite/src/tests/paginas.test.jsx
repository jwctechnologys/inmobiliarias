import { Component } from 'react';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { writeFileSync } from 'node:fs';
import App from '../App';
import { RUTAS } from './rutas';

// Atrapa los errores de render de la pantalla (tambien los de pantallas de carga diferida, que ocurren
// cuando termina de descargarse) para poder informar cual fue.
class Limite extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { this.props.alCapturar(error); }
  render() { return this.state.error ? <div data-error-de-pantalla /> : this.props.children; }
}

// Comprueba que CADA pantalla se puede montar (imports, hooks y JSX correctos) con una sesion de
// administrador y un servidor simulado. No prueba la logica de negocio: sirve para detectar que un
// cambio de estructura (mover archivos, cambiar imports, cargar por partes) no rompio ninguna pantalla.
const resultados = {};

const respuestaSimulada = () =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers(),
    json: () => Promise.resolve([]),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  });

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

beforeEach(() => {
  for (const nombre of ['localStorage', 'sessionStorage']) {
    const almacen = crearAlmacenamiento();
    vi.stubGlobal(nombre, almacen);
    Object.defineProperty(window, nombre, { value: almacen, configurable: true });
  }
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 1, user_id: 1, username: 'prueba', email: 'prueba@ejemplo.co',
      first_name: 'Prueba', last_name: 'Usuario', groups: ['administrador'], activo: true,
    }),
  );
  vi.stubGlobal('fetch', vi.fn(respuestaSimulada));
  // APIs del navegador que jsdom no trae.
  class Observador { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
  vi.stubGlobal('ResizeObserver', Observador);
  vi.stubGlobal('IntersectionObserver', Observador);
  window.matchMedia = vi.fn((consulta) => ({
    matches: false, media: consulta, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  }));
  window.scrollTo = vi.fn();
  window.print = vi.fn();
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
  URL.createObjectURL = vi.fn(() => 'blob:prueba');
  URL.revokeObjectURL = vi.fn();
  for (const nivel of ['error', 'warn', 'log', 'info']) vi.spyOn(console, nivel).mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

afterAll(() => {
  // Con SMOKE_OUT=archivo.json se guarda el resultado de cada ruta (para comparar antes/despues de un cambio).
  if (process.env.SMOKE_OUT) writeFileSync(process.env.SMOKE_OUT, JSON.stringify(resultados, null, 1));
});

// Pantallas que leen campos de un objeto concreto del servidor (p. ej. contrato.fechainicio). Con la respuesta
// simulada (una lista vacia) fallan por falta de DATOS, no por un error de codigo: para estas solo se tolera ese
// tipo de error; cualquier otro (un import roto, una variable sin definir...) sigue haciendo fallar la prueba.
const NECESITAN_DATOS_REALES = new Set([
  '/OtroSiViviendaImprimir/1',
  '/OtroSiArrendadorImpr/1',
  '/imprimir-contrato/1',
  '/imprimio-contrato/1',
  '/contratos/1',
  '/actualizar/Casas/1',
]);
const ERROR_DE_DATOS = /Cannot read properties of undefined/;

describe('todas las pantallas se pueden montar', () => {
  it.each(RUTAS)('%s', async (ruta) => {
    window.history.pushState({}, '', ruta);
    let capturado = null;
    try {
      const { container } = render(<Limite alCapturar={(e) => { capturado = e; }}><App /></Limite>);
      // Espera a que la pantalla termine de descargarse (carga diferida) y a que se asienten sus efectos.
      await waitFor(() => expect(container.querySelector('[data-cargando-pagina]')).toBeNull(), { timeout: 20000 });
      await new Promise((resolver) => setTimeout(resolver, 30));
      if (capturado) throw capturado;
      expect(container.innerHTML.length).toBeGreaterThan(0);
      resultados[ruta] = `ok -> ${window.location.pathname}`;
    } catch (error) {
      resultados[ruta] = `ERROR: ${String(error.message).slice(0, 140)}`;
      if (NECESITAN_DATOS_REALES.has(ruta) && ERROR_DE_DATOS.test(String(error.message))) return;
      throw error;
    }
  });
});
