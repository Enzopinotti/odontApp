import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthCtx } from '../../../context/AuthProvider';
import useToast from '../../../hooks/useToast';
import { finanzasApi } from '../api/finanzasApi';
import api from '../../../api/axios'; 
import { FaTrash, FaPaperPlane, FaUserEdit, FaList, FaPrint, FaUserMd } from 'react-icons/fa';

export default function PresupuestoForm({ initialPatient = null, initialData = null, readOnly = false, onSuccess, onCancel }) {
  const { user } = useContext(AuthCtx);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  // -- ESTADOS --
  const [pacientesList, setPacientesList] = useState([]);
  const [tratamientosDb, setTratamientosDb] = useState([]);
  const [profesionales, setProfesionales] = useState([]); 
  
  // MODO MANUAL = MODO FANTASMA (Solo impresión)
  const [isManual, setIsManual] = useState(false); 
  const [manualName, setManualName] = useState(''); 
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatient?.id || initialData?.patientId || '');
  
  // SELECCIÓN DE ODONTÓLOGO
  const [selectedOdontologoId, setSelectedOdontologoId] = useState(initialData?.odontologoId || '');

  const [items, setItems] = useState(() => {
    if (!initialData || !initialData.items) return [];
    return initialData.items.map(i => ({
        uniqueId: i.id || Date.now() + Math.random(),
        id: i.treatmentId || i.id,
        nombre: i.tratamiento?.nombre || i.nombre || 'Tratamiento',
        precio: Number(i.precio || i.precioUnitario || 0)
    }));
  });
  
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || '');
  const [tratamientoSelect, setTratamientoSelect] = useState('');

  // -- 1. CARGAR DATOS INICIALES (Tratamientos y Profesionales) --
  useEffect(() => {
    if (!readOnly) {
        // Cargar Tratamientos
        api.get('/clinica/tratamientos')
            .then(res => {
               let lista = [];
               if (Array.isArray(res.data)) lista = res.data;
               else if (res.data && Array.isArray(res.data.data)) lista = res.data.data;
               setTratamientosDb(lista);
            })
            .catch(err => console.error("Error tratamientos:", err));

        // Cargar Odontólogos (Solo si soy Admin o Recep)
        const rol = user?.Rol?.nombre?.toUpperCase() || '';
        if (rol.includes('ADMIN') || rol.includes('RECEP')) {
            // Ajusta la ruta a tu API real de usuarios. 
            api.get('/usuarios') 
               .then(res => {
                   let todos = res.data.data || res.data || [];
                   // Filtramos solo los que tienen rol de Odontólogo (ID 2 usualmente)
                   // Ajusta la condición según tu estructura de roles o IDs
                   const doctores = todos.filter(u => u.rolId === 2 || u.Rol?.nombre === 'Odontólogo');
                   setProfesionales(doctores);
               })
               .catch(err => console.error("Error cargando profesionales:", err));
        }
    }
  }, [readOnly, user]);

  // -- 2. CARGA DE PACIENTES --
  useEffect(() => {
    if (!readOnly && !initialPatient && !isManual) {
        api.get('/clinica/pacientes?page=1&perPage=1000')
            .then(res => {
               let lista = [];
               const d = res.data;
               if (d.data && d.data.data && Array.isArray(d.data.data)) lista = d.data.data;
               else if (d.data && Array.isArray(d.data)) lista = d.data;
               else if (Array.isArray(d)) lista = d;
               setPacientesList(lista);
            })
            .catch((err) => {
               console.error("❌ Error cargando pacientes:", err);
               if(err.response?.status === 403) showToast('Falta permiso para ver pacientes', 'error');
               setPacientesList([]);
            });
    }
  }, [readOnly, initialPatient, isManual, showToast]);

  const crearOrdenMutation = useMutation({
    mutationFn: finanzasApi.crearOrden,
    onSuccess: () => {
      showToast('Orden enviada a recepción correctamente', 'success');
      queryClient.invalidateQueries(['facturas']);
      if (onSuccess) onSuccess();
      else { 
          setItems([]); 
          setObservaciones(''); 
          setSelectedPatientId('');
          setSelectedOdontologoId('');
      }
    },
    onError: (err) => showToast(err.message || 'Error al guardar', 'error')
  });

  const total = useMemo(() => items.reduce((acc, it) => acc + it.precio, 0), [items]);

  const handleAddItem = (e) => {
    const id = Number(e.target.value);
    if (!id) return;
    
    const t = tratamientosDb.find(x => x.id === id);
    if (t) {
        setItems(prev => [...prev, { 
            uniqueId: Date.now() + Math.random(), 
            id: t.id, 
            nombre: t.nombre, 
            precio: Number(t.precio) 
        }]);
    }
    setTratamientoSelect('');
  };

  const handleSubmit = () => {
    if (isManual) { 
        showToast('Los presupuestos manuales no se guardan.', 'info'); return; 
    }
    if (!selectedPatientId && !initialPatient) { 
        showToast('Seleccione un paciente', 'error'); return; 
    }
    if (items.length === 0) { 
        showToast('Agregue items', 'warning'); return; 
    }

    const payload = {
        patientId: initialPatient ? Number(initialPatient.id) : Number(selectedPatientId),
        patientName: null, 
        items: items.map(i => ({ treatmentId: i.id, precio: i.precio, cantidad: 1 })),
        observaciones,
        estado: 'ENVIADO',
        
        // Enviamos el ID del profesional seleccionado (o null)
        odontologoId: selectedOdontologoId ? Number(selectedOdontologoId) : null 
    };
    
    console.log("🚀 Enviando Payload:", payload);
    crearOrdenMutation.mutate(payload);
  };

  const handlePrint = () => {
      if (!manualName.trim()) { showToast('Escriba el nombre del interesado', 'warning'); return; }
      if (items.length === 0) { showToast('La lista está vacía', 'warning'); return; }
      window.print();
  };

  const getDisplayPatient = () => {
      if (initialData?.patientName) return initialData.patientName; 
      if (initialData?.paciente) return `${initialData.paciente.apellido}, ${initialData.paciente.nombre}`;
      return '---';
  };

  // ✅ CORRECCIÓN VISUAL: Determinar quién cargó la orden
  const creadorNombre = readOnly && initialData?.Usuario 
      ? `${initialData.Usuario.apellido}, ${initialData.Usuario.nombre}`
      : `${user?.apellido}, ${user?.nombre}`;

  return (
    <div className="paper-doc animate__animated animate__fadeInUp">
      <div className="doc-header">
        <div>
          <h2>{isManual ? 'Presupuesto' : (readOnly ? `Orden #${initialData?.id || ''}` : 'Orden Clínica')}</h2>
          <p style={{color: '#64748b'}}>
            Cargado por: <strong>{creadorNombre}</strong>
          </p>
        </div>
        <div className="doc-meta">
          <p><strong>Fecha:</strong> {new Date(initialData?.createdAt || Date.now()).toLocaleDateString()}</p>
          {isManual && <p className="no-print" style={{fontSize:'0.8rem', color:'#f59e0b'}}>Borrador (No válido como factura)</p>}
        </div>
      </div>

      <div style={{marginBottom: '2rem'}}>
        {/* FILA 1: PACIENTE */}
        <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
            <label style={{color:'#64748b', fontSize:'0.8rem', fontWeight:'700'}}>
                {isManual ? 'CLIENTE MANUAL' : 'PACIENTE REGISTRADO'}
            </label>
            
            {!readOnly && !initialPatient && (
                <button 
                    onClick={() => { setIsManual(!isManual); setSelectedPatientId(''); setManualName(''); }}
                    style={{background:'none', border:'none', color:'#6366f1', cursor:'pointer', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'5px'}}
                >
                    {isManual ? <><FaList/> Seleccionar Paciente</> : <><FaUserEdit/> Escribir Manual</>}
                </button>
            )}
        </div>
        
        {(initialPatient || readOnly) ? (
           <div style={{background: '#f8fafc', padding: '12px 15px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight:'600'}}>
              {initialPatient ? `${initialPatient.apellido}, ${initialPatient.nombre}` : getDisplayPatient()}
           </div>
        ) : isManual ? (
           <input 
              type="text"
              className="input-modern"
              placeholder="Nombre del interesado..."
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              autoFocus
              style={{width: '100%', padding: '12px', border:'1px dashed #6366f1', borderRadius:'8px', fontSize:'1rem', outline:'none', background:'#fefcff'}}
           />
        ) : (
           <select 
             className="input-modern" 
             value={selectedPatientId} 
             onChange={(e) => setSelectedPatientId(e.target.value)} 
             style={{width: '100%', padding: '12px', border:'1px solid #cbd5e1', borderRadius:'8px', fontSize:'1rem'}}
           >
              <option value="">-- Seleccionar Paciente --</option>
              {pacientesList.length > 0 ? (
                  pacientesList.map(p => (
                     <option key={p.id} value={p.id}>{p.apellido}, {p.nombre} {p.dni ? `- (${p.dni})` : ''}</option>
                  ))
              ) : (
                  <option disabled>Cargando pacientes...</option>
              )}
           </select>
        )}

        {/* FILA 2: PROFESIONAL (Solo visible para Admin/Recep en modo edición) */}
        {profesionales.length > 0 && !readOnly && !isManual && (
            <div style={{marginTop: '15px'}} className="no-print">
                 <label style={{color:'#64748b', fontSize:'0.8rem', fontWeight:'700', marginBottom:'5px', display:'block'}}>
                    <FaUserMd /> PROFESIONAL RESPONSABLE
                 </label>
                 <select 
                   value={selectedOdontologoId} 
                   onChange={(e) => setSelectedOdontologoId(e.target.value)} 
                   style={{width: '100%', padding: '12px', border:'1px solid #cbd5e1', borderRadius:'8px', fontSize:'1rem', backgroundColor:'#f0fdf4'}}
                 >
                    <option value="">-- Quien crea la orden (Yo) --</option>
                    {profesionales.map(p => (
                        <option key={p.id} value={p.id}>
                           Dr. {p.apellido}, {p.nombre}
                        </option>
                    ))}
                 </select>
                 <small style={{color:'#94a3b8', fontSize:'0.75rem'}}>Si lo dejas vacío, quedará como venta de mostrador / clínica.</small>
            </div>
        )}
      </div>

      <div className="doc-body">
        {!readOnly && (
            <div className="add-bar no-print" style={{marginBottom:'1rem'}}>
                 <select value={tratamientoSelect} onChange={handleAddItem} style={{width: '100%', padding: '12px', border:'1px solid #e2e8f0', borderRadius:'6px'}}>
                    <option value="">+ Agregar Tratamiento</option>
                    {tratamientosDb.length > 0 ? (
                        tratamientosDb.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.nombre} - ${Number(t.precio).toLocaleString()}
                            </option>
                        ))
                    ) : (
                        <option disabled>Cargando lista...</option>
                    )}
                 </select>
            </div>
        )}

        <table>
          <thead>
            <tr><th width="60%">Concepto</th><th width="30%" style={{textAlign:'right'}}>Valor</th>{!readOnly && <th width="10%" className="no-print"></th>}</tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.uniqueId}>
                <td>{item.nombre}</td>
                <td className="col-price">${item.precio.toLocaleString()}</td>
                {!readOnly && (<td style={{textAlign:'center'}} className="no-print"><button onClick={() => setItems(prev => prev.filter(x => x.uniqueId !== item.uniqueId))} className="btn-icon-danger"><FaTrash /></button></td>)}
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="3" style={{textAlign:'center', padding:'3rem', color:'#cbd5e1'}}>Sin items seleccionados</td></tr>}
          </tbody>
        </table>

        <div style={{marginTop:'2rem'}}>
            <label className="no-print" style={{fontWeight:'600', color:'#475569'}}>Observaciones</label>
            <textarea 
               rows="3" 
               placeholder="Observaciones..."
               value={observaciones} 
               onChange={e => setObservaciones(e.target.value)} 
               disabled={readOnly} 
               style={{width:'100%', padding:'10px', marginTop:'5px', borderRadius:'6px', border:'1px solid #e2e8f0', resize: 'none', background: readOnly ? '#f9f9f9' : 'white'}} 
            />
        </div>
      </div>

      <div className="doc-footer">
         <div className="total-box">
             <span className="label">Total {isManual ? 'Estimado' : ''}</span>
             <span className="amount">${(readOnly && items.length === 0 ? Number(initialData?.total || 0) : total).toLocaleString()}</span>
         </div>
         
         <div className="actions-floating no-print">
            {onCancel && <button onClick={onCancel} className="btn-ghost">{readOnly ? 'Cerrar' : 'Cancelar'}</button>}
            
            {!readOnly && (
                isManual ? (
                    <button className="btn-primary" onClick={handlePrint} style={{background:'#4f46e5'}}>
                        <FaPrint /> Imprimir / PDF
                    </button>
                ) : (
                    <button className="btn-primary" onClick={handleSubmit} disabled={crearOrdenMutation.isPending}>
                        {crearOrdenMutation.isPending ? '...' : <><FaPaperPlane /> Enviar a Caja</>}
                    </button>
                )
            )}
         </div>
      </div>
    </div>
  );
}