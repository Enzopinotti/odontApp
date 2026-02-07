import React, { useState } from 'react';
import { FaMoneyBillWave, FaCreditCard, FaQrcode, FaFileInvoiceDollar, FaTimes, FaCheck } from 'react-icons/fa';

export default function PaymentModal({ orden, onConfirm, onCancel }) {
  const [metodo, setMetodo] = useState('Efectivo');
  const [procesando, setProcesando] = useState(false);
  
  // Future-proofing: Estado para cuando integres ARCA
  const [facturaElectronica, setFacturaElectronica] = useState(false);

  const handleSubmit = async () => {
    setProcesando(true);
    // Pasamos el método y flags futuros al padre
    await onConfirm({ 
      metodoPago: metodo,
      generarFacturaFiscal: facturaElectronica // (A futuro esto disparará la lógica de AFIP)
    });
    setProcesando(false);
  };

  // Estilos en línea para asegurar que se vea bien sin SCSS externo
  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, backdropFilter: 'blur(2px)'
    },
    card: {
      backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden',
      animation: 'fadeIn 0.3s ease-out'
    },
    header: {
      padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: '#f8fafc'
    },
    body: { padding: '25px' },
    totalContainer: {
      textAlign: 'center', marginBottom: '25px', padding: '15px',
      backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5'
    },
    totalLabel: { color: '#047857', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' },
    totalValue: { fontSize: '2.5rem', fontWeight: '800', color: '#059669', margin: '5px 0' },
    
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' },
    
    methodBtn: (isActive) => ({
      padding: '15px', border: isActive ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '8px', backgroundColor: isActive ? '#eff6ff' : 'white',
      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      transition: 'all 0.2s', color: isActive ? '#1d4ed8' : '#6b7280'
    }),
    
    arcaSection: {
      marginTop: '20px', padding: '15px', border: '1px dashed #cbd5e1', borderRadius: '8px',
      display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b'
    },

    footer: { padding: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #eee' },
    
    btnCancel: {
      padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#f3f4f6', color: '#4b5563', cursor: 'pointer', fontWeight: '600'
    },
    btnConfirm: {
      padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: '600',
      display: 'flex', alignItems: 'center', gap: '8px',
      opacity: procesando ? 0.7 : 1
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <h3 style={{margin:0, color: '#1f2937'}}>Registrar Cobro</h3>
          <button onClick={onCancel} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', color:'#9ca3af'}}>
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div style={styles.body}>
          
          {/* TOTAL GRANDE */}
          <div style={styles.totalContainer}>
            <div style={styles.totalLabel}>Total a Pagar</div>
            <div style={styles.totalValue}>${Number(orden.total).toLocaleString()}</div>
            <small style={{color: '#6b7280'}}>Paciente: {orden.paciente?.apellido || 'Eventual'}</small>
          </div>

          <label style={{display:'block', marginBottom:'10px', fontWeight:'600', color:'#374151'}}>Método de Pago</label>
          
          {/* SELECCIÓN DE MÉTODO */}
          <div style={styles.grid}>
            {[
              { id: 'Efectivo', icon: <FaMoneyBillWave size={24} />, label: 'Efectivo' },
              { id: 'Tarjeta', icon: <FaCreditCard size={24} />, label: 'Débito / Crédito' },
              { id: 'MercadoPago', icon: <FaQrcode size={24} />, label: 'Mercado Pago' },
              { id: 'Transferencia', icon: <FaFileInvoiceDollar size={24} />, label: 'Transferencia' },
            ].map((m) => (
              <button 
                key={m.id}
                style={styles.methodBtn(metodo === m.id)}
                onClick={() => setMetodo(m.id)}
              >
                {m.icon}
                <span style={{fontWeight:'500'}}>{m.label}</span>
              </button>
            ))}
          </div>

          {/* SECCIÓN ARCA / AFIP (Placeholder) */}
          <div style={styles.arcaSection}>
            <input 
              type="checkbox" 
              checked={facturaElectronica} 
              onChange={(e) => setFacturaElectronica(e.target.checked)}
              disabled // 🔒 Deshabilitado hasta que hagas el módulo de AFIP
              style={{accentColor: '#3b82f6', width:'18px', height:'18px'}} 
            />
            <div style={{fontSize:'0.9rem'}}>
              <strong>Factura Electrónica (ARCA)</strong>
              <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>Próximamente: Conexión directa con AFIP</div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <button style={styles.btnCancel} onClick={onCancel} disabled={procesando}>Cancelar</button>
          <button style={styles.btnConfirm} onClick={handleSubmit} disabled={procesando}>
            {procesando ? 'Procesando...' : <><FaCheck /> Confirmar Cobro</>}
          </button>
        </div>
      </div>
    </div>
  );
}