import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import Home from './features/inicio/Home';
import LoginComponent from './features/auth/LoginComponent';
import Register from './features/usuarios/Register';
import RegisterCoarrendatario from './features/usuarios/RegisterCoarrendatario';
import RegisterDependientes from './features/usuarios/RegisterDependientes';
import RegisterArrendatario from './features/usuarios/RegisterArrendatario';
import RegisterPropietario from './features/usuarios/RegisterPropietario';
import RegisterArrendador from './features/usuarios/RegisterArrendador';
import RegistrarReferencias from './features/usuarios/RegistrarReferencias';

import EditarUsuarios from './features/usuarios/EditarUsuarios';
import VerUsuarios from './features/usuarios/VerUsuarios';
import ReporteNovedadesForm from './features/novedades/ReporteNovedadesForm';
import ReportesNovedades from './features/novedades/ReporteNovedades';
import ReporteNovedadesArrendatario from './features/novedades/ReporteNovedadesArrendatario';
import ReporteNovedadesHabilitado from './features/novedades/ReporteNovedadesHabilitado';

import SubirPagoRecibosSeparados from './features/pagos/SubirPagoRecibosSeparados';
import RevisarPagosServicios from './features/pagos/RevisarPagosServicios';
import ContratosActivos from './features/pagos/ContratosActivos';
import DetalleContrato from './features/contratos/DetalleContrato';
import InicioInmobiliaria from './features/inicio/estudio/InicioInmobiliaria';
import VerContratosUsuario from './features/contratos/VerContratosUsuario';
import OtroSiVivienda from './features/contratos/otrosi/OtroSiVivienda';
import OtroSiViviendaImprimir from './features/contratos/otrosi/OtroSiViviendaImprimir';
import OtroSiArrendatarioImprimir from './features/contratos/otrosi/OtroSiArrendatarioImprimir';
import VerContratosOtrosiUsuario from './features/contratos/VerContratosOtrosiUsuario';
import OtroSiArrendataImprFirm from './features/contratos/otrosi/OtroSiArrendataImprFirm';
import OtroSiArrendadorImpr from './features/contratos/otrosi/OtroSiArrendadorImpr';

import VerContratoLocalVivienda from './features/contratos/localvivienda/VerContratoLocalVivienda';
import NuevoContratoLocalVivienda from './features/contratos/localvivienda/NuevoContratoLocalVivienda';
import ImprimirContratoLocalVivienda from './features/contratos/localvivienda/ImprimirContratoLocalVivienda';
import EditarContratoLocalVivienda from './features/contratos/localvivienda/EditarContratoLocalVivienda';
import NuevoContratoVivienda from './features/contratos/vivienda/NuevoContratoVivienda';
import ImprimirContratoVivienda from './features/contratos/vivienda/ImprimirContratoVivienda';
import EditarContratoVivienda from './features/contratos/vivienda/EditarContratoVivienda';
import VerContratoVivienda from './features/contratos/vivienda/VerContratoVivienda';
import ImprimirContratoComercial from './features/contratos/comercial/ImprimirContratoComercial';
import EditarContratoComercial from './features/contratos/comercial/EditarContratoComercial';
import VerContratoComercial from './features/contratos/comercial/VerContratoComercial';
import NuevoContratoComercial from './features/contratos/comercial/NuevoContratoComercial';
import CrearContratos from './features/contratos/CrearContratos';
import RevisarContratos from './features/contratos/RevisarContratos';
import RegistroCasasBasico from './features/casas/RegistroCasasBasico';
import RegistrarCasa from './features/casas/RegistrarCasa';
import ProtectedRoute from './routes/ProtectedRoute';

import ImagenesCasas from './features/casas/ImagenesCasas';
import VideoCasas from './features/casas/VideoCasas';
import ActualizarCasasBasico from './features/casas/ActualizarCasasBasico';
import ActualizarCasas from './features/casas/ActualizarCasas';
import InfoCasas from './features/casas/InfoCasas';
import VerSolicitudes from './features/solicitudes/VerSolicitudes';

import RegisterBasico from './features/auth/RegisterBasico';
import CompletarPerfilArrendatario from './features/auth/CompletarPerfilArrendatario';
import FormularioSolicitud from './features/solicitudes/FormularioSolicitud';
export default function App() {

  return (
    <AuthProvider> {/* Proveemos el contexto aquí */}
      <Router>
        <div>
          <NavBar /> {/* NavBar ahora accede a 'isLoggedIn' a través del contexto */}
          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
            <Route path="/contratoComercial" element={<ProtectedRoute><VerContratoComercial /></ProtectedRoute>} />  {/* Ruta para ver contratos */}
            <Route path="/contratos/nuevoComercial" element={<ProtectedRoute><NuevoContratoComercial /></ProtectedRoute>} />  {/* Ruta para añadir contratos */}
            <Route path="/editarcontratoComercial/:id" element={<ProtectedRoute><EditarContratoComercial /></ProtectedRoute>} />

            <Route path="/contratoVivienda" element={<ProtectedRoute><VerContratoVivienda /></ProtectedRoute>} />  {/* Ruta para ver contratos */}
            <Route path="/contratos/nuevoLocalVivienda" element={<ProtectedRoute><NuevoContratoLocalVivienda /></ProtectedRoute>} />  {/* Ruta para añadir contratos */}
            <Route path="/contratos/nuevoVivienda" element={<ProtectedRoute><NuevoContratoVivienda /></ProtectedRoute>} />  {/* Ruta para añadir contratos */}
            <Route path="/editarcontratovivienda/:id" element={<ProtectedRoute><EditarContratoVivienda /></ProtectedRoute>} />
            <Route path="/contratosLocalVivienda" element={<ProtectedRoute><VerContratoLocalVivienda /></ProtectedRoute>} />  {/* Ruta para ver contratos */}
            <Route path="/editarcontrato/:id" element={<ProtectedRoute><EditarContratoLocalVivienda /></ProtectedRoute>} />

            <Route path="/OtroSiVivienda/:id" element={<ProtectedRoute><OtroSiVivienda /></ProtectedRoute>} />
            <Route path="/OtroSiViviendaImprimir/:id" element={<ProtectedRoute><OtroSiViviendaImprimir /></ProtectedRoute>} />
            <Route path="/OtroSiArrendatarioImprimir/:id" element={<ProtectedRoute><OtroSiArrendatarioImprimir /></ProtectedRoute>} />
            <Route path="/VerContratosOtrosiUsuario" element={<ProtectedRoute><VerContratosOtrosiUsuario /></ProtectedRoute>} />
            <Route path="/OtroSiArrendataImprFirm/:id" element={<ProtectedRoute><OtroSiArrendataImprFirm /></ProtectedRoute>} />
            <Route path="/OtroSiArrendadorImpr/:id" element={<ProtectedRoute><OtroSiArrendadorImpr /></ProtectedRoute>} />

            <Route path="/imprimir-contrato/:id" element={<ProtectedRoute><ImprimirContratoLocalVivienda /></ProtectedRoute>} />
            <Route path="/imprime-contrato/:id" element={<ProtectedRoute><ImprimirContratoVivienda /></ProtectedRoute>} />
            <Route path="/imprimio-contrato/:id" element={<ProtectedRoute><ImprimirContratoComercial /></ProtectedRoute>} />

            <Route path="/Crear/Contratos" element={<ProtectedRoute><CrearContratos /></ProtectedRoute>} />
            <Route path="/Revisar/Contratos" element={<ProtectedRoute><RevisarContratos /></ProtectedRoute>} />
            <Route path="/ReporteNovedades" element={<ProtectedRoute><ReporteNovedadesForm /></ProtectedRoute>} />
            <Route path="/VerReporteNovedades" element={<ProtectedRoute><ReportesNovedades /></ProtectedRoute>} />
            <Route path="/VerReporteNovedades-arrendatario" element={<ProtectedRoute><ReporteNovedadesArrendatario /></ProtectedRoute>} />
            <Route path="/VerReporteNovedadesAutorizados" element={<ProtectedRoute><ReporteNovedadesHabilitado /></ProtectedRoute>} />

            <Route path="/SubirPagoRecibosSeparados" element={<ProtectedRoute><SubirPagoRecibosSeparados /></ProtectedRoute>} />
            <Route path="/RevisarPagosServicios" element={<ProtectedRoute><RevisarPagosServicios /></ProtectedRoute>} />
            <Route path="/contratos/:id" element={<ProtectedRoute><DetalleContrato /></ProtectedRoute>} />
            <Route path="/SeguimientoApagos" element={<ProtectedRoute><ContratosActivos /></ProtectedRoute>} />
            
            <Route path="/InicioInmobiliaria" element={<ProtectedRoute><InicioInmobiliaria /></ProtectedRoute>} />
            
            <Route path="/VerContratosUsuario" element={<ProtectedRoute><VerContratosUsuario /></ProtectedRoute>} />

            <Route path="/register/coarrendatario" element={<ProtectedRoute><RegisterCoarrendatario /></ProtectedRoute>} />
            <Route path="/register/dependientes" element={<ProtectedRoute><RegisterDependientes /></ProtectedRoute>} />
            <Route path="/register/Arrendatario" element={<RegisterArrendatario />} />
            <Route path="/register/Propietario" element={<ProtectedRoute><RegisterPropietario /></ProtectedRoute>} />
            <Route path="/register/Arrendador" element={<ProtectedRoute><RegisterArrendador /></ProtectedRoute>} />
            <Route path="/EditarUsuarios/:groups/:id" element={<ProtectedRoute><EditarUsuarios /></ProtectedRoute>} />
            <Route path="/VerUsuarios" element={<ProtectedRoute><VerUsuarios /></ProtectedRoute>} />
            <Route path="/registrarReferencia" element={<ProtectedRoute><RegistrarReferencias /></ProtectedRoute>} />


            <Route path="/register/CasasBasico" element={<ProtectedRoute><RegistroCasasBasico /></ProtectedRoute>} />
            <Route path="/actualizar/CasasBasico" element={<ProtectedRoute><ActualizarCasasBasico /> </ProtectedRoute>} />
            <Route path="/actualizar/Casas/:casaId" element={<ProtectedRoute><ActualizarCasas /> </ProtectedRoute>} />
            <Route path="/register/Casas" element={<ProtectedRoute><RegistrarCasa /></ProtectedRoute>} />
            <Route path="/imagenes/Casas/:casaId" element={<ProtectedRoute><ImagenesCasas /></ProtectedRoute>} />
            <Route path="/video/Casas/:casaId" element={<ProtectedRoute><VideoCasas /></ProtectedRoute>} />
            <Route path="/info/Casas/:casaId" element={<InfoCasas />} />

            <Route path="/registerBasico" element={<RegisterBasico />} />
            <Route path="/completar-perfil" element={<CompletarPerfilArrendatario />} />
            <Route path="/aplicar/:casaId" element={<FormularioSolicitud />} />
            <Route path="/ver-solicitudes" element={<VerSolicitudes />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}