// src/pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../api/auth';
import showToast from '../hooks/useToast';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verificando');

  useEffect(() => {
    const verificar = async () => {
      try {
        await verifyEmail(token);
        showToast('Correo verificado correctamente', 'success');
        setStatus('ok');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        showToast(err.response?.data?.message || 'Error al verificar el correo', 'error');
        setStatus('error');
      }
    };

    verificar();
  }, [token, navigate]);

  return (
    <div className="auth-card">
      <h2>Verificación de correo</h2>

      {status === 'verificando' && <p>Procesando tu verificación...</p>}
      {status === 'ok' && <p>¡Correo verificado! Redirigiendo al inicio de sesión...</p>}
      {status === 'error' && (
        <>
          <p>No se pudo verificar el correo.</p>
          <a href="/login" className="link">Volver al inicio de sesión</a>
        </>
      )}
    </div>
  );
}
