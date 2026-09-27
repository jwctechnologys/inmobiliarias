import { describe, expect, it } from 'vitest';
import { mesesEnteros } from '../utils/fechas';

describe('mesesEnteros', () => {
  it('cuenta meses completos por calendario', () => {
    expect(mesesEnteros('2026-03-03', '2026-09-03')).toBe(6);
  });

  it('no completa el ultimo mes si el dia de fin es anterior al de inicio', () => {
    expect(mesesEnteros('2026-03-03', '2026-09-02')).toBe(5);
  });

  it('cuenta un dia extra en el ultimo mes igual', () => {
    expect(mesesEnteros('2026-03-03', '2026-09-04')).toBe(6);
  });

  it('cruza el fin de ano', () => {
    expect(mesesEnteros('2026-11-15', '2027-02-15')).toBe(3);
  });

  it('sin alguna fecha, o fin antes que inicio, no calcula', () => {
    expect(mesesEnteros('', '2026-09-03')).toBeNull();
    expect(mesesEnteros('2026-03-03', '')).toBeNull();
    expect(mesesEnteros('2026-09-03', '2026-03-03')).toBeNull();
  });
});
