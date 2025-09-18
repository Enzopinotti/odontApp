// src/context/ModalProvider.jsx
import { createContext, useState, useCallback } from "react";
import ResendConfirmationModal from "../components/ResendConfirmationModal";
import { googleUrl } from "../api/auth";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

export const ModalCtx = createContext({});

export default function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const showModal = useCallback(
    ({ title, message, email, type = "info", onConfirm, onCancel }) => {
      console.log("🪟 showModal ejecutado con:", { title, message, type });
      setModal({ title, message, email, type, onConfirm, onCancel });
    },
    []
  );

  const closeModal = () => setModal(null);

  return (
    <ModalCtx.Provider value={{ showModal, closeModal }}>
      {children}
      {modal && (
        <div className="modal-backdrop">
          <div className="auth-card modal-card">
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              {modal.title}
            </h3>
            <p style={{ textAlign: "center", fontSize: "0.95rem" }}>
              {modal.message}
            </p>

            {/* Modal de confirmación */}
            {modal.type === "confirm" && (
              <div
                className="modal-actions"
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
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

            {/* Modal para reenvío de correo */}
            {modal.type === "resend" && modal.email && (
              <div className="modal-actions">
                <ResendConfirmationModal
                  emailProp={modal.email}
                  onClose={closeModal}
                />
              </div>
            )}

            {/* Modal para login con Google */}
            {modal.type === "google" && (
              <div className="modal-actions" style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  className="google-btn"
                  onClick={() => (window.location = googleUrl())}
                >
                  <FcGoogle size={20} /> Iniciar con Google
                </button>
              </div>
            )}

            {/* Modal info simple */}
            {modal.type === "info" && (
              <div className="modal-actions" style={{ marginTop: "1rem" }}>
                <button type="button" onClick={closeModal} className="link-btn">
                  Cerrar
                </button>
              </div>
            )}

            {/* Modal para enviar receta */}
            {modal.type === "enviarReceta" && (
              <div
                style={{
                  position: "relative",
                  paddingTop: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                

                {/* Texto */}
                <p style={{ fontSize: "0.95rem", margin: "0 0 0.5rem 0" }}>
                  Podés enviar esta receta digital al paciente{" "}
                  <strong>
                    {modal.paciente?.nombre} {modal.paciente?.apellido}
                  </strong>{" "}
                  por correo electrónico o por WhatsApp.
                </p>

                {/* Botón email */}
                <button
                  type="button"
                  onClick={() => {
                    modal.onSend?.("email");
                    closeModal();
                  }}
                  
                >
                  <HiOutlineMail size={20} /> Enviar por correo electrónico
                </button>

                {/* Botón WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    modal.onSend?.("whatsapp");
                    closeModal();
                  }}
                 
                >
                  <FaWhatsapp size={20} /> Enviar por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}
