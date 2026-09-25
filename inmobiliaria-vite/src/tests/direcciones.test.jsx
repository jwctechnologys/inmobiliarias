import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import DireccionesRegistro, { correspondenciaAEnviar } from '../components/DireccionesRegistro';

afterEach(cleanup);

const VACIO = {
  direccion: '', barrio: '', ciudad: '',
  direccionCorrespondencia: '', barrioCorrespondencia: '', ciudadCorrespondencia: '',
};

// Formulario minimo que usa el componente como lo hacen los de registro.
const Formulario = ({ residenciaObligatoria = true, alCambiar }) => {
  const [valores, setValores] = useState(VACIO);
  const [misma, setMisma] = useState(true);
  alCambiar({ valores, misma });
  return (
    <DireccionesRegistro
      valores={valores}
      onChange={(campo, valor) => setValores((prev) => ({ ...prev, [campo]: valor }))}
      mismaDireccion={misma}
      onMismaDireccionChange={setMisma}
      residenciaObligatoria={residenciaObligatoria}
      inputClassName="" labelClassName="" sectionTitleClassName=""
    />
  );
};

describe('direcciones de registro', () => {
  it('por defecto pide solo la residencia y la correspondencia sale igual', () => {
    let estado;
    render(<Formulario alCambiar={(e) => { estado = e; }} />);

    expect(screen.queryByText('Dirección de Correspondencia')).toBeNull();
    expect(screen.getByRole('checkbox').checked).toBe(true);

    const [direccion, barrio, ciudad] = screen.getAllByRole('textbox');
    fireEvent.change(direccion, { target: { value: 'Calle 1 # 2-3' } });
    fireEvent.change(barrio, { target: { value: 'Centro' } });
    fireEvent.change(ciudad, { target: { value: 'Villavicencio' } });

    expect(correspondenciaAEnviar(estado.misma, estado.valores)).toEqual({
      direccionCorrespondencia: 'Calle 1 # 2-3',
      barrioCorrespondencia: 'Centro',
      ciudadCorrespondencia: 'Villavicencio',
    });
  });

  it('al desmarcar la casilla aparece la correspondencia y se envia la escrita', () => {
    let estado;
    render(<Formulario alCambiar={(e) => { estado = e; }} />);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Dirección de Correspondencia')).toBeTruthy();

    const campos = screen.getAllByRole('textbox'); // 3 de residencia + 3 de correspondencia
    expect(campos).toHaveLength(6);
    fireEvent.change(campos[0], { target: { value: 'Calle 1 # 2-3' } });
    fireEvent.change(campos[3], { target: { value: 'Apartado 55' } });
    fireEvent.change(campos[4], { target: { value: 'Norte' } });
    fireEvent.change(campos[5], { target: { value: 'Bogotá' } });

    expect(correspondenciaAEnviar(estado.misma, estado.valores)).toEqual({
      direccionCorrespondencia: 'Apartado 55',
      barrioCorrespondencia: 'Norte',
      ciudadCorrespondencia: 'Bogotá',
    });
  });

  it('residencia opcional: solo es obligatoria mientras hace de correspondencia', () => {
    render(<Formulario residenciaObligatoria={false} alCambiar={() => {}} />);
    expect(screen.getAllByRole('textbox').every((c) => c.required)).toBe(true);

    fireEvent.click(screen.getByRole('checkbox'));
    const campos = screen.getAllByRole('textbox');
    expect(campos.slice(0, 3).every((c) => !c.required)).toBe(true); // residencia opcional
    expect(campos.slice(3).every((c) => c.required)).toBe(true); // correspondencia obligatoria
  });
});
