import { describe, expect, it } from 'vitest';
import { rutas } from '../routes/rutas';
import { RUTAS } from './rutas';

// :parametros -> valores de ejemplo (igual que en la lista de src/tests/rutas.js)
const concreta = (path) => path.replace(':groups', 'arrendatario').replace(/:\w+/g, '1');

describe('tabla de rutas', () => {
  it('cada ruta de la app esta en la lista que monta paginas.test.jsx', () => {
    const declaradas = rutas.map((r) => concreta(r.path)).sort();
    expect(declaradas).toEqual([...RUTAS].sort());
  });

  it('no hay rutas repetidas', () => {
    const paths = rutas.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
