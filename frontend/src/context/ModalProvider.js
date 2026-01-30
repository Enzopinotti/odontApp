// src/context/ModalProvider.js
import { createContext, useState, useCallback } from 'react';
import ResendConfirmationModal from '../components/ResendConfirmationModal';
import { googleUrl } from '../api/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaTimes } from 'react-icons/fa';


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
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className={modal.className || ''} onClick={e => e.stopPropagation()}>
            {/* Si el componente ya trae su propio card, lo dejamos pasar. 
                Si es un confirm/resend/info básico, lo envolvemos en card */}

            {(modal.type === 'confirm' || modal.type === 'resend' || modal.type === 'google' || modal.type === 'info') ? (
              <div className="admin-modal-card small">
                <header className="am-head">
                  <div className="am-title"><h3>{modal.title || 'Atención'}</h3></div>
                  <button className="close-x" onClick={closeModal}><FaTimes /></button>
                </header>
                <div className="am-body">
                  {modal.type === 'confirm' && (
                    <p style={{ textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                      {modal.message || '¿Está seguro de realizar esta acción?'}
                    </p>
                  )}
                  {modal.type === 'resend' && <ResendConfirmationModal emailProp={modal.email} onClose={closeModal} />}
                  {modal.type === 'google' && (
                    <button type="button" className="google-btn" onClick={() => (window.location = googleUrl())}>
                      <FcGoogle size={20} /> Iniciar con Google
                    </button>
                  )}
                  {modal.type === 'info' && <div>{modal.component}</div>}
                </div>
                <footer className="am-footer">
                  {modal.type === 'confirm' ? (
                    <>
                      <button type="button" className="btn-cancel" onClick={() => { modal.onCancel?.(); closeModal(); }}>No, cancelar</button>
                      <button type="button" className="btn-confirm" onClick={() => { modal.onConfirm?.(); closeModal(); }}>Sí, continuar</button>
                    </>
                  ) : (
                    <button type="button" className="btn-save" onClick={closeModal}>Entendido</button>
                  )}
                </footer>
              </div>
            ) : (
              /* Type form o custom: pasamos el componente tal cual (se espera que traiga su admin-modal-card) */
              modal.component
            )}
          </div>
        </div>
      )}
    </ModalCtx.Provider>

  );
}
