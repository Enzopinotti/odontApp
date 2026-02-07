import React from 'react';
import { FaCheckCircle, FaClock, FaPaperPlane, FaBan, FaExclamationCircle } from 'react-icons/fa';

// Configuración visual según estado del Backend
const CONFIG = {
  ENVIADO:         { icon: FaPaperPlane,       label: 'Enviado a Caja',   class: 'status-enviado' },
  PENDIENTE_PAGO:  { icon: FaClock,            label: 'Pendiente Pago',   class: 'status-pendiente' }, // Si usas otro nombre en DB, ajustalo aquí
  PAGADO:          { icon: FaCheckCircle,      label: 'Cobrado',          class: 'status-pagado' },
  CANCELADO:       { icon: FaBan,              label: 'Anulado',          class: 'status-cancelado' },
  ERROR:           { icon: FaExclamationCircle,label: 'Error',            class: 'status-cancelado' }
};

export default function StatusBadge({ status }) {
  // Fallback si viene un estado desconocido
  const current = CONFIG[status] || CONFIG.PENDIENTE_PAGO;
  const Icon = current.icon;

  return (
    <span className={`badge ${current.class}`}>
      <Icon size={12} style={{ marginRight: 4 }} /> 
      {current.label}
    </span>
  );
}