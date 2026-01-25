import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { updateUsuario, deleteUsuario } from '../../../api/admin';
import useToast from '../../../hooks/useToast';
import {
    FaUserPlus, FaUserShield, FaEnvelope, FaPhone,
    FaEllipsisV, FaSearch, FaCheckCircle, FaTimesCircle,
    FaEdit, FaTrashAlt, FaUserTimes, FaShieldAlt
} from 'react-icons/fa';
import avatarDefecto from '../../../assets/img/avatarDefecto.webp';
import UserRoleModal from '../components/UserRoleModal';
import UserFormModal from '../components/UserFormModal';
import DeleteUserModal from '../components/DeleteUserModal';
import '../../../styles/_adminUsers.scss';

export default function AdminUsers() {
    const qc = useQueryClient();
    const { showToast } = useToast();
    const [params, setParams] = useState({ page: 1, perPage: 20, q: '' });
    const [openMenuId, setOpenMenuId] = useState(null);
    const [roleTarget, setRoleTarget] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const { data: usersData, isLoading } = useAdminUsers(params);

    const users = usersData?.data || [];

    const toggleStatusMut = useMutation({
        mutationFn: ({ id, activo }) => updateUsuario(id, { activo: !activo }),
        onSuccess: (_, variables) => {
            showToast(`Usuario ${variables.activo ? 'suspendido' : 'activado'} correctamente`, 'success');
            qc.invalidateQueries(['admin', 'users']);
            setOpenMenuId(null);
        },
        onError: () => showToast('Error al actualizar estado del usuario', 'error')
    });

    const handleToggleStatus = (u) => {
        toggleStatusMut.mutate({ id: u.id, activo: u.activo });
    };

    const deleteMut = useMutation({
        mutationFn: (id) => deleteUsuario(id),
        onSuccess: () => {
            showToast('Usuario eliminado correctamente', 'success');
            qc.invalidateQueries(['admin', 'users']);
            setOpenMenuId(null);
        },
        onError: () => showToast('Error al eliminar usuario', 'error')
    });

    const handleDelete = (u) => {
        setUserToDelete(u);
        setOpenMenuId(null);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteMut.mutate(userToDelete.id);
            setUserToDelete(null);
        }
    };

    useEffect(() => {

        const close = () => setOpenMenuId(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);


    return (
        <div className="admin-users-view">
            <header className="view-action-bar">
                <div className="search-box-pro">
                    <FaSearch className="icon" />
                    <input
                        type="text"
                        aria-label="Buscar personal"
                        placeholder="Buscar personal por nombre, cargo o matrícula..."
                        value={params.q}
                        onChange={(e) => setParams({ ...params, q: e.target.value })}
                    />
                </div>

                <button className="btn-add-pro" onClick={() => setRegisterModalOpen(true)}><FaUserPlus /> Registrar Personal</button>
            </header>

            <section className="users-grid-pro">
                {isLoading ? (
                    <div className="loading-state">Sincronizando base de datos de personal...</div>
                ) : users.length === 0 ? (
                    <div className="empty-state">No se registraron usuarios con esos criterios.</div>
                ) : (
                    users.map(u => (
                        <div key={u.id} className="user-card-pro">
                            <div className="card-top">
                                <div className="user-avatar-pro">
                                    <img src={u.avatarUrl || avatarDefecto} alt="Avatar" />
                                </div>
                                <div className="options-dropdown-container">
                                    <button
                                        className="btn-options"
                                        title="Más opciones"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === u.id ? null : u.id);
                                        }}
                                    >
                                        <FaEllipsisV />
                                    </button>
                                    {openMenuId === u.id && (
                                        <div className="options-menu-pro">
                                            <button className="menu-item" onClick={() => { setEditingUser(u); setOpenMenuId(null); }}><FaEdit /> Editar Datos</button>
                                            <button className="menu-item" onClick={() => { setRoleTarget(u); setOpenMenuId(null); }}><FaShieldAlt /> Cambiar Rol</button>
                                            <div className="divider" />
                                            <button
                                                className={`menu-item ${u.activo ? 'warn' : 'success'}`}
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(u); }}
                                                disabled={toggleStatusMut.isLoading}
                                            >
                                                {u.activo ? <FaUserTimes /> : <FaCheckCircle />}
                                                {u.activo ? 'Suspender' : 'Activar'}
                                            </button>

                                            <button
                                                className="menu-item danger"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(u); }}
                                                disabled={deleteMut.isLoading}
                                            >
                                                <FaTrashAlt /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="user-info-pro">
                                <h3>{u.apellido}, {u.nombre}</h3>
                                <div className="chips-row">
                                    <span className="role-chip"><FaUserShield /> {u.Rol?.nombre || 'Usuario'}</span>
                                    {u.Odontologo?.matricula && (
                                        <span className="matricula-tag">MP: {u.Odontologo.matricula}</span>
                                    )}
                                </div>

                                <div className="contact-info">
                                    <div className="item"><FaEnvelope /> <span>{u.email}</span></div>
                                    <div className="item"><FaPhone /> <span>{u.telefono || '—'}</span></div>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className={`status-badge ${u.activo ? 'active' : 'inactive'}`}>
                                    {u.activo ? <FaCheckCircle /> : <FaTimesCircle />}
                                    {u.activo ? 'Cuenta Activa' : 'Acceso Restringido'}
                                </div>
                                {u.twoFactorEnabled && <span className="badge-2fa" title="Verificación en dos pasos activa">🔒 2FA</span>}
                            </div>
                        </div>
                    ))
                )}
            </section>

            {roleTarget && (
                <UserRoleModal
                    user={roleTarget}
                    onClose={() => setRoleTarget(null)}
                    onApplied={() => setRoleTarget(null)}
                />
            )}

            {(registerModalOpen || editingUser) && (
                <UserFormModal
                    editing={editingUser}
                    onClose={() => { setRegisterModalOpen(false); setEditingUser(null); }}
                    onApplied={() => {
                        setRegisterModalOpen(false);
                        setEditingUser(null);
                        qc.invalidateQueries(['admin', 'users']);
                    }}
                />
            )}

            {userToDelete && (
                <DeleteUserModal
                    user={userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={confirmDelete}
                    isDeleting={deleteMut.isLoading}
                />
            )}
        </div>
    );
}

