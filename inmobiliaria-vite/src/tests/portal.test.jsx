import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { idDeRuta, rutaInmueble, tituloDeBusqueda, urlParaCompartir } from '../features/portal/formato';
import { jsonLdDeInmueble } from '../features/portal/seo';
import FichaInmueble from '../features/portal/FichaInmueble';
import Propiedades from '../features/portal/Propiedades';
import TarjetaInmueble from '../features/portal/TarjetaInmueble';
import PublicarPropiedad from '../features/inicio/PublicarPropiedad';
import Home from '../features/inicio/Home';

const casa = (extra = {}) => ({
  id: 7, slug: 'apartamento-en-arriendo-en-barzal', titulo: 'Apartamento en arriendo en Barzal', modalidad: 'arriendo', precio: 700000,
  tipoInmueble: 'Apartamento', direccion: 'Calle 1 # 2-3', barrio: 'Barzal', ciudad: 'Villavicencio', fotoPrincipal: null,
  latitud: null, longitud: null, habitaciones: 3, banos: 2, parqueaderos: 1, area: '65.00', verificada: true, destacada: false, ...extra,
});

// API simulada: responde segun la ruta, como lo haria el servidor
const instalarApi = ({ lista = [casa()], ficha = { ...casa(), descripcion: 'Casa luminosa.', comodidades: [{ clave: 'habitaciones', etiqueta: 'Habitaciones', cantidad: 3, nota: 'con closet' }], servicios: ['Agua'], imagenes: [], videos: [], parecidos: [] } } = {}) => {
  const llamadas = [];
  vi.stubGlobal('fetch', vi.fn((url, opciones = {}) => {
    llamadas.push({ url: String(url), opciones });
    const json = (datos, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => Promise.resolve(datos) });
    const u = String(url);
    if (u.includes('/api/publico/filtros/')) return json({ ciudades: ['Villavicencio'], tipos: ['Apartamento', 'Casa'], barrios: [], usos: [], conteo: { arriendo: lista.length, venta: 0, todas: lista.length } });
    if (u.includes('/consulta/')) return json({ ok: true }, true, 201);
    if (u.includes('/api/publicar_propiedad/')) return json({ ok: true }, true, 201);
    if (/\/api\/publico\/inmuebles\/\d+\//.test(u)) return ficha ? json(ficha) : json({}, false, 404);
    if (u.includes('/api/publico/inmuebles/')) return json({ total: lista.length, pagina: 1, paginas: 1, por_pagina: 12, resultados: lista });
    if (u.includes('/api/publico/mapa/')) return json({ resultados: [] });
    return json([]);
  }));
  return llamadas;
};

beforeEach(() => {
  const almacen = (() => { let d = {}; return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; }, clear: () => { d = {}; } }; })();
  vi.stubGlobal('localStorage', almacen);
  Object.defineProperty(window, 'localStorage', { value: almacen, configurable: true });
  window.scrollTo = vi.fn();
  window.matchMedia = window.matchMedia || vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  class Observador { observe() {} unobserve() {} disconnect() {} }
  vi.stubGlobal('ResizeObserver', Observador);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const montar = (ruta, elemento, patron = '*') => render(
  <MemoryRouter initialEntries={[ruta]}><Routes><Route path={patron} element={elemento} /></Routes></MemoryRouter>,
);

describe('utilidades del portal', () => {
  it('arma y lee el enlace legible de una ficha', () => {
    expect(rutaInmueble(casa())).toBe('/propiedad/7-apartamento-en-arriendo-en-barzal');
    expect(rutaInmueble({ id: 3 })).toBe('/propiedad/3');
    expect(idDeRuta('7-apartamento-en-arriendo')).toBe(7);
    expect(idDeRuta('hola')).toBeNull();
  });

  it('titula las busquedas como lo haria Google', () => {
    expect(tituloDeBusqueda({})).toBe('Propiedades');
    expect(tituloDeBusqueda({ modalidad: 'arriendo', tipo: 'Apartamento', ciudad: 'Villavicencio' })).toBe('Apartamentos en arriendo en Villavicencio');
    expect(tituloDeBusqueda({ modalidad: 'venta' })).toBe('Propiedades en venta');
  });

  it('los datos estructurados para Google incluyen precio, tipo de oferta y ubicacion', () => {
    const ld = jsonLdDeInmueble(casa({ latitud: 4.1, longitud: -73.6 }), 'https://x.co/propiedad/7');
    expect(ld['@type']).toBe('RealEstateListing');
    expect(ld.offers.price).toBe(700000);
    expect(ld.offers.businessFunction).toContain('LeaseOut');
    expect(ld.about.geo.latitude).toBe(4.1);
    expect(jsonLdDeInmueble(casa({ modalidad: 'venta' }), 'u').offers.businessFunction).toContain('Sell');
  });

  it('el enlace para compartir lo sirve el servidor (vista previa en WhatsApp)', () => {
    expect(urlParaCompartir(7)).toMatch(/\/api\/compartir\/7\/$/);
  });
});

describe('tarjeta de inmueble', () => {
  it('muestra precio, datos con su cantidad, insignias y los tres botones', () => {
    montar('/', <TarjetaInmueble casa={casa({ destacada: true })} alAlternarFavorito={() => {}} alVerMapa={() => {}} />);
    expect(screen.getByText('$ 700.000')).toBeTruthy();
    expect(screen.getByText('Habitaciones')).toBeTruthy();
    expect(screen.getByText('Baños')).toBeTruthy();
    expect(screen.getByText('Verificada')).toBeTruthy();
    expect(screen.getByText('Destacada')).toBeTruthy();
    expect(screen.getByText('Ubicación')).toBeTruthy();
    expect(screen.getByText('WhatsApp').closest('a').href).toContain('wa.me/573144568091');
    expect(screen.getByRole('link', { name: 'Apartamento en arriendo en Barzal' }).getAttribute('href')).toBe('/propiedad/7-apartamento-en-arriendo-en-barzal');
  });

  it('una propiedad en venta no muestra /mes', () => {
    montar('/', <TarjetaInmueble casa={casa({ modalidad: 'venta', precio: 300000000 })} />);
    expect(screen.getByText('En venta')).toBeTruthy();
    expect(screen.queryByText('/mes')).toBeNull();
  });
});

describe('buscador', () => {
  it('pide a la API los filtros de la direccion y muestra los resultados', async () => {
    const llamadas = instalarApi({ lista: [casa(), casa({ id: 8, slug: 'otra', titulo: 'Casa en arriendo en Centro', precio: 900000 })] });
    montar('/propiedades?modalidad=arriendo&habitaciones=2', <Propiedades />);
    await screen.findByText('Casa en arriendo en Centro');
    const busqueda = llamadas.find((l) => l.url.includes('/api/publico/inmuebles/?'));
    expect(busqueda.url).toContain('modalidad=arriendo');
    expect(busqueda.url).toContain('habitaciones=2');
    expect(screen.getAllByRole('heading', { level: 1 })[0].textContent).toBe('Propiedades en arriendo');
  });

  it('avisa cuando nada coincide y ofrece quitar los filtros', async () => {
    instalarApi({ lista: [] });
    montar('/propiedades?q=nada', <Propiedades />);
    await screen.findByText('Ninguna propiedad coincide con tu búsqueda');
    expect(screen.getByText('Quitar filtros')).toBeTruthy();
  });

  it('la pagina /arriendo/villavicencio usa la ciudad y la oferta del enlace', async () => {
    const llamadas = instalarApi();
    montar('/arriendo/villavicencio', <Propiedades modalidadFija="arriendo" />, '/arriendo/:ciudad');
    await waitFor(() => expect(llamadas.some((l) => l.url.includes('ciudad=Villavicencio') && l.url.includes('modalidad=arriendo'))).toBe(true));
    expect((await screen.findAllByRole('heading', { level: 1 }))[0].textContent).toBe('Propiedades en arriendo en Villavicencio');
  });
});

describe('ficha del inmueble', () => {
  const montarFicha = () => montar('/propiedad/7-x', <FichaInmueble />, '/propiedad/:idslug');

  it('muestra la descripcion, las comodidades con su cantidad y corrige el enlace', async () => {
    instalarApi();
    montarFicha();
    expect((await screen.findAllByText('Apartamento en arriendo en Barzal')).length).toBeGreaterThan(0);
    expect(screen.getByText('Casa luminosa.')).toBeTruthy();
    expect(screen.getByText('con closet')).toBeTruthy();
    expect(screen.getByText('Solicitar este arriendo').getAttribute('href')).toBe('/aplicar/7');
    expect(document.title).toContain('Apartamento en arriendo en Barzal');
    expect(document.head.querySelector('script[type="application/ld+json"]')).toBeTruthy();
  });

  it('una propiedad que ya no esta disponible lo dice y no se indexa', async () => {
    instalarApi({ ficha: null });
    montarFicha();
    await screen.findByText('Esta propiedad ya no está disponible');
    expect(document.head.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex,nofollow');
  });

  it('el formulario exige autorizar los datos y envia la consulta a la API', async () => {
    const llamadas = instalarApi();
    montarFicha();
    await screen.findByText('Casa luminosa.');
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Ana Gómez' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '3001112233' } });
    fireEvent.click(screen.getByText('Enviar mensaje'));
    expect(await screen.findByText('Debes autorizar el uso de tus datos.')).toBeTruthy();
    expect(llamadas.some((l) => l.url.includes('/consulta/'))).toBe(false);

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Enviar mensaje'));
    await screen.findByText('¡Mensaje enviado!');
    const envio = llamadas.find((l) => l.url.includes('/consulta/'));
    expect(JSON.parse(envio.opciones.body)).toMatchObject({ nombre: 'Ana Gómez', telefono: '3001112233', tipo: 'info', acepta_datos: true });
  });

  it('agendar una visita pide el dia', async () => {
    instalarApi();
    montarFicha();
    await screen.findByText('Casa luminosa.');
    fireEvent.click(screen.getByRole('tab', { name: /Agendar visita/ }));
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Ana Gómez' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '3001112233' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Solicitar visita'));
    expect(await screen.findByText('Elige el día de la visita.')).toBeTruthy();
  });
});

describe('formulario para publicar una propiedad', () => {
  it('no se envia sin autorizar el tratamiento de datos', async () => {
    const llamadas = instalarApi();
    montar('/publicar-propiedad', <PublicarPropiedad />);
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Marta Ruiz' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '3001234567' } });
    fireEvent.change(screen.getByLabelText(/Dirección/), { target: { value: 'Calle 5 # 3-20' } });
    fireEvent.change(screen.getByLabelText(/^Ciudad/), { target: { value: 'Villavicencio' } });
    fireEvent.click(screen.getByText('Enviar mi propiedad'));
    expect(await screen.findByText('Debes autorizar el uso de tus datos.')).toBeTruthy();
    expect(llamadas.some((l) => l.url.includes('/api/publicar_propiedad/'))).toBe(false);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Enviar mi propiedad'));
    await screen.findByText('¡Recibimos tu propiedad!');
  });
});

describe('portada', () => {
  it('muestra los destacados de la API con sus pestañas y el llamado a publicar', async () => {
    instalarApi();
    montar('/', <Home />);
    await screen.findByText('Apartamento en arriendo en Barzal');
    expect(screen.getByRole('tab', { name: /En arriendo \(1\)/ })).toBeTruthy();
    expect(screen.getAllByText('Publica tu propiedad')[0].closest('a').getAttribute('href')).toBe('/publicar-propiedad');
    expect(screen.getByText('Ver todas las propiedades').closest('a').getAttribute('href')).toBe('/propiedades');
  });
});
