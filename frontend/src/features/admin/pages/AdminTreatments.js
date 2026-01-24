import { useState } from 'react';
import useTratamientosQuery from '../../odontograma/hooks/useTratamientosQuery';
import { FaPlus, FaSearch, FaEdit, FaTrashAlt, FaTag, FaUpload } from 'react-icons/fa';

import TreatmentFormModal from '../components/TreatmentFormModal';
import TreatmentImportModal from '../components/TreatmentImportModal';
import { eliminarTratamiento } from '../../../api/clinica';
import useToast from '../../../hooks/useToast';
import '../../../styles/_adminTreatments.scss';

export default function AdminTreatments() {
    const { showToast } = useToast();
    const { data: treatments, isLoading, refetch } = useTratamientosQuery();

    const [query, setQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = (treatments?.data || []).filter(t =>
        t.nombre.toLowerCase().includes(query.toLowerCase()) ||
        t.config?.sigla?.toLowerCase().includes(query.toLowerCase())
    );


    return (
        <div className="admin-treatments-view">
            <header className="view-action-bar">
                <div className="search-box-pro">
                    <FaSearch className="icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o sigla clínica..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="action-btns">
                    <button className="btn-secondary-pro" onClick={() => setShowImport(true)}><FaUpload /> Importar Excel</button>
                    <button className="btn-add-pro" onClick={() => { setEditing(null); setShowForm(true); }}><FaPlus /> Nuevo Servicio</button>
                </div>
            </header>


            <div className="treatments-grid">
                {isLoading ? (
                    <div className="loading-state">Obteniendo catálogo de servicios...</div>
                ) : filtered.map(t => {
                    const cfg = typeof t.config === 'string' ? JSON.parse(t.config) : (t.config || {});
                    return (
                        <div key={t.id} className="treatment-card-pro">
                            <div className="card-head">
                                <span className="sigla-badge" style={{ background: cfg.colorRealizado || '#1d4ed8' }}>{cfg.sigla || 'TR'}</span>
                                <div className="actions">
                                    <button className="btn-icon" onClick={() => { setEditing(t); setShowForm(true); }}><FaEdit /></button>
                                    <button className="btn-icon danger" onClick={async () => {
                                        if (window.confirm(`¿Seguro que deseas eliminar "${t.nombre}"?`)) {
                                            try {
                                                await eliminarTratamiento(t.id);
                                                showToast('Tratamiento eliminado', 'success');
                                                refetch();
                                            } catch {
                                                showToast('No se puede eliminar: el servicio está en uso.', 'error');
                                            }
                                        }
                                    }}><FaTrashAlt /></button>

                                </div>
                            </div>

                            <div className="card-body">
                                <h3>{t.nombre}</h3>
                                <p className="desc">{t.descripcion || 'Sin descripción detallada.'}</p>
                                <div className="meta">
                                    <div className="price-tag"><FaTag /> ${Math.round(t.precio).toLocaleString('es-AR')}</div>
                                    <div className="duration">{t.duracionMin || 30} min</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showForm && (
                <TreatmentFormModal
                    editing={editing}
                    onApplied={() => { setShowForm(false); refetch(); }}
                    onClose={() => setShowForm(false)}
                />
            )}

            {showImport && (
                <TreatmentImportModal
                    onImported={() => { setShowImport(false); refetch(); }}
                    onClose={() => setShowImport(false)}
                />
            )}
        </div>
    );
}

