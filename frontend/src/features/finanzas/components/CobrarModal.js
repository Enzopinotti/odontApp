import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { finanzasApi } from '../api/finanzasApi';
import useToast from '../../../hooks/useToast';
import { FaMoneyBillWave, FaCreditCard, FaCheckCircle, FaTimes } from 'react-icons/fa';

export default function CobrarModal({ orden, onClose }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');

  const cobrarMutation = useMutation({
    mutationFn: (datos) => finanzasApi.cobrarOrden(orden.id, datos),
    onSuccess: () => {
      showToast('Pago registrado correctamente', 'success');
      queryClient.invalidateQueries(['facturas']); // Recarga la lista
      onClose();
    },
    onError: (err) => showToast(err.message || 'Error al cobrar', 'error')
  });

  const handleCobrar = () => {
    cobrarMutation.mutate({ metodoPago });
  };

  return (
    <div style={{
      position:'fixed', top:0, left:0, width:'100%', height:'100%', 
      background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 1000
    }}>
      <div className="animate__animated animate__zoomIn" style={{
         background:'white', padding:'2rem', borderRadius:'12px', width:'90%', maxWidth:'400px',
         boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
             <h2 style={{margin:0, fontSize:'1.4rem'}}>Registrar Pago</h2>
             <button onClick={onClose} style={{border:'none', background:'none', cursor:'pointer', fontSize:'1.2rem', color:'#94a3b8'}}><FaTimes/></button>
         </div>

         <div style={{background:'#f8fafc', padding:'1rem', borderRadius:'8px', marginBottom:'1.5rem', textAlign:'center'}}>
             <p style={{margin:0, color:'#64748b', fontSize:'0.9rem'}}>Total a Cobrar</p>
             <div style={{fontSize:'2.5rem', fontWeight:'800', color:'#0f172a'}}>
                 ${Number(orden.total).toLocaleString()}
             </div>
             <p style={{margin:'5px 0 0 0', fontWeight:'600'}}>
                 {orden.paciente ? `${orden.paciente.apellido}, ${orden.paciente.nombre}` : orden.patientName}
             </p>
         </div>

         <div style={{marginBottom:'2rem'}}>
             <label style={{display:'block', marginBottom:'8px', fontWeight:'600', color:'#475569'}}>Método de Pago</label>
             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                 <button 
                    onClick={() => setMetodoPago('EFECTIVO')}
                    style={{
                        padding:'12px', borderRadius:'8px', border: metodoPago==='EFECTIVO' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        background: metodoPago==='EFECTIVO' ? '#dcfce7' : 'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontWeight:'600'
                    }}
                 >
                    <FaMoneyBillWave color={metodoPago==='EFECTIVO' ? '#16a34a' : '#64748b'} /> Efectivo
                 </button>
                 <button 
                    onClick={() => setMetodoPago('TARJETA')}
                    style={{
                        padding:'12px', borderRadius:'8px', border: metodoPago==='TARJETA' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                        background: metodoPago==='TARJETA' ? '#e0f2fe' : 'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontWeight:'600'
                    }}
                 >
                    <FaCreditCard color={metodoPago==='TARJETA' ? '#6366f1' : '#64748b'} /> Tarjeta
                 </button>
             </div>
         </div>

         <button 
            onClick={handleCobrar}
            disabled={cobrarMutation.isPending}
            style={{
                width:'100%', padding:'14px', background:'#0f172a', color:'white', border:'none', borderRadius:'8px',
                fontSize:'1.1rem', fontWeight:'600', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'8px'
            }}
         >
            {cobrarMutation.isPending ? 'Procesando...' : <><FaCheckCircle /> Confirmar Cobro</>}
         </button>
      </div>
    </div>
  );
}