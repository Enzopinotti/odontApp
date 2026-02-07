import React, { useState, useContext } from 'react';
import { AuthCtx } from '../../../context/AuthProvider';
import { FaHistory, FaFileInvoiceDollar, FaPlusCircle, FaArrowLeft } from 'react-icons/fa';

// Componentes
import PresupuestoForm from '../components/PresupuestoForm';
import FinanceHistory from '../components/FinanceHistory';
import BillingQueue from '../components/BillingQueue';

// Estilos (Asegúrate de que este archivo exista)
import '../../../styles/_finanzas.scss';

export default function FinancePage({ initialPatient = null, isModal = false, onCloseModal }) {
  const { user } = useContext(AuthCtx);

  // --- Lógica de Roles ---
  const rolRaw = user?.Rol?.nombre || '';
  const rol = rolRaw.toUpperCase();
  // Admin y Recepcionista pueden cobrar
  const canCobrar = rol.includes('ADMIN') || rol.includes('RECEP');

  // --- Estado Inicial ---
  const getInitialTab = () => {
    if (initialPatient) return 'NUEVO';
    if (canCobrar) return 'COLA_COBRO';
    return 'HISTORIAL';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [viewingOrder, setViewingOrder] = useState(null);

  // --- Render: Modal (Pop-up) ---
  if (isModal) {
     return (
        <div style={{ padding: '10px' }}>
           <PresupuestoForm 
             initialPatient={initialPatient} 
             onCancel={onCloseModal} 
             onSuccess={onCloseModal} 
           />
        </div>
     );
  }

  // --- Render: Ver Detalle ---
  if (viewingOrder) {
      return (
          <div className="finance-container">
              <div className="finance-header-nav">
                  <div className="page-title">
                      <button 
                        onClick={() => setViewingOrder(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                          <FaArrowLeft /> Volver
                      </button>
                      <h1>Detalle Orden #{viewingOrder.id}</h1>
                  </div>
              </div>
              <div className="finance-content animate__animated animate__fadeIn">
                  <PresupuestoForm 
                    initialData={viewingOrder} 
                    readOnly={true} 
                    onCancel={() => setViewingOrder(null)} 
                  />
              </div>
          </div>
      );
  }

  // --- Render: Página Principal ---
  return (
    <div className="finance-container">
      <div className="finance-header-nav">
         <div className="page-title">
            <h1>Gestión Financiera</h1>
            <p>
                {canCobrar ? 'Caja y Cobranza' : 'Generación de Órdenes'}
            </p>
         </div>
         
         {/* ✅ AQUÍ ESTÁN TUS CLASES ORIGINALES RECUPERADAS */}
         <div className="tabs">
            {/* Botón Nueva Orden */}
            <button 
                className={activeTab === 'NUEVO' ? 'active' : ''} 
                onClick={() => setActiveTab('NUEVO')}
            >
               <FaPlusCircle /> Nueva Orden
            </button>
            
            {/* Botón Caja (Solo Admin/Recep) */}
            {canCobrar && (
               <button 
                   className={activeTab === 'COLA_COBRO' ? 'active' : ''} 
                   onClick={() => setActiveTab('COLA_COBRO')}
               >
                  <FaFileInvoiceDollar /> Caja / Pendientes
               </button>
            )}
            
            {/* Botón Historial */}
            <button 
                className={activeTab === 'HISTORIAL' ? 'active' : ''} 
                onClick={() => setActiveTab('HISTORIAL')}
            >
               <FaHistory /> Historial General
            </button>
         </div>
      </div>

      <div className="finance-content">
         {activeTab === 'NUEVO' && (
            <div className="animate__animated animate__fadeIn">
                <PresupuestoForm 
                    initialPatient={initialPatient} 
                    onSuccess={() => {
                        // Al guardar, si puede cobrar va a Caja, sino a Historial
                        setActiveTab(canCobrar ? 'COLA_COBRO' : 'HISTORIAL');
                    }}
                />
            </div>
         )}
         
         {activeTab === 'COLA_COBRO' && canCobrar && (
             <div className="animate__animated animate__fadeIn">
                 {/* Pasamos la función onView para ver detalles */}
                 <BillingQueue onView={(orden) => setViewingOrder(orden)} />
             </div>
         )}
         
         {activeTab === 'HISTORIAL' && (
             <div className="animate__animated animate__fadeIn">
                 <FinanceHistory onView={(orden) => setViewingOrder(orden)} />
             </div>
         )}
      </div>
    </div>
  );
}