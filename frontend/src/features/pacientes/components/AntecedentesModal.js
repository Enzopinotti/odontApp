// frontend/src/features/pacientes/components/AntecedentesModal.js
import { useState } from 'react';
import { FaTimes, FaShieldAlt, FaSave } from 'react-icons/fa';
import { crearAntecedenteMedico } from '../../../api/clinica';
import useToast from '../../../hooks/useToast';
import ModernSelect from '../../../components/ModernSelect';

const TIPO_OPTIONS = [
    { id: 'Alergia', label: 'Alergia' },
    { id: 'Medicamento', label: 'Medicamento' },
    { id: 'Enfermedad_Cronica', label: 'Enfermedad Crónica' },
    { id: 'Cirugia', label: 'Cirugía' },
    { id: 'Otro', label: 'Otro' }
];

export default function AntecedentesModal({ pacienteId, onApplied, onClose }) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        tipoAntecedente: '',
        descripcion: '',
        observaciones: '',
        fechaRegistro: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.tipoAntecedente) return showToast('El tipo es obligatorio', 'error');

        try {
            setLoading(true);
            await crearAntecedenteMedico(pacienteId, form);
            showToast('Antecedente registrado', 'success');
            onApplied();
        } catch (err) {
            showToast('Error al registrar antecedente', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <form className="admin-modal-card pro-flow" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <header className="am-head">
                    <div className="am-title">
                        <FaShieldAlt />
                        <div>
                            <h3>Configurar Alerta / Antecedente</h3>
                            <p>Factores de riesgo y salud sistémica</p>
                        </div>
                    </div>
                    <button type="button" className="close-x" onClick={onClose}><FaTimes /></button>
                </header>

                <div className="am-body">
                    <div className="form-row">
                        <div className="field">
                            <label>Categoría *</label>
                            <ModernSelect
                                options={TIPO_OPTIONS}
                                value={form.tipoAntecedente}
                                onChange={val => setForm({ ...form, tipoAntecedente: val })}
                                placeholder="Seleccionar tipo..."
                            />
                        </div>
                        <div className="field">
                            <label>Fecha de detección</label>
                            <input
                                type="date"
                                value={form.fechaRegistro}
                                onChange={e => setForm({ ...form, fechaRegistro: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label>Descripción Crítica (Alertará en el sillón)</label>
                        <input
                            required
                            value={form.descripcion}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                            placeholder="Ej: Alérgico a la Penicilina"
                        />
                    </div>

                    <div className="field">
                        <label>Observaciones adicionales</label>
                        <textarea
                            value={form.observaciones}
                            onChange={e => setForm({ ...form, observaciones: e.target.value })}
                            placeholder="Detalles sobre el tratamiento o diagnóstico..."
                            rows="3"
                        />
                    </div>
                </div>

                <footer className="am-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-confirm" disabled={loading}>
                        <FaSave /> {loading ? 'Guardando...' : 'Guardar Alerta'}
                    </button>
                </footer>
            </form>
        </div>
    );
}
