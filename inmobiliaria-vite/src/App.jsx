import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './appprincipal/AuthContext';
import NavBar from './appprincipal/NavBar';
import Home from './appprincipal/Home';
import LoginComponent from './appprincipal/LoginComponent';
import Register from './appprincipal/Register';
import RegisterCoarrendatario from './appprincipal/RegisterCoarrendatario';
import RegisterDependientes from './appprincipal/RegisterDependientes';
import RegisterArrendatario from './appprincipal/RegisterArrendatario';
import RegisterPropietario from './appprincipal/RegisterPropietario';
import RegisterArrendador from './appprincipal/RegisterArrendador';
import RegistrarReferencias from './appprincipal/RegistrarReferencias';

import EditarUsuarios from './appprincipal/EditarUsuarios';
import VerUsuarios from './appprincipal/VerUsuarios';
import ReporteNovedadesForm from './appprincipal/ReporteNovedadesForm';
import ReportesNovedades from './appprincipal/ReporteNovedades';
import ReporteNovedadesArrendatario from './appprincipal/ReporteNovedadesArrendatario';
import ReporteNovedadesHabilitado from './appprincipal/ReporteNovedadesHabilitado';

import SubirPagoRecibosSeparados from './appprincipal/SubirPagoRecibosSeparados';
import RevisarPagosServicios from './appprincipal/RevisarPagosServicios ';
import ContratosActivos from './appprincipal/ContratosActivos';
import DetalleContrato from './appprincipal/DetalleContrato';
import InicioInmobiliaria from './appprincipal/estudio/InicioInmobiliaria';
import VerContratosUsuario from './appprincipal/VerContratosUsuario';
import OtroSiVivienda from './contrataciones/ContratosVivienda/OtroSiVivienda';
import OtroSiViviendaImprimir from './contrataciones/ContratosVivienda/OtroSiViviendaImprimir';
import OtroSiArrendatarioImprimir from './contrataciones/ContratosVivienda/OtroSiArrendatarioImprimir';
import VerContratosOtrosiUsuario from './appprincipal/VerContratosOtrosiUsuario';
import OtroSiArrendataImprFirm from './contrataciones/ContratosVivienda/OtroSiArrendataImprFirm';
import OtroSiArrendadorImpr from './contrataciones/ContratosVivienda/OtroSiArrendadorImpr';

import VerContratoLocalVivienda from './contrataciones/VerContratoLocalVivienda';
import NuevoContratoLocalVivienda from './contrataciones/NuevoContratoLocalVivienda';
import ImprimirContratoLocalVivienda from './contrataciones/ImprimirContratoLocalVivienda';
import EditarContratoLocalVivienda from './contrataciones/EditarContratoLocalVivienda';
import NuevoContratoVivienda from './contrataciones/ContratosVivienda/NuevoContratoVivienda';
import ImprimirContratoVivienda from './contrataciones/ContratosVivienda/ImprimirContratoVivienda';
import EditarContratoVivienda from './contrataciones/ContratosVivienda/EditarContratoVivienda';
import VerContratoVivienda from './contrataciones/ContratosVivienda/VerContratoVivienda';
import ImprimirContratoComercial from './contrataciones/ContratosComercial/ImprimirContratoComercial';
import EditarContratoComercial from './contrataciones/ContratosComercial/EditarContratoComercial';
import VerContratoComercial from './contrataciones/ContratosComercial/VerContratoComercial';
import NuevoContratoComercial from './contrataciones/ContratosComercial/NuevoContratoComercial';
import CrearContratos from './contrataciones/CrearContratos';
import RevisarContratos from './contrataciones/RevisarContratos';
import RegistroCasasBasico from './appprincipal/RegistroCasas/RegistroCasasBasico';
import RegistrarCasa from './appprincipal/RegistroCasas/RegistrarCasa';
import ProtectedRoute from './appprincipal/ProtectedRoute';

import ImagenesCasas from './appprincipal/RegistroCasas/ImagenesCasas';
import VideoCasas from './appprincipal/RegistroCasas/VideoCasas';
import ActualizarCasasBasico from './appprincipal/RegistroCasas/ActualizarCasasBasico';
import ActualizarCasas from './appprincipal/RegistroCasas/ActualizarCasas';
import InfoCasas from './appprincipal/RegistroCasas/InfoCasas';
import VerSolicitudes from './appprincipal/RegistroCasas/VerSolicitudes';

import RegisterBasico from './appprincipal/RegisterBasico';
import CompletarPerfilArrendatario from './appprincipal/CompletarPerfilArrendatario';
import FormularioSolicitud from './appprincipal/RegistroCasas/FormularioSolicitud';
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