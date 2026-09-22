import { lazy } from 'react';
import Home from '../features/inicio/Home';
import LoginComponent from '../features/auth/LoginComponent';

// Cada pantalla se descarga solo cuando alguien la visita (carga diferida): el paquete inicial es mucho
// mas pequeno. Home y Login se cargan de entrada porque son la puerta de la app.
const Register = lazy(() => import('../features/usuarios/Register'));
const VerContratoComercial = lazy(() => import('../features/contratos/comercial/VerContratoComercial'));
const NuevoContratoComercial = lazy(() => import('../features/contratos/comercial/NuevoContratoComercial'));
const EditarContratoComercial = lazy(() => import('../features/contratos/comercial/EditarContratoComercial'));
const VerContratoVivienda = lazy(() => import('../features/contratos/vivienda/VerContratoVivienda'));
const NuevoContratoLocalVivienda = lazy(() => import('../features/contratos/localvivienda/NuevoContratoLocalVivienda'));
const NuevoContratoVivienda = lazy(() => import('../features/contratos/vivienda/NuevoContratoVivienda'));
const EditarContratoVivienda = lazy(() => import('../features/contratos/vivienda/EditarContratoVivienda'));
const VerContratoLocalVivienda = lazy(() => import('../features/contratos/localvivienda/VerContratoLocalVivienda'));
const EditarContratoLocalVivienda = lazy(() => import('../features/contratos/localvivienda/EditarContratoLocalVivienda'));
const OtroSiVivienda = lazy(() => import('../features/contratos/otrosi/OtroSiVivienda'));
const OtroSiViviendaImprimir = lazy(() => import('../features/contratos/otrosi/OtroSiViviendaImprimir'));
const OtroSiArrendatarioImprimir = lazy(() => import('../features/contratos/otrosi/OtroSiArrendatarioImprimir'));
const VerContratosOtrosiUsuario = lazy(() => import('../features/contratos/VerContratosOtrosiUsuario'));
const OtroSiArrendataImprFirm = lazy(() => import('../features/contratos/otrosi/OtroSiArrendataImprFirm'));
const OtroSiArrendadorImpr = lazy(() => import('../features/contratos/otrosi/OtroSiArrendadorImpr'));
const ImprimirContratoLocalVivienda = lazy(() => import('../features/contratos/localvivienda/ImprimirContratoLocalVivienda'));
const ImprimirContratoVivienda = lazy(() => import('../features/contratos/vivienda/ImprimirContratoVivienda'));
const ImprimirContratoComercial = lazy(() => import('../features/contratos/comercial/ImprimirContratoComercial'));
const CrearContratos = lazy(() => import('../features/contratos/CrearContratos'));
const RevisarContratos = lazy(() => import('../features/contratos/RevisarContratos'));
const ReporteNovedadesForm = lazy(() => import('../features/novedades/ReporteNovedadesForm'));
const ReportesNovedades = lazy(() => import('../features/novedades/ReporteNovedades'));
const ReporteNovedadesArrendatario = lazy(() => import('../features/novedades/ReporteNovedadesArrendatario'));
const ReporteNovedadesHabilitado = lazy(() => import('../features/novedades/ReporteNovedadesHabilitado'));
const SubirPagoRecibosSeparados = lazy(() => import('../features/pagos/SubirPagoRecibosSeparados'));
const RevisarPagosServicios = lazy(() => import('../features/pagos/RevisarPagosServicios'));
const DetalleContrato = lazy(() => import('../features/contratos/DetalleContrato'));
const ContratosActivos = lazy(() => import('../features/pagos/ContratosActivos'));
const InicioInmobiliaria = lazy(() => import('../features/inicio/estudio/InicioInmobiliaria'));
const VerContratosUsuario = lazy(() => import('../features/contratos/VerContratosUsuario'));
const RegisterCoarrendatario = lazy(() => import('../features/usuarios/RegisterCoarrendatario'));
const RegisterDependientes = lazy(() => import('../features/usuarios/RegisterDependientes'));
const RegisterArrendatario = lazy(() => import('../features/usuarios/RegisterArrendatario'));
const RegisterPropietario = lazy(() => import('../features/usuarios/RegisterPropietario'));
const RegisterArrendador = lazy(() => import('../features/usuarios/RegisterArrendador'));
const EditarUsuarios = lazy(() => import('../features/usuarios/EditarUsuarios'));
const VerUsuarios = lazy(() => import('../features/usuarios/VerUsuarios'));
const RegistrarReferencias = lazy(() => import('../features/usuarios/RegistrarReferencias'));
const RegistroCasasBasico = lazy(() => import('../features/casas/RegistroCasasBasico'));
const ActualizarCasasBasico = lazy(() => import('../features/casas/ActualizarCasasBasico'));
const ActualizarCasas = lazy(() => import('../features/casas/ActualizarCasas'));
const RegistrarCasa = lazy(() => import('../features/casas/RegistrarCasa'));
const ImagenesCasas = lazy(() => import('../features/casas/ImagenesCasas'));
const VideoCasas = lazy(() => import('../features/casas/VideoCasas'));
const InfoCasas = lazy(() => import('../features/casas/InfoCasas'));
const RegisterBasico = lazy(() => import('../features/auth/RegisterBasico'));
const CompletarPerfilArrendatario = lazy(() => import('../features/auth/CompletarPerfilArrendatario'));
const FormularioSolicitud = lazy(() => import('../features/solicitudes/FormularioSolicitud'));
const VerSolicitudes = lazy(() => import('../features/solicitudes/VerSolicitudes'));

// protegida: true exige sesion iniciada (ProtectedRoute). El orden no importa: React Router elige la ruta
// mas especifica. Al agregar una ruta, agregala tambien en src/tests/rutas.js (una prueba lo comprueba).
export const rutas = [
  { path: '/', Pagina: Home },
  { path: '/home', Pagina: Home },
  { path: '/login', Pagina: LoginComponent },
  { path: '/register', Pagina: Register, protegida: true },
  { path: '/contratoComercial', Pagina: VerContratoComercial, protegida: true },
  { path: '/contratos/nuevoComercial', Pagina: NuevoContratoComercial, protegida: true },
  { path: '/editarcontratoComercial/:id', Pagina: EditarContratoComercial, protegida: true },
  { path: '/contratoVivienda', Pagina: VerContratoVivienda, protegida: true },
  { path: '/contratos/nuevoLocalVivienda', Pagina: NuevoContratoLocalVivienda, protegida: true },
  { path: '/contratos/nuevoVivienda', Pagina: NuevoContratoVivienda, protegida: true },
  { path: '/editarcontratovivienda/:id', Pagina: EditarContratoVivienda, protegida: true },
  { path: '/contratosLocalVivienda', Pagina: VerContratoLocalVivienda, protegida: true },
  { path: '/editarcontrato/:id', Pagina: EditarContratoLocalVivienda, protegida: true },
  { path: '/OtroSiVivienda/:id', Pagina: OtroSiVivienda, protegida: true },
  { path: '/OtroSiViviendaImprimir/:id', Pagina: OtroSiViviendaImprimir, protegida: true },
  { path: '/OtroSiArrendatarioImprimir/:id', Pagina: OtroSiArrendatarioImprimir, protegida: true },
  { path: '/VerContratosOtrosiUsuario', Pagina: VerContratosOtrosiUsuario, protegida: true },
  { path: '/OtroSiArrendataImprFirm/:id', Pagina: OtroSiArrendataImprFirm, protegida: true },
  { path: '/OtroSiArrendadorImpr/:id', Pagina: OtroSiArrendadorImpr, protegida: true },
  { path: '/imprimir-contrato/:id', Pagina: ImprimirContratoLocalVivienda, protegida: true },
  { path: '/imprime-contrato/:id', Pagina: ImprimirContratoVivienda, protegida: true },
  { path: '/imprimio-contrato/:id', Pagina: ImprimirContratoComercial, protegida: true },
  { path: '/Crear/Contratos', Pagina: CrearContratos, protegida: true },
  { path: '/Revisar/Contratos', Pagina: RevisarContratos, protegida: true },
  { path: '/ReporteNovedades', Pagina: ReporteNovedadesForm, protegida: true },
  { path: '/VerReporteNovedades', Pagina: ReportesNovedades, protegida: true },
  { path: '/VerReporteNovedades-arrendatario', Pagina: ReporteNovedadesArrendatario, protegida: true },
  { path: '/VerReporteNovedadesAutorizados', Pagina: ReporteNovedadesHabilitado, protegida: true },
  { path: '/SubirPagoRecibosSeparados', Pagina: SubirPagoRecibosSeparados, protegida: true },
  { path: '/RevisarPagosServicios', Pagina: RevisarPagosServicios, protegida: true },
  { path: '/contratos/:id', Pagina: DetalleContrato, protegida: true },
  { path: '/SeguimientoApagos', Pagina: ContratosActivos, protegida: true },
  { path: '/InicioInmobiliaria', Pagina: InicioInmobiliaria, protegida: true },
  { path: '/VerContratosUsuario', Pagina: VerContratosUsuario, protegida: true },
  { path: '/register/coarrendatario', Pagina: RegisterCoarrendatario, protegida: true },
  { path: '/register/dependientes', Pagina: RegisterDependientes, protegida: true },
  { path: '/register/Arrendatario', Pagina: RegisterArrendatario },
  { path: '/register/Propietario', Pagina: RegisterPropietario, protegida: true },
  { path: '/register/Arrendador', Pagina: RegisterArrendador, protegida: true },
  { path: '/EditarUsuarios/:groups/:id', Pagina: EditarUsuarios, protegida: true },
  { path: '/VerUsuarios', Pagina: VerUsuarios, protegida: true },
  { path: '/registrarReferencia', Pagina: RegistrarReferencias, protegida: true },
  { path: '/register/CasasBasico', Pagina: RegistroCasasBasico, protegida: true },
  { path: '/actualizar/CasasBasico', Pagina: ActualizarCasasBasico, protegida: true },
  { path: '/actualizar/Casas/:casaId', Pagina: ActualizarCasas, protegida: true },
  { path: '/register/Casas', Pagina: RegistrarCasa, protegida: true },
  { path: '/imagenes/Casas/:casaId', Pagina: ImagenesCasas, protegida: true },
  { path: '/video/Casas/:casaId', Pagina: VideoCasas, protegida: true },
  { path: '/info/Casas/:casaId', Pagina: InfoCasas },
  { path: '/registerBasico', Pagina: RegisterBasico },
  { path: '/completar-perfil', Pagina: CompletarPerfilArrendatario },
  { path: '/aplicar/:casaId', Pagina: FormularioSolicitud },
  { path: '/ver-solicitudes', Pagina: VerSolicitudes },
];
