// frontend/src/features/auth/pages/SecuritySettings.js
import { useState } from 'react';
import { setup2FA, verify2FA, disable2FA } from '../../../api/auth';
import useAuth from '../../auth/hooks/useAuth';
import useToast from '../../../hooks/useToast';
import { FaShieldAlt, FaQrcode, FaCheckCircle, FaLockOpen } from 'react-icons/fa';

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
    if (!token) return showToast('Ingresá el código', 'warning');
    try {
      setLoading(true);
      await verify2FA({ token, secret });
      setUser({ ...user, twoFactorEnabled: true });
      showToast('2FA activado exitosamente', 'success');
      setQr(null);
      setSecret('');
      setToken('');
    } catch (err) {
      showToast('Código de verificación inválido', 'error');
    } finally {
      setLoading(false);
    }
  };

  const desactivar2FA = async () => {
    try {
      setLoading(true);
      await disable2FA();
      setUser({ ...user, twoFactorEnabled: false });
      showToast('2FA desactivado correctamente', 'success');
    } catch (err) {
      showToast('Error al desactivar 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-settings-pro">
      {user?.twoFactorEnabled ? (
        <div className="status-box-pro ok">
          <div className="box-info">
            <FaCheckCircle className="icon" />
            <div>
              <h4>Verificación activa</h4>
              <p>Tu cuenta utiliza una capa extra de protección.</p>
            </div>
          </div>
          <button className="btn-disable-pro" onClick={desactivar2FA} disabled={loading}>
            {loading ? 'Procesando...' : 'Desactivar Protección'}
          </button>
        </div>
      ) : (
        <div className="setup-box-pro">
          {!qr ? (
            <div className="init-setup">
              <div className="box-info">
                <FaLockOpen className="icon warn" />
                <div>
                  <h4>Sin protección adicional</h4>
                  <p>Activá el 2FA para proteger tus datos clínicos.</p>
                </div>
              </div>
              <button className="btn-setup-pro" onClick={activar2FA} disabled={loading}>
                <FaShieldAlt /> {loading ? 'Cargando...' : 'Configurar 2FA'}
              </button>
            </div>
          ) : (
            <div className="qr-confirm-view">
              <div className="qr-card">
                <img src={qr} alt="QR Code" />
                <div className="qr-text">
                  <FaQrcode />
                  <span>Escaneá este código con Google Authenticator o Authy.</span>
                </div>
              </div>

              <form className="verify-form-pro" onSubmit={confirmar2FA}>
                <label>Ingresá el código generado:</label>
                <div className="verify-input-wrap">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? '...' : 'Verificar'}
                  </button>
                </div>
                <button type="button" className="btn-cancel-link" onClick={() => setQr(null)}>Cancelar configuración</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
