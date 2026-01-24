import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';

import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import VerifySent from '../features/auth/pages/VerifySent';
import VerifyEmail from '../features/auth/pages/VerifyEmail';
import Profile from '../features/auth/pages/Profile';
import ChangePassword from '../features/auth/pages/ChangePassword';
import NotFound from '../pages/Usuarios/NotFound';

import Pacientes from '../features/pacientes/pages/Pacientes';
import PacienteNuevo from '../features/pacientes/pages/PacienteNuevo';
import PacienteEditar from '../features/pacientes/pages/PacienteEditar';
import PacienteDetalle from '../features/pacientes/pages/PacienteDetalle';
import PacienteOdontograma from '../features/odontograma/pages/PacienteOdontograma';
import AdminPage from '../features/admin/pages/AdminPage';




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
        <Route path="admin" element={<AdminPage />} />
        <Route path="cambiar-password" element={<ChangePassword />} />


        <Route path="pacientes">
          <Route index element={<Pacientes />} />
          <Route path="nuevo" element={<PacienteNuevo />} />
          <Route path=":id/editar" element={<PacienteEditar />} />
          <Route path=":id/odontograma" element={<PacienteOdontograma />} />
          <Route path=":id" element={<PacienteDetalle />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;