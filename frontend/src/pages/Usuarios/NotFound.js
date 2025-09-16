// src/pages/NotFound.js
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-card not-found">
      <h2>404 – Página no encontrada</h2>
      <p>No pudimos encontrar la página que buscás.</p>

      <div className="actions">
        <Link to="/" className="link">Ir al inicio</Link>
        <Link to="/login" className="link">Volver al login</Link>
      </div>
    </div>
  );
}
