import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';

import Login from '../pages/Usuarios/Login';
import Register from '../pages/Usuarios/Register';
import ForgotPassword from '../pages/Usuarios/ForgotPassword';
import ResetPassword from '../pages/Usuarios/ResetPassword';
import VerifySent from '../pages/Usuarios/VerifySent';
import VerifyEmail from '../pages/Usuarios/VerifyEmail';
import Profile from '../pages/Usuarios/Profile';
import ChangePassword from '../pages/Usuarios/ChangePassword';
import NotFound from '../pages/Usuarios/NotFound';

import Pacientes from '../pages/Pacientes/Pacientes';
import PacienteNuevo from '../pages/Pacientes/PacienteNuevo';
import PacienteEditar from '../pages/Pacientes/PacienteEditar';
import PacienteDetalle from '../pages/Pacientes/PacienteDetalle'; 

function AppRouter() {
  return (
    <Routes>
      <Route
        element={
          <GuestRoute>
            <PublicLayout />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-sent" element={<VerifySent />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
      </Route>

      {/* ✅ Layout privado para usuarios autenticados */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="profile" element={<Profile />} />
        <Route path="cambiar-password" element={<ChangePassword />} />
        <Route path="pacientes">
          <Route index element={<Pacientes />} /> 
          <Route path="nuevo" element={<PacienteNuevo />} />
          <Route path=":id/editar" element={<PacienteEditar />} />
          <Route path=":id" element={<PacienteDetalle />} /> 
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;