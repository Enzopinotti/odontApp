import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute'; 

import Login from '../pages/Login';
<<<<<<< HEAD
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifySent from '../pages/VerifySent';
import VerifyEmail from '../pages/VerifyEmail';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import NotFound from '../pages/NotFound';
=======
import Receta from '../pages/Receta';
>>>>>>> feature/recipes-ui

function AppRouter() {
  return (
    <Routes>
      {/* 🧑‍🚫 Layout público solo para no logueados */}
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
<<<<<<< HEAD
        <Route path="profile" element={<Profile />} />
        <Route path="cambiar-password" element={<ChangePassword />} />
=======

        <Route path='recetas' element={<Receta/>} />
        {/* Rutas privadas aquí */}
>>>>>>> feature/recipes-ui
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;