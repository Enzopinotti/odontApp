import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { finanzasApi } from '../api/finanzasApi';
import StatusBadge from './StatusBadge';
import { FaSearch, FaEye } from 'react-icons/fa';

export default function FinanceHistory({ onView }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['facturas', 'historial', page, search],
    queryFn: () => finanzasApi.getFacturas({ page, limit: 10, search }),
    keepPreviousData: true
  });

  const historial = data?.data || [];

  return (
    <div className="animate__animated animate__fadeIn">
      <div style={{marginBottom:'1.5rem', display:'flex', gap:'15px', alignItems:'center'}}>
         <div style={{position:'relative', flex:1, maxWidth:'400px'}}>
            <FaSearch style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}} />
            <input 
              type="text" 
              placeholder="Buscar por Apellido, DNI o Nombre..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{width:'100%', padding:'12px 12px 12px 40px', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none', fontSize:'0.95rem'}}
            />
         </div>
      </div>
      <div className="finance-table-card">
        {isLoading ? (
           <div style={{padding:'3rem', textAlign:'center', color:'#64748b'}}>Cargando historial...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Odontólogo</th>
                <th>Total</th>
                <th>Estado</th>
                <th style={{textAlign:'right'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.length === 0 ? (
                 <tr><td colSpan="6" style={{textAlign:'center', padding:'3rem', color:'#94a3b8'}}>No se encontraron registros.</td></tr>
              ) : (
                historial.map((f) => (
                  <tr key={f.id}>
                    <td className="text-mono">{new Date(f.createdAt).toLocaleDateString()}</td>
                    
                    {/* 👇 AQUÍ ARREGLAMOS LA COMA */}
                    <td>
                      {f.paciente ? (
                          <>
                            <strong>{f.paciente.apellido}, {f.paciente.nombre}</strong>
                            <div style={{fontSize:'0.75rem', color:'#64748b'}}>{f.paciente.dni || 'Sin DNI'}</div>
                          </>
                      ) : (
                          <>
                            <strong>{f.patientName || 'Paciente Eventual'}</strong>
                            <div style={{fontSize:'0.75rem', color:'#6366f1', fontWeight:'600'}}>MANUAL / EVENTUAL</div>
                          </>
                      )}
                    </td>

                    <td>{f.odontologo?.apellido || 'Sistema'}</td>
                    <td className="font-bold">${Number(f.total).toLocaleString()}</td>
                    <td><StatusBadge status={f.estado} /></td>
                    <td style={{textAlign:'right'}}>
                      <button 
                         onClick={() => onView && onView(f)} 
                         style={{color:'#6366f1', background:'none', border:'none', cursor:'pointer', fontWeight:'600', display:'inline-flex', alignItems:'center', gap:'5px'}}
                      >
                         <FaEye /> Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Paginación simple */}
      <div style={{marginTop:'1.5rem', display:'flex', justifyContent:'center', gap:'10px', alignItems:'center'}}>
         <button onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={page===1} style={{padding:'8px 15px', border:'1px solid #e2e8f0', background:'white', borderRadius:'6px', cursor:'pointer'}}>Anterior</button>
         <span style={{color:'#64748b', fontWeight:'600'}}>Página {page}</span>
         <button onClick={()=>setPage(p=>p+1)} disabled={historial.length < 10} style={{padding:'8px 15px', border:'1px solid #e2e8f0', background:'white', borderRadius:'6px', cursor:'pointer'}}>Siguiente</button>
      </div>
    </div>
  );
}