// src/context/ModalProvider.js
import { createContext, useState, useCallback } from 'react';
import ResendConfirmationModal from '../components/ResendConfirmationModal';
import { googleUrl } from '../api/auth';
import { FcGoogle } from 'react-icons/fc';

export const ModalCtx = createContext({});

export default function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const showModal = useCallback((config) => {
    if (config === null) {
      setModal(null);
      return;
    }
    console.log('🪟 showModal ejecutado con:', config);
    setModal(config);
  }, []);

  const closeModal = () => setModal(null);

  return (
    <ModalCtx.Provider value={{ showModal, closeModal }}>
      {children}
      {modal && (
        <div className="modal-backdrop">
          <div className={modal.className || ''}>
            {modal.title && <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{modal.title}</h3>}

            {modal.type === 'form' && (
              <div>{modal.component}</div>
            )}

            {modal.type === 'confirm' && (
              <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    modal.onConfirm?.();
                    closeModal();
                  }}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    modal.onCancel?.();
                    closeModal();
                  }}
                >
                  No
                </button>
              </div>
            )}

            {modal.type === 'resend' && modal.email && (
              <div className="modal-actions">
                <ResendConfirmationModal emailProp={modal.email} onClose={closeModal} />
              </div>
            )}

            {modal.type === 'google' && (
              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="google-btn"
                  onClick={() => (window.location = googleUrl())}
                >
                  <FcGoogle size={20} /> Iniciar con Google
                </button>
              </div>
            )}

            {modal.type === 'info' && (
              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" onClick={closeModal} className="link-btn">
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}
