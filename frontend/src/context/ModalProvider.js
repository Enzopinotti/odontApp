// src/context/ModalProvider.js
import { createContext, useState, useCallback } from 'react';
import ResendConfirmationModal from '../components/ResendConfirmationModal';
import { googleUrl } from '../api/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaTimes, FaWhatsapp } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';

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

            {(modal.type === 'confirm' || modal.type === 'resend' || modal.type === 'google' || modal.type === 'info' || modal.type === 'enviarReceta') ? (
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

                  {modal.type === 'info' && <div>{modal.component || modal.message}</div>}

                  {modal.type === 'enviarReceta' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.95rem', color: '#4b5563' }}>
                        Podés enviar esta receta digital al paciente{" "}
                        <strong>{modal.paciente?.nombre} {modal.paciente?.apellido}</strong>{" "}
                        por correo electrónico o por WhatsApp.
                      </p>

                      <button
                        type="button"
                        className="btn-confirm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%' }}
                        onClick={() => { modal.onSend?.("email"); closeModal(); }}
                      >
                        <HiOutlineMail size={20} /> Enviar por Email
                      </button>

                      <button
                        type="button"
                        className="btn-cancel"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', borderColor: '#25d366', color: '#128c7e' }}
                        onClick={() => { modal.onSend?.("whatsapp"); closeModal(); }}
                      >
                        <FaWhatsapp size={20} /> Enviar por WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                <footer className="am-footer">
                  {modal.type === 'confirm' ? (
                    <>
                      <button type="button" className="btn-cancel" onClick={() => { modal.onCancel?.(); closeModal(); }}>No, cancelar</button>
                      <button type="button" className="btn-confirm" onClick={() => { modal.onConfirm?.(); closeModal(); }}>Sí, continuar</button>
                    </>
                  ) : modal.type === 'enviarReceta' ? (
                    <button type="button" className="btn-cancel" onClick={closeModal} style={{ width: '100%' }}>Omitir envío</button>
                  ) : (
                    <button type="button" className="btn-save" onClick={closeModal}>Entendido</button>
                  )}
                </footer>
              </div>
            ) : (
              /* Type form o custom: pasamos el componente tal cual */
              modal.component
            )}
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}
