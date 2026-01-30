// frontend/src/features/admin/pages/AdminRoles.js
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, getTodosPermisos, updateRolPermisos } from '../../../api/admin';
import { FaUserTag, FaShieldAlt, FaCheck, FaLock, FaUserShield } from 'react-icons/fa';
import useToast from '../../../hooks/useToast';
import '../../../styles/_adminRoles.scss';

export default function AdminRoles() {
    const qc = useQueryClient();
    const { showToast } = useToast();
    const [selectedRol, setSelectedRol] = useState(null);

    const { data: rolesRes, isLoading: loadingRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const res = await getRoles();
            return res.data;
        }
    });

    const { data: permisosRes } = useQuery({
        queryKey: ['permisos'],
        queryFn: async () => {
            const res = await getTodosPermisos();
            return res.data;
        }
    });


    const roles = rolesRes?.data || [];
    const todosPermisos = permisosRes?.data || [];

    const updateMut = useMutation({
        mutationFn: ({ id, ids }) => updateRolPermisos(id, ids),
        onSuccess: () => {
            showToast('Permisos actualizados con éxito', 'success');
            qc.invalidateQueries(['roles']);
            setSelectedRol(null);
        }
    });

    const handleTogglePermiso = (permisoId) => {
        if (!selectedRol) return;
        const currentIds = selectedRol.Permisos?.map(p => p.id) || [];
        let newIds;
        if (currentIds.includes(permisoId)) {
            newIds = currentIds.filter(id => id !== permisoId);
        } else {
            newIds = [...currentIds, permisoId];
        }
        // Update local state for immediate feedback
        setSelectedRol({
            ...selectedRol,
            Permisos: todosPermisos.filter(p => newIds.includes(p.id))
        });
    };

    const handleSave = () => {
        if (!selectedRol) return;
        updateMut.mutate({ id: selectedRol.id, ids: selectedRol.Permisos.map(p => p.id) });
    };

    return (
        <div className="admin-roles-view">
            <aside className="roles-list-panel">
                <header className="panel-head">
                    <h3><FaUserShield /> Roles del Sistema</h3>
                    <p>Defina los niveles de acceso.</p>
                </header>
                <div className="roles-grid">
                    {loadingRoles ? <p>Cargando roles...</p> : roles.map(r => (
                        <button
                            key={r.id}
                            className={`role-btn ${selectedRol?.id === r.id ? 'active' : ''}`}
                            onClick={() => setSelectedRol(r)}
                        >
                            <div className="role-icon"><FaUserTag /></div>
                            <div className="role-txt">
                                <strong>{r.nombre}</strong>
                                <span>{r.Permisos?.length || 0} permisos activos</span>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            <main className="permissions-matrix-panel">
                {selectedRol ? (
                    <div className="matrix-card">
                        <header className="matrix-head">
                            <div className="role-info-head">
                                <FaLock className="lock-icon" />
                                <div>
                                    <h3>Permisos para: {selectedRol.nombre}</h3>
                                    <p>Marque las acciones permitidas para este rol.</p>
                                </div>
                            </div>
                            <div className="matrix-actions">
                                <button className="btn-cancel" onClick={() => setSelectedRol(null)}>Descartar</button>
                                <button className="btn-save-pro" onClick={handleSave} disabled={updateMut.isLoading}>
                                    {updateMut.isLoading ? 'Guardando...' : <><FaCheck /> Guardar Cambios</>}
                                </button>
                            </div>
                        </header>

                        <div className="matrix-scroll">
                            <table className="perm-table">
                                <thead>
                                    <tr>
                                        <th>Recurso / Módulo</th>
                                        <th>Acción</th>
                                        <th>Estado</th>
                                        <th>Asignar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todosPermisos.map(p => {
                                        const isAssigned = selectedRol.Permisos?.some(rp => rp.id === p.id);
                                        return (
                                            <tr key={p.id} onClick={() => handleTogglePermiso(p.id)} className={isAssigned ? 'assigned' : ''}>
                                                <td className="res-col"><code>{p.recurso}</code></td>
                                                <td className="acc-col"><span>{p.accion}</span></td>
                                                <td className="status-col">
                                                    {isAssigned ? <span className="status-pill ok">Activo</span> : <span className="status-pill off">Denegado</span>}
                                                </td>
                                                <td className="check-col">
                                                    <input type="checkbox" checked={isAssigned} readOnly />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="no-selection-msg">
                        <FaShieldAlt className="bg-icon" />
                        <h3>Gestión de Seguridad</h3>
                        <p>Seleccione un rol de la izquierda para configurar sus privilegios de acceso al sistema.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
