import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';
import useToast from '../hooks/useToast';
import ResendConfirmationModal from '../components/ResendConfirmationModal';

export default function VerifyEmail() {
  const { token } = useParams();
  const { showToast } = useToast();

  const [status, setStatus] = useState('verificando');
  const [errorMessage, setErrorMessage] = useState('');
  const [showResend, setShowResend] = useState(false);
  const executedRef = useRef(false);

  useEffect(() => {
    const verificar = async () => {
      if (executedRef.current) return;
      executedRef.current = true;

      try {
        await verifyEmail(token);
        setStatus('ok');
        showToast('Correo verificado correctamente', 'success');
      } catch (err) {
        const code = err.response?.data?.code;

        if (code === 'TOKEN_YA_USADO' || code === 'YA_VERIFICADO') {
          setStatus('ok');
          showToast('Tu correo ya estaba verificado', 'info');
          return;
        }

        if (code === 'TOKEN_EXPIRADO') {
          setErrorMessage('El enlace ha expirado.');
        } else if (code === 'TOKEN_INEXISTENTE') {
          setErrorMessage('El enlace no es válido.');
        } else {
          setErrorMessage('Ocurrió un error inesperado.');
        }

        setStatus('error');
      }
    };

    verificar();
  }, [token, showToast]);

  return (
    <div className="auth-card verify-email">
      <h2>Verificación de correo</h2>

      {status === 'verificando' && <p>Procesando tu verificación...</p>}

      {status === 'ok' && (
        <>
          <p><strong>¡Correo verificado correctamente!</strong></p>
          <a href="/login" className="link">Ir al inicio de sesión</a>
        </>
      )}

      {status === 'error' && (
        <>
          <p>{errorMessage}</p>
          <button className="link botonReenviar" onClick={() => setShowResend(true)}>
            Reenviar correo de verificación
          </button>
          <a href="/login" className="link">Volver al inicio de sesión</a>
          {showResend && <ResendConfirmationModal onClose={() => setShowResend(false)} />}
        </>
      )}
    </div>
  );
}
