import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Receta from '../pages/Receta';

function AppRouter() {
  return (
    <Routes>
      {/* Layout público con Outlet */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
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

        <Route path='recetas' element={<Receta/>} />
        {/* Rutas privadas aquí */}
      </Route>

      <Route path="*" element={<h1>Página no encontrada</h1>} />
    </Routes>
  );
}

export default AppRouter;
