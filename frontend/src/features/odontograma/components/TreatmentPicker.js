import { useMemo, useState, useEffect } from 'react';
import useTratamientosQuery from '../hooks/useTratamientosQuery';
import { useOdontologos } from '../../admin/hooks/useOdontologos';
import useAuth from '../../auth/hooks/useAuth';
import { COLORS } from '../constants';
import {
  FaSearch, FaTimes, FaStethoscope,
  FaCheckCircle, FaHourglassHalf, FaUserMd, FaChevronLeft,
  FaMapMarkerAlt, FaFileAlt, FaMoneyBillWave
} from 'react-icons/fa';
import ModernSelect from '../../../components/ModernSelect';

export default function TreatmentPicker({ dienteSeleccionado, selectedFaces = [], onApplied, onClose }) {
  const { user } = useAuth();
  const { data: tratamientos, isLoading } = useTratamientosQuery();
  const { data: dentistsData } = useOdontologos();

  const dentists = (dentistsData?.data || []).map(d => ({ id: d.id, label: `${d.apellido}, ${d.nombre}` }));

  const [step, setStep] = useState(1); // 1: List, 2: Confirm
  const [selectedT, setSelectedT] = useState(null);
  const [estado, setEstado] = useState('Planificado');
  const [query, setQuery] = useState('');
  const [profesionalId, setProfesionalId] = useState('');

  useEffect(() => {
    if (user && !profesionalId) setProfesionalId(user.id);
  }, [user, profesionalId]);

  const filtered = useMemo(() => {
    const list = tratamientos?.data || [];
    const q = query.toLowerCase();
    return list.filter(t => t.nombre.toLowerCase().includes(q) || t.config?.sigla?.toLowerCase().includes(q));
  }, [tratamientos, query]);

  const onSelectTreatment = (t) => { setSelectedT(t); setStep(2); };

  const onFinalApply = () => {
    if (!dienteSeleccionado || !selectedT) return;
    if (!profesionalId) return alert('Debes seleccionar un profesional responsable.');

    const config = typeof selectedT.config === 'string' ? JSON.parse(selectedT.config) : (selectedT.config || {});
    const finalColor = estado === 'Realizado' ? (config.colorRealizado || COLORS.realizado) : (config.colorPlanificado || COLORS.planificado);

    onApplied?.({
      ...selectedT,
      _estado: estado,
      _color: finalColor,
      _profesionalId: profesionalId
    });
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <aside className="admin-modal-card large pro-flow" onClick={e => e.stopPropagation()}>
        <header className="am-head">
          <div className="am-title">
            <FaStethoscope />
            <div>
              <h3>{step === 1 ? 'Catálogo de Servicios' : 'Confirmar Intervención'}</h3>
              <p>Pieza FDI {dienteSeleccionado?._fdi || '—'}</p>
            </div>
          </div>
          <button className="close-x" onClick={onClose}><FaTimes /></button>
        </header>

        <div className="am-body">
          {step === 1 ? (
            <div className="step-list">
              <div className="tm-search sticky">
                <FaSearch className="si" />
                <input
                  placeholder="Buscar por nombre o código..."
                  aria-label="Buscar tratamientos"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {isLoading ? <div className="tm-status-msg">Cargando catálogo clínico...</div> : (
                <div className="tm-grid">
                  {filtered.map(t => {
                    const cfg = typeof t.config === 'string' ? JSON.parse(t.config) : (t.config || {});
                    return (
                      <button key={t.id} className="tm-item-card" onClick={() => onSelectTreatment(t)}>
                        <div className="item-top">
                          <span className="item-sigla" style={{ background: cfg.colorRealizado || '#1d4ed8' }}>{cfg.sigla || 'TR'}</span>
                          <span className="item-price">${Math.round(t.precio).toLocaleString('es-AR')}</span>
                        </div>
                        <div className="item-name">{t.nombre}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="step-confirm animate-fade-in">
              <section className="summary-card gold">
                <div className="summary-row">
                  <div className="sum-icon"><FaFileAlt /></div>
                  <div className="sum-txt">
                    <strong>Tratamiento Seleccionado</strong>
                    <span className="main-val">{selectedT.nombre}</span>
                  </div>
                </div>

                <div className="summary-row">
                  <div className="sum-icon"><FaMapMarkerAlt /></div>
                  <div className="sum-txt">
                    <strong>Zona de Aplicación</strong>
                    <div className="confirm-faces-list">
                      {selectedFaces.length > 0 ? (
                        selectedFaces.map(f => <span key={f} className="face-tag">{f}</span>)
                      ) : (
                        <span className="face-tag global">Toda la pieza</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="summary-row">
                  <div className="sum-icon"><FaMoneyBillWave /></div>
                  <div className="sum-txt">
                    <strong>Inversión Estimada</strong>
                    <span className="price-val">${Math.round(selectedT.precio).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </section>

              <div className="confirm-options-grid">
                <div className="conf-field">
                  <label><FaUserMd /> Profesional Responsable</label>
                  <ModernSelect
                    options={dentists}
                    value={profesionalId}
                    onChange={setProfesionalId}
                    placeholder="Elegir profesional..."
                    searchable
                    icon={<FaUserMd />}
                  />
                </div>

                <div className="conf-field">
                  <label>Estado Final</label>
                  <div className="status-toggle-confirm">
                    <button className={`st-btn pl ${estado === 'Planificado' ? 'active' : ''}`} onClick={() => setEstado('Planificado')}>
                      <FaHourglassHalf /> Patologías
                    </button>
                    <button className={`st-btn re ${estado === 'Realizado' ? 'active' : ''}`} onClick={() => setEstado('Realizado')}>
                      <FaCheckCircle /> Realizado
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="am-footer">
          {step === 2 && <button className="btn-back" onClick={() => setStep(1)}><FaChevronLeft /> Volver</button>}
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          {step === 2 && (
            <button className="btn-confirm" onClick={onFinalApply}>
              Confirmar y Registrar
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}
