import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import AppLayout from '../components/layout/AppLayout';
import PublicLayout from '../components/layout/PublicLayout';

// Pages
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Profile from '../features/auth/pages/Profile';
import ChangePassword from '../features/auth/pages/ChangePassword';
import Dashboard from '../features/home/pages/Dashboard';
import NotFound from '../pages/Usuarios/NotFound';
import Receta from '../pages/Receta';

import Pacientes from '../features/pacientes/pages/Pacientes';
import PacienteNuevo from '../features/pacientes/pages/PacienteNuevo';
import PacienteEditar from '../features/pacientes/pages/PacienteEditar';
import PacienteDetalle from '../features/pacientes/pages/PacienteDetalle';

import Agenda from '../features/agenda/pages/Agenda';
import AgendaDiaria from '../features/agenda/pages/AgendaDiaria';
import GestionDisponibilidades from '../features/agenda/pages/GestionDisponibilidades';
import NuevoTurnoPaso1 from '../features/agenda/pages/NuevoTurnoPaso1';
import NuevoTurnoPaso2 from '../features/agenda/pages/NuevoTurnoPaso2';
import NuevoTurnoPaso3 from '../features/agenda/pages/NuevoTurnoPaso3';

import AdminPage from '../features/admin/pages/AdminPage';
import AdminUsers from '../features/admin/pages/AdminUsers';
import AdminRoles from '../features/admin/pages/AdminRoles';
import AdminTreatments from '../features/admin/pages/AdminTreatments';
import AdminAudit from '../features/admin/pages/AdminAudit';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Rutas Privadas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/roles" element={<AdminRoles />} />
        <Route path="admin/treatments" element={<AdminTreatments />} />
        <Route path="admin/audit" element={<AdminAudit />} />
        <Route path="cambiar-password" element={<ChangePassword />} />
        <Route path="recetas" element={<Receta />} />

        <Route path="pacientes">
          <Route index element={<Pacientes />} />
          <Route path="nuevo" element={<PacienteNuevo />} />
          <Route path=":id" element={<PacienteDetalle />} />
          <Route path=":id/editar" element={<PacienteEditar />} />
        </Route>

        <Route path="agenda">
          <Route index element={<Agenda />} />
          <Route path="diaria" element={<AgendaDiaria />} />
          <Route path="disponibilidades" element={<GestionDisponibilidades />} />
          <Route path="nuevo" element={<NuevoTurnoPaso1 />} />
          <Route path="nuevo/paso2" element={<NuevoTurnoPaso2 />} />
          <Route path="nuevo/paso3" element={<NuevoTurnoPaso3 />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}