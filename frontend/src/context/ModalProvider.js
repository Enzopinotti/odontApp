import { createContext, useState, useCallback } from 'react';
import ResendConfirmationModal from '../components/ResendConfirmationModal';
import { googleUrl } from '../api/auth';
import { FcGoogle } from 'react-icons/fc';

export const ModalCtx = createContext({});

export default function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const showModal = useCallback(({ title, message, email, type = 'info' }) => {
    console.log('🪟 showModal ejecutado con:', { title, message, type });
    setModal({ title, message, email, type });
  }, []);

  const closeModal = () => setModal(null);

  return (
    <ModalCtx.Provider value={{ showModal, closeModal }}>
      {children}
      {modal && (
        <div className="modal-backdrop">
          <div className="auth-card modal-card">
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{modal.title}</h3>
            <p style={{ textAlign: 'center', fontSize: '0.95rem' }}>{modal.message}</p>

            {modal.type === 'resend' && modal.email && (
              <div className="modal-actions">
                <ResendConfirmationModal
                  emailProp={modal.email}
                  onClose={closeModal}
                />
              </div>
            )}

            {modal.type === 'google' && (
              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="google-btn"
                  onClick={() => (window.location = googleUrl())} // 👈 reutiliza la función
                >
                  <FcGoogle size={20} /> Iniciar con Google
                </button>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button type="button" onClick={closeModal} className="link-btn">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}
