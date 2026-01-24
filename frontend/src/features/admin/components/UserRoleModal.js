// frontend/src/features/admin/components/UserRoleModal.js
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, updateUsuario } from '../../../api/admin';
import { FaTimes, FaUserShield, FaSave, FaExclamationCircle } from 'react-icons/fa';
import useToast from '../../../hooks/useToast';
import ModernSelect from '../../../components/ModernSelect';

export default function UserRoleModal({ user, onClose, onApplied }) {
    const qc = useQueryClient();
    const { showToast } = useToast();
    const [rolId, setRolId] = useState(user.RolId || '');

    const { data: rolesRes } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const res = await getRoles();
            return res.data;
        }
    });
    const roles = (rolesRes?.data || []).map(r => ({ id: r.id, label: r.nombre }));

    const mut = useMutation({
        mutationFn: (data) => updateUsuario(user.id, data),
        onSuccess: () => {
            showToast('Jerarquía actualizada', 'success');
            qc.invalidateQueries(['admin-users']);
            onApplied();
        }
    });

    const handleSave = (e) => {
        e.preventDefault();
        mut.mutate({ RolId: parseInt(rolId) });
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <form className="admin-modal-card import" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
                <header className="am-head">
                    <div className="am-title">
                        <FaUserShield />
                        <div>
                            <h3>Cambiar Rol</h3>
                            <p>Asignación de jerarquía y nivel de acceso</p>
                        </div>
                    </div>
                    <button type="button" className="close-x" onClick={onClose}><FaTimes /></button>
                </header>

                <div className="am-body">
                    <p style={{ marginBottom: '1rem', fontWeight: 600, color: '#475569' }}>
                        Asigne un nuevo nivel de acceso para <strong>{user.apellido}, {user.nombre}</strong>.
                    </p>

                    <div className="field">
                        <label>Seleccionar Rol Académico/Administrativo</label>
                        <ModernSelect
                            options={roles}
                            value={rolId}
                            onChange={setRolId}
                            placeholder="Seleccionar rol..."
                            icon={<FaUserShield />}
                        />
                    </div>

                    <div className="format-warning">
                        <FaExclamationCircle />
                        <p>Esto modificará los permisos de acceso del usuario de forma inmediata.</p>
                    </div>
                </div>

                <footer className="am-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-confirm" disabled={mut.isLoading}>
                        <FaSave /> {mut.isLoading ? 'Actualizando...' : 'Confirmar Cambio'}
                    </button>
                </footer>
            </form>
        </div>
    );
}
