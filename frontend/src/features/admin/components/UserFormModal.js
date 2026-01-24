// frontend/src/features/admin/components/UserFormModal.js
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaTimes, FaUserPlus, FaEnvelope, FaPhone, FaLock, FaUserTag, FaSave } from 'react-icons/fa';
import { createUsuario, updateUsuario, getRoles } from '../../../api/admin';

import useToast from '../../../hooks/useToast';
import ModernSelect from '../../../components/ModernSelect';

export default function UserFormModal({ editing, onApplied, onClose }) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        rolId: ''
    });

    const { data: rolesRes } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const res = await getRoles();
            return res.data;
        }
    });

    const rolesOptions = (rolesRes?.data || []).map(r => ({ id: r.id, label: r.nombre }));

    useEffect(() => {
        if (editing) {
            setForm({
                nombre: editing.nombre || '',
                apellido: editing.apellido || '',
                email: editing.email || '',
                telefono: editing.telefono || '',
                rolId: editing.RolId || '',
                password: '' // No editamos password aquí usualmente
            });
        }
    }, [editing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editing) {
                await updateUsuario(editing.id, form);
                showToast('Datos de personal actualizados', 'success');
            } else {
                await createUsuario(form);
                showToast('Nuevo personal registrado con éxito', 'success');
            }
            onApplied();
        } catch (err) {
            showToast('Error al guardar datos de personal', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <form className="admin-modal-card pro-flow" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <header className="am-head">
                    <div className="am-title">
                        <FaUserPlus />
                        <div>
                            <h3>{editing ? 'Editar Personal' : 'Registrar Personal'}</h3>
                            <p>Credenciales y detalles administrativos</p>
                        </div>
                    </div>
                    <button type="button" className="close-x" onClick={onClose}><FaTimes /></button>
                </header>

                <div className="am-body">
                    <div className="form-row">
                        <div className="field">
                            <label htmlFor="user-nombre">Nombre *</label>
                            <input
                                id="user-nombre"
                                required
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                placeholder="Ej: Juan"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="user-apellido">Apellido *</label>
                            <input
                                id="user-apellido"
                                required
                                value={form.apellido}
                                onChange={e => setForm({ ...form, apellido: e.target.value })}
                                placeholder="Ej: Pérez"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="user-email"><FaEnvelope /> Email Corporativo *</label>
                        <input
                            id="user-email"
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="juan.perez@odontapp.com"
                        />
                    </div>

                    <div className="form-row">
                        <div className="field">
                            <label htmlFor="user-tel"><FaPhone /> Teléfono</label>
                            <input
                                id="user-tel"
                                value={form.telefono}
                                onChange={e => setForm({ ...form, telefono: e.target.value })}
                                placeholder="11 2345 6789"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="user-rol"><FaUserTag /> Nivel de Acceso (Rol) *</label>
                            <ModernSelect
                                id="user-rol"
                                options={rolesOptions}
                                value={form.rolId}
                                onChange={val => setForm({ ...form, rolId: val })}
                                placeholder="Seleccionar rol..."
                                icon={<FaUserTag />}
                            />
                        </div>
                    </div>

                    {!editing && (
                        <div className="field">
                            <label htmlFor="user-pass"><FaLock /> Contraseña Temporal *</label>
                            <input
                                id="user-pass"
                                type="password"
                                required
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>
                    )}

                </div>

                <footer className="am-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-confirm" disabled={loading}>
                        <FaSave /> {loading ? 'Sincronizando...' : (editing ? 'Actualizar Datos' : 'Registrar Personal')}
                    </button>
                </footer>
            </form>
        </div>
    );
}
