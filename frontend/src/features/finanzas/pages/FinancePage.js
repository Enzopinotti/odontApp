import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { 
  FaTrash, FaPrint, FaPaperPlane, FaMoneyBillWave, FaLock, 
  FaUserCheck, FaUserPlus, FaEnvelope, FaFilePdf, FaHistory, 
  FaCheckCircle, FaClock, FaSearch, FaSyncAlt, FaShieldAlt, FaFilter, FaCalendarAlt 
} from 'react-icons/fa'; 
import { useQuery } from '@tanstack/react-query';

// Contextos y Hooks Reales
import { AuthCtx } from '../../../context/AuthProvider';
import useToast from '../../../hooks/useToast';
import { usePacientes } from '../../pacientes/hooks/usePacientes'; 
import { useFinanceMutations, useFacturas } from '../hooks/useFinanceMutations';
import useTratamientosQuery from '../../odontograma/hooks/useTratamientosQuery';

// Componentes
import ModernSelect from '../../../components/ModernSelect'; 
import '../../../styles/_financePage.scss'; 

const FinancePage = ({ initialPatient = null, isModal = false, onClose = null }) => {
  const { user } = useContext(AuthCtx); 
  const { showToast } = useToast();
  const printRef = useRef();
  
  const userRole = user?.Rol?.nombre?.toUpperCase();
  const isOdontologo = userRole === 'ODONTOLOGO' || userRole === 'PROFESIONAL';

  // --- 1. ESTADOS DE CARGA / EDICIÓN ---
  const [selectedId, setSelectedId] = useState(null); 
  const [pacienteConfirmado, setPacienteConfirmado] = useState(null); 
  const [obraSocial, setObraSocial] = useState(""); 
  const [itemsFactura, setItemsFactura] = useState([]); 
  const [tratamientoSeleccionadoId, setTratamientoSeleccionadoId] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // --- 2. ESTADOS DE FILTROS AVANZADOS (HISTORIAL) ---
  const [filtros, setFiltros] = useState({
    busqueda: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "TODOS"
  });

  // --- 3. CARGA DE DATOS ---
  const { data: pacientesList, isLoading: loadingPacientes } = usePacientes();
  const { data: resTratamientos } = useTratamientosQuery();
  
  // Normalización de datos para evitar errores .map
  const tratamientosDB = Array.isArray(resTratamientos?.data) ? resTratamientos.data : [];
  
  const { data: facturasGlobales, isLoading: loadingGlobal } = useFacturas(
    !isModal ? { odontologoId: user?.id } : null
  );

  const { crearOrden, nuevoPresupuesto } = useFinanceMutations();

  // --- 4. PREPARACIÓN Y FILTRADO ---
  const pacientesOptions = useMemo(() => {
    const actualData = Array.isArray(pacientesList) ? pacientesList : (pacientesList?.data || []);
    return actualData.map(p => ({
      id: p.id,
      label: `${p.apellido}, ${p.nombre}`,
      originalData: p 
    }));
  }, [pacientesList]);

  const historialFiltrado = useMemo(() => {
    let data = facturasGlobales?.data || [];

    if (filtros.busqueda) {
      const b = filtros.busqueda.toLowerCase();
      data = data.filter(h => 
        h.paciente?.nombre?.toLowerCase().includes(b) ||
        h.paciente?.apellido?.toLowerCase().includes(b) ||
        h.paciente?.dni?.includes(b) ||
        h.paciente?.obraSocial?.toLowerCase().includes(b)
      );
    }

    if (filtros.estado !== "TODOS") {
      data = data.filter(h => h.estado === filtros.estado);
    }

    if (filtros.fechaInicio) {
      data = data.filter(h => new Date(h.createdAt) >= new Date(filtros.fechaInicio));
    }
    if (filtros.fechaFin) {
      const fechaFinTope = new Date(filtros.fechaFin);
      fechaFinTope.setHours(23, 59, 59);
      data = data.filter(h => new Date(h.createdAt) <= fechaFinTope);
    }

    return data;
  }, [facturasGlobales, filtros]);

  // --- 5. EFECTOS ---
  useEffect(() => {
    if (initialPatient) {
      setPacienteConfirmado({
        id: initialPatient.id,
        label: `${initialPatient.apellido}, ${initialPatient.nombre}`,
        originalData: initialPatient
      });
      setObraSocial(initialPatient.obraSocial || "Particular");
      setSelectedId(initialPatient.id);
    }
  }, [initialPatient]);

  // --- 6. MANEJADORES ---
  const handleCargarPaciente = () => {
    if (selectedId) {
      const encontrado = pacientesOptions.find(o => String(o.id) === String(selectedId));
      if (encontrado) {
        setPacienteConfirmado(encontrado);
        setObraSocial(encontrado.originalData?.obraSocial || "Particular");
        showToast('Paciente cargado', 'success');
      }
    } else {
      setPacienteConfirmado({ id: null, label: "Paciente Eventual", originalData: { dni: "S/D" } });
      setObraSocial("Particular");
      showToast('Modo eventual activado', 'info');
    }
  };

  const handleReCargarFactura = (f) => {
    setPacienteConfirmado({ 
        id: f.patientId, 
        label: `${f.paciente?.apellido}, ${f.paciente?.nombre}`, 
        originalData: f.paciente 
    });
    setObraSocial(f.paciente?.obraSocial || "Particular");
    setItemsFactura(f.items?.map(i => ({ 
        id: i.treatmentId, 
        nombre: i.tratamiento?.nombre || "Servicio", 
        precio: parseFloat(i.precioUnitario), 
        uniqueId: i.id 
    })) || []);
    setSelectedId(f.patientId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Documento re-cargado para edición', 'success');
  };

  const handleAgregarItem = (e) => {
    e.preventDefault();
    if (!tratamientoSeleccionadoId) return;
    const itemData = tratamientosDB.find(t => String(t.id) === String(tratamientoSeleccionadoId));
    if (itemData) {
      setItemsFactura(prev => [...prev, { id: itemData.id, nombre: itemData.nombre, precio: parseFloat(itemData.precio), uniqueId: Date.now() }]);
      setTratamientoSeleccionadoId("");
    }
  };

  const totalCalculado = useMemo(() => itemsFactura.reduce((acc, item) => acc + item.precio, 0), [itemsFactura]);

  const handleGuardar = async () => {
    if (!pacienteConfirmado || itemsFactura.length === 0) return;
    const payload = {
        patientId: pacienteConfirmado.id,
        items: itemsFactura.map(i => ({ treatmentId: i.id, cantidad: 1 })),
        observaciones,
        obraSocial // Incluimos la OS seleccionada
    };
    try {
        if (isOdontologo) await nuevoPresupuesto.mutateAsync(payload);
        else await crearOrden.mutateAsync(payload);
        showToast('Guardado con éxito', 'success');
        if (isModal) onClose();
        else {
            setItemsFactura([]);
            setPacienteConfirmado(null);
            setSelectedId(null);
        }
    } catch (error) { showToast('Error al procesar', 'error'); }
  };

  const handleSendEmail = () => {
    const email = pacienteConfirmado?.originalData?.email || "";
    const subject = `Presupuesto Odontológico - ${pacienteConfirmado?.label}`;
    const body = `Hola ${pacienteConfirmado?.label},\n\nDetalle:\n` + 
                 itemsFactura.map(i => `- ${i.nombre}: $${i.precio}`).join('\n') + 
                 `\n\nTotal: $${totalCalculado}\n\nSaludos.`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className={isModal ? "finance-modal-wrapper" : "finance-page-container"}>
      {!isModal && <header className="finance-header no-print"><h1>Gestión de Facturación</h1></header>}

      <div className="finance-layout" style={isModal ? { gridTemplateColumns: '1fr 1.5fr', gap: '20px' } : {}}>
        
        {/* PANEL IZQUIERDO: CARGA */}
        <div className="finance-controls no-print">
          <div className="card control-card">
            <h3>1. Datos del Paciente</h3>
            <div className="patient-selector">
              {initialPatient ? (
                 <div className="locked-patient-box" style={{background:'#f1f5f9', padding:'12px', borderRadius:'8px', display:'flex', justifyContent:'space-between', border: '1px solid #cbd5e1'}}>
                    <strong>{initialPatient.apellido}, {initialPatient.nombre}</strong><FaLock color="#94a3b8"/>
                 </div>
              ) : (
                 <>
                    <ModernSelect placeholder="Buscar paciente..." options={pacientesOptions} value={selectedId} onChange={setSelectedId} searchable={true} />
                    <button type="button" className="btn-primary" style={{width: '100%', marginTop: '10px', backgroundColor: selectedId ? '#4f46e5' : '#10b981' }} onClick={handleCargarPaciente}>
                        {selectedId ? <><FaUserCheck /> Cargar Paciente</> : <><FaUserPlus /> Cargar como Eventual</>}
                    </button>
                 </>
              )}
            </div>

            <div className="field-os" style={{marginTop: '1.5rem'}}>
                <label style={{fontSize:'0.8rem', fontWeight:'bold', color:'#666'}}><FaShieldAlt /> Obra Social</label>
                <select className="input-modern" value={obraSocial} onChange={e => setObraSocial(e.target.value)} disabled={!pacienteConfirmado} style={{width:'100%', padding:'8px', borderRadius:'8px', marginTop:'5px'}}>
                    <option value="">-- Seleccionar --</option>
                    <option value="Particular">Particular / Sin Obra Social</option>
                    <option value="OSDE">OSDE</option>
                    <option value="SWISS_MEDICAL">Swiss Medical</option>
                    <option value="GALENO">Galeno</option>
                    <option value="PAMI">PAMI</option>
                    <option value="IOMA">IOMA</option>
                </select>
            </div>
          </div>

          <div className="card control-card">
            <h3>2. Tratamientos</h3>
            <form onSubmit={handleAgregarItem}>
              <select className="input-modern" value={tratamientoSeleccionadoId} onChange={(e) => setTratamientoSeleccionadoId(e.target.value)} disabled={!pacienteConfirmado} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px'}}>
                <option value="">{!pacienteConfirmado ? '⚠️ Cargue paciente' : 'Seleccionar...'}</option>
                {tratamientosDB.map(t => <option key={t.id} value={t.id}>{t.nombre} - ${t.precio}</option>)}
              </select>
              <button className="btn-secondary" style={{width: '100%', padding: '10px', borderRadius: '8px'}} disabled={!tratamientoSeleccionadoId}>+ Agregar</button>
            </form>
          </div>
        </div>

        {/* PANEL DERECHO: HOJA */}
        <div className="finance-preview">
          <div className="invoice-paper" ref={printRef} style={{ minHeight: 'auto', padding: '2rem' }}>
            <div className="invoice-header" style={{borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '1.5rem'}}>
              <div className="doc-brand">
                  <h2 style={{margin:0}}>{isOdontologo ? 'PRESUPUESTO' : 'ORDEN DE COBRO'}</h2>
                  <small style={{color: '#666'}}>Documento de validez interna</small>
              </div>
              <div className="invoice-meta" style={{textAlign: 'right', fontSize: '0.9rem'}}>
                <p><strong>Paciente:</strong> {pacienteConfirmado ? pacienteConfirmado.label : '---'}</p>
                <p><strong>DNI:</strong> {pacienteConfirmado?.originalData?.dni || '---'}</p>
                <p><strong>Cobertura:</strong> {obraSocial || 'Particular'}</p>
                <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="table-container" style={{minHeight: '150px'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead><tr style={{borderBottom: '1px solid #000'}}><th align="left">Descripción</th><th align="right">Importe</th><th className="no-print"></th></tr></thead>
                <tbody>
                    {itemsFactura.map((item) => (
                        <tr key={item.uniqueId} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '10px 0'}}>{item.nombre}</td>
                            <td align="right">${item.precio.toLocaleString()}</td>
                            <td className="no-print" align="right"><button onClick={() => setItemsFactura(prev => prev.filter(i => i.uniqueId !== item.uniqueId))} style={{background:'none', border:'none', color:'red'}}><FaTrash /></button></td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>

            <div className="invoice-footer" style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end'}}>
                <div style={{width: '200px', fontSize: '1.1rem', fontWeight: 'bold', borderTop: '2px solid #333', paddingTop: '8px', display: 'flex', justifyContent: 'space-between'}}>
                    <span>Total</span> <span>${totalCalculado.toLocaleString()}</span>
                </div>
            </div>
            
            <div className="actions-footer no-print" style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #ccc', paddingTop: '1.5rem'}}>
                <div className="export-tools" style={{display: 'flex', gap: '10px'}}>
                    <button className="btn ghost" onClick={() => window.print()} disabled={itemsFactura.length === 0}><FaFilePdf /> PDF</button>
                    <button className="btn ghost" onClick={handleSendEmail} disabled={!pacienteConfirmado}><FaEnvelope /> Email</button>
                </div>
                <div className="main-actions" style={{display: 'flex', gap: '10px'}}>
                    <button className="btn-primary" style={{ backgroundColor: isOdontologo ? '#6366f1' : '#10b981', padding: '10px 20px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold' }} 
                        disabled={!pacienteConfirmado || !obraSocial || itemsFactura.length === 0} onClick={handleGuardar}>
                        Confirmar {isOdontologo ? 'Presupuesto' : 'Cobro'}
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SECCIÓN DE HISTORIAL CON FILTROS MEJORADOS */}
      {!isModal && (
          <div className="finance-history card no-print" style={{marginTop: '3rem'}}>
            <div className="card-header-v2" style={{marginBottom: '1.5rem'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem'}}>
                    <FaHistory /> <h3>Historial Profesional</h3>
                </div>
                
                {/* 🔍 PANEL DE FILTROS DINÁMICOS */}
                <div className="filters-grid" style={{display:'flex', flexWrap:'wrap', gap:'15px', background:'#f8fafc', padding:'15px', borderRadius:'8px'}}>
                    <div className="filter-item" style={{flex:'1', minWidth:'200px', position:'relative'}}>
                        <FaSearch style={{position:'absolute', left:'10px', top:'12px', color:'#94a3b8'}} />
                        <input type="text" placeholder="Paciente, DNI o OS..." className="input-modern" style={{paddingLeft:'35px', width:'100%'}} 
                               value={filtros.busqueda} onChange={e => setFiltros({...filtros, busqueda: e.target.value})} />
                    </div>
                    
                    <div className="filter-item">
                        <select className="input-modern" value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})}>
                            <option value="TODOS">Todos los Estados</option>
                            <option value="PAGADO">Pagados</option>
                            <option value="PENDIENTE_PAGO">Pendientes</option>
                        </select>
                    </div>

                    <div className="filter-item" style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <FaCalendarAlt color="#64748b" />
                        <input type="date" className="input-modern" value={filtros.fechaInicio} onChange={e => setFiltros({...filtros, fechaInicio: e.target.value})} />
                        <span>a</span>
                        <input type="date" className="input-modern" value={filtros.fechaFin} onChange={e => setFiltros({...filtros, fechaFin: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table-modern">
                <thead>
                    <tr><th>Fecha</th><th>Paciente / DNI</th><th>Obra Social</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    {loadingGlobal ? (
                        <tr><td colSpan="6" style={{textAlign:'center'}}>Cargando registros...</td></tr>
                    ) : historialFiltrado.map(f => (
                        <tr key={f.id}>
                            <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                            <td><strong>{f.paciente?.apellido}, {f.paciente?.nombre}</strong><br/><small>{f.paciente?.dni}</small></td>
                            <td><span className="pill-os">{f.paciente?.obraSocial || 'Particular'}</span></td>
                            <td style={{fontWeight:'bold'}}>${Number(f.total).toLocaleString()}</td>
                            <td>
                                <span className={`badge ${f.estado === 'PAGADO' ? 'badge-green' : 'badge-yellow'}`}>
                                    {f.estado === 'PAGADO' ? <FaCheckCircle /> : <FaClock />} {f.estado.replace('_',' ')}
                                </span>
                            </td>
                            <td>
                                <button className="btn-sync" onClick={() => handleReCargarFactura(f)} style={{display:'flex', alignItems:'center', gap:'5px', color:'#4f46e5', background:'none', border:'none', cursor:'pointer', fontWeight:'600'}}>
                                    <FaSyncAlt /> Re-cargar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
      )}
    </div>
  );
};

export default FinancePage;