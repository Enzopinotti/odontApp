// frontend/src/features/pacientes/components/HistoriaModal.js
import React from 'react';
import '../../../styles/_historiaClinica.scss';

export default function HistoriaModal({ children, onClose }) {
  return (
    <div className="historia-modal-backdrop" onClick={onClose}>
      <div className="historia-modal-card" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
