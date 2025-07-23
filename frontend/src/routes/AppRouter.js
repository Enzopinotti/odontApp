import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifySent from '../pages/VerifySent';
import VerifyEmail from '../pages/VerifyEmail';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';

function AppRouter() {
  return (
    <Routes>
      {/* Layout público con Outlet */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-sent" element={<VerifySent />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
      </Route>

      {/* Layout privado */}
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
      </Route>

      <Route path="*" element={<h1>Página no encontrada</h1>} />
    </Routes>
  );
}

export default AppRouter;
