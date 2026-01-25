import { useState } from 'react';
// Asegúrate de que estos hooks existan o estén simulados, si no la página se romperá
import { useFacturas } from '../hooks/useFacturas'; 
import { useFinanceMutations } from '../hooks/useFinanceMutations';

import useModal from '../../../hooks/useModal'; 
import useToast from '../../../hooks/useToast';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';

// Subcomponente para el formulario de pago dentro del Modal
const PaymentForm = ({ factura, onSubmit, onCancel }) => {
  const [metodo, setMetodo] = useState('EFECTIVO');
  
  return (
    <div className="payment-form">
      <div className="payment-summary">
        <p>Paciente: <strong>{factura.paciente?.nombre} {factura.paciente?.apellido}</strong></p>
        <p className="total-big">Total a Pagar: <span>${factura.total}</span></p>
      </div>
      
      <div className="field">
        <label>Método de Pago</label>
        <select value={metodo} onChange={(e) => setMetodo(e.target.value)} className="input-modern">
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta Débito/Crédito</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="OBRA_SOCIAL">Obra Social</option>
        </select>
      </div>

      <div className="modal-actions" style={{marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" onClick={() => onSubmit({ metodoPago: metodo })}>
          Confirmar Cobro
        </button>
      </div>
    </div>
  );
};

export default function CajaPage() {
  const [page, setPage] = useState(1);
  
  // Si no tienes el backend listo, esto dará error. 
  // Si quieres ver la maqueta, comenta estas lineas y usa datos falsos en 'data'
  const { data, isLoading } = useFacturas({ page, estado: 'PENDIENTE_PAGO' });
  const { cobrar } = useFinanceMutations();
  
  const { showModal } = useModal();
  const { showToast } = useToast();

  const handleCobrarClick = (factura) => {
    showModal({
      title: `Cobrar Orden #${factura.id}`,
      type: 'custom', 
      className: 'admin-modal-card', // Clase para estilo blanco
      component: (
        <PaymentForm 
          factura={factura} 
          onCancel={() => showModal(null)}
          onSubmit={async (datos) => {
            try {
              await cobrar.mutateAsync({ id: factura.id, payload: datos });
              showToast('Cobro registrado exitosamente', 'success');
              showModal(null);
            } catch (error) {
              console.error(error);
              showToast('Error al procesar el cobro', 'error');
            }
          }}
        />
      )
    });
  };

  if (isLoading) return (
     <div style={{display:'flex', justifyContent:'center', marginTop: '50px'}}>
        <Lottie animationData={loadingAnim} style={{ width: 150 }} />
     </div>
  );

  return (
    <div className="caja-page" style={{padding: '2rem'}}>
      <header className="page-header" style={{marginBottom: '2rem'}}>
        <h2 style={{fontSize: '1.8rem'}}>Caja / Facturación</h2>
        <p style={{color: '#666'}}>Órdenes pendientes de cobro enviadas por odontólogos.</p>
      </header>

      <div className="card table-responsive">
        <table className="tabla-finanzas table-modern">
          <thead>
            <tr>
              <th>Orden #</th>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Odontólogo</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(!data?.data || data?.data?.length === 0) ? (
              <tr><td colSpan="6" className="text-center" style={{padding: '2rem'}}>No hay cobros pendientes</td></tr>
            ) : (
              data?.data?.map(factura => (
                <tr key={factura.id}>
                  <td>#{factura.id}</td>
                  <td>{new Date(factura.createdAt).toLocaleDateString()}</td>
                  <td>
                    <strong>{factura.paciente?.apellido}, {factura.paciente?.nombre}</strong>
                    <br/><small style={{color:'#888'}}>DNI: {factura.paciente?.dni}</small>
                  </td>
                  <td>Dr. {factura.odontologo?.apellido}</td>
                  <td className="monto" style={{fontWeight:'bold', color: '#10b981'}}>${factura.total}</td>
                  <td>
                    <button 
                      className="btn-primary btn-sm"
                      onClick={() => handleCobrarClick(factura)}
                    >
                      💰 Cobrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}