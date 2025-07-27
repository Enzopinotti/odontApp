import { useEffect, useState } from 'react';
import { setup2FA, verify2FA, disable2FA } from '../api/auth';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

export default function SecuritySettings() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const activar2FA = async () => {
    try {
      setLoading(true);
      const { data } = await setup2FA();
      setQr(data.data.qr);
      setSecret(data.data.secret);
    } catch (err) {
      showToast('Error generando QR', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmar2FA = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await verify2FA({ token, secret });
      setUser({ ...user, twoFactorEnabled: true });
      showToast('2FA activado', 'success');
      setQr(null);
      setSecret('');
      setToken('');
    } catch (err) {
      showToast('Código inválido', 'error');
    } finally {
      setLoading(false);
    }
  };

  const desactivar2FA = async () => {
    try {
      setLoading(true);
      await disable2FA();
      setUser({ ...user, twoFactorEnabled: false });
      showToast('2FA desactivado', 'success');
    } catch (err) {
      showToast('Error al desactivar 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-settings">
      <h2>Seguridad</h2>

      {user?.twoFactorEnabled ? (
        <>
          <p>El doble factor de autenticación está <strong>activo</strong>.</p>
          <button onClick={desactivar2FA} disabled={loading}>
            {loading ? 'Desactivando…' : 'Desactivar 2FA'}
          </button>
        </>
      ) : (
        <>
          {!qr && (
            <button onClick={activar2FA} disabled={loading}>
              {loading ? 'Generando…' : 'Activar 2FA'}
            </button>
          )}

          {qr && (
            <form onSubmit={confirmar2FA}>
              <p>Escaneá el código con tu app de autenticación y luego ingresá el código:</p>
              <img src={qr} alt="QR Code" style={{ maxWidth: 200, margin: '1rem auto' }} />
              <input
                type="text"
                placeholder="Código de verificación"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Verificando…' : 'Confirmar 2FA'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
