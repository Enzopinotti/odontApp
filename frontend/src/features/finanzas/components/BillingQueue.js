import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaEye, FaCheckCircle, FaSync } from 'react-icons/fa';
import { finanzasApi } from '../api/finanzasApi'; 
// 1. IMPORTAMOS EL NUEVO MODAL
import PaymentModal from './PaymentModal';

export default function BillingQueue({ onView }) {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. ESTADO PARA CONTROLAR EL MODAL
  // Si tiene datos, el modal se abre. Si es null, se cierra.
  const [ordenParaCobrar, setOrdenParaCobrar] = useState(null);

  // --- CARGAR DATOS ---
  const fetchPendientes = async () => {
    try {
      setLoading(true);
      const res = await finanzasApi.getPendientesCobro();
      const data = Array.isArray(res) ? res : (res.data || []);
      setPendientes(data);
    } catch (error) {
      console.error("Error cargando cola:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  // --- ABRIR MODAL ---
  const handleClickCobrar = (orden) => {
    setOrdenParaCobrar(orden);
  };

  // --- CONFIRMAR COBRO (Viene del Modal) ---
  const handleConfirmarCobro = async (datosPago) => {
    if (!ordenParaCobrar) return;

    try {
      // 3. ENVIAMOS LOS DATOS REALES (Método, etc)
      await finanzasApi.cobrarOrden(ordenParaCobrar.id, {
        metodoPago: datosPago.metodoPago, 
        // A futuro, aquí mandarás datosPago.generarFacturaFiscal al backend
      });
      
      alert(`✅ Cobro registrado con ${datosPago.metodoPago}`);
      
      // Cerrar modal y recargar lista
      setOrdenParaCobrar(null);
      await fetchPendientes();

    } catch (error) {
      console.error(error);
      alert('❌ Error al cobrar: ' + (error.response?.data?.message || error.message));
    }
  };

  /* --- ESTILOS EN LÍNEA (Mantenemos tu diseño) --- */
  const styles = {
    container: { padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' },
    title: { fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' },
    refreshBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#4b5563', fontWeight: '500' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', padding: '12px', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '600', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#374151' },
    btnCobrar: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' },
    btnVer: { background: 'none', border: '1px solid #d1d5db', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#6b7280', marginRight: '8px' }
  };

  if (loading && pendientes.length === 0) return <div style={{padding: 20}}>Cargando...</div>;

  return (
    <>
      <div style={styles.container} className="animate__animated animate__fadeIn">
        <div style={styles.header}>
          <h3 style={styles.title}><FaMoneyBillWave color="#10b981" /> Cola de Cobro (Pendientes)</h3>
          <button style={styles.refreshBtn} onClick={fetchPendientes}><FaSync /> Actualizar</button>
        </div>

        {pendientes.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '8px'}}>
            <p>No hay órdenes pendientes de cobro.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Profesional</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((orden) => (
                  <tr key={orden.id}>
                    <td style={styles.td}>{new Date(orden.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <strong>{orden.paciente ? `${orden.paciente.apellido}, ${orden.paciente.nombre}` : (orden.patientName || 'Paciente Eventual')}</strong>
                    </td>
                    <td style={styles.td}>
                      {orden.odontologo?.Usuario ? `Dr. ${orden.odontologo.Usuario.apellido}` : <span style={{color: '#9ca3af'}}>Clínica</span>}
                    </td>
                    <td style={styles.td}>
                      <span style={{color: '#059669', fontWeight: 'bold', fontSize: '1.1em'}}>${Number(orden.total).toLocaleString()}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <button style={styles.btnVer} onClick={() => onView(orden)} title="Ver detalle"><FaEye /></button>
                        
                        {/* BOTÓN AHORA ABRE EL MODAL */}
                        <button style={styles.btnCobrar} onClick={() => handleClickCobrar(orden)}>
                          <FaCheckCircle /> COBRAR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. RENDERIZADO DEL MODAL */}
      {ordenParaCobrar && (
        <PaymentModal 
          orden={ordenParaCobrar}
          onCancel={() => setOrdenParaCobrar(null)}
          onConfirm={handleConfirmarCobro}
        />
      )}
    </>
  );
}