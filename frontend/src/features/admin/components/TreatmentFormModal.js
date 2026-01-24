// frontend/src/features/admin/components/TreatmentFormModal.js
import { useState, useEffect } from 'react';
import { FaTimes, FaStethoscope, FaTag, FaClock, FaPalette, FaSave } from 'react-icons/fa';
import { crearTratamiento, actualizarTratamiento } from '../../../api/clinica';
import useToast from '../../../hooks/useToast';

export default function TreatmentFormModal({ editing, onApplied, onClose }) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        duracionMin: 30,
        config: {
            sigla: '',
            colorRealizado: '#1d4ed8',
            colorPlanificado: '#dc2626'
        }
    });

    useEffect(() => {
        if (editing) {
            const cfg = typeof editing.config === 'string' ? JSON.parse(editing.config) : (editing.config || {});
            setForm(prev => ({ ...editing, config: { ...prev.config, ...cfg } }));
        }
    }, [editing]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editing) {
                await actualizarTratamiento(editing.id, form);
                showToast('Tratamiento actualizado', 'success');
            } else {
                await crearTratamiento(form);
                showToast('Tratamiento creado', 'success');
            }
            onApplied();
        } catch (err) {
            showToast('Error al guardar tratamiento', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <form className="admin-modal-card pro-flow" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <header className="am-head">
                    <div className="am-title">
                        <FaStethoscope />
                        <div>
                            <h3>{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                            <p>Configuración del catálogo clínico</p>
                        </div>
                    </div>
                    <button type="button" className="close-x" onClick={onClose}><FaTimes /></button>
                </header>

                <div className="am-body">
                    <div className="form-row">
                        <div className="field">
                            <label>Nombre del Tratamiento *</label>
                            <input
                                required
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                placeholder="Ej: Endodoncia Unirradicular"
                            />
                        </div>
                        <div className="field compact">
                            <label>Sigla *</label>
                            <input
                                required
                                maxLength="4"
                                value={form.config.sigla}
                                onChange={e => setForm({ ...form, config: { ...form.config, sigla: e.target.value.toUpperCase() } })}
                                placeholder="Ej: ENDO"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label>Descripción</label>
                        <textarea
                            value={form.descripcion}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                            placeholder="Detalles sobre el procedimiento..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="field">
                            <label><FaTag /> Precio Sugerido</label>
                            <input
                                type="number"
                                value={form.precio}
                                onChange={e => setForm({ ...form, precio: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="field">
                            <label><FaClock /> Duración (min)</label>
                            <input
                                type="number"
                                value={form.duracionMin}
                                onChange={e => setForm({ ...form, duracionMin: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="color-section">
                        <label><FaPalette /> Estética Clínica</label>
                        <div className="color-pickers">
                            <div className="cp">
                                <span>Color Realizado</span>
                                <input type="color" value={form.config.colorRealizado} onChange={e => setForm({ ...form, config: { ...form.config, colorRealizado: e.target.value } })} />
                            </div>
                            <div className="cp">
                                <span>Color Patología</span>
                                <input type="color" value={form.config.colorPlanificado} onChange={e => setForm({ ...form, config: { ...form.config, colorPlanificado: e.target.value } })} />
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="am-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-confirm" disabled={loading}>
                        <FaSave /> {loading ? 'Enviando...' : (editing ? 'Actualizar Servicio' : 'Registrar Servicio')}
                    </button>
                </footer>
            </form>
        </div>
    );
}
