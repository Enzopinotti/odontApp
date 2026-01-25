import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthCtx } from '../../../context/AuthProvider';
import { useEffect } from 'react';
import AdminUsers from './AdminUsers';
import AdminTreatments from './AdminTreatments';
import AdminAudit from './AdminAudit';
import AdminRoles from './AdminRoles';
import { FaUsers, FaStethoscope, FaHistory, FaShieldAlt, FaLock } from 'react-icons/fa';

import '../../../styles/_adminPage.scss';
import { useContext } from 'react';

export default function AdminPage() {
    const { hasPermiso, user } = useContext(AuthCtx);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const isAdmin = user?.Rol?.nombre?.toUpperCase() === 'ADMIN';

    useEffect(() => {
        if (!isAdmin) {
            navigate('/pacientes', { replace: true });
        }
    }, [isAdmin, navigate]);

    // Almacena tab en URL para persistencia
    const activeTab = searchParams.get('tab') || 'usuarios';
    const setActiveTab = (tab) => setSearchParams({ tab });


    const tabs = [
        { id: 'usuarios', label: 'Personal', icon: <FaUsers />, permiso: ['usuarios', 'listar'] },
        { id: 'tratamientos', label: 'Catálogo', icon: <FaStethoscope />, permiso: ['tratamientos', 'listar'] },
        { id: 'roles', label: 'Seguridad', icon: <FaLock />, permiso: ['roles', 'listar'] },
        { id: 'audit', label: 'Auditoría', icon: <FaHistory />, permiso: ['configuracion', 'ver'] },
    ];

    const visibleTabs = tabs.filter(t => hasPermiso(t.permiso[0], t.permiso[1]) || isAdmin);


    return (
        <div className="admin-root-page">
            <header className="admin-main-head">
                <div className="title-area">
                    <h1><FaShieldAlt /> Panel de Control Administrativo</h1>
                    <p>Gestión centralizada de personal, catálogo clínico y seguridad del sistema.</p>
                </div>

                <nav className="admin-tabs">
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {activeTab === tab.id && <div className="indicator" />}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="admin-tab-content">
                {activeTab === 'usuarios' && <AdminUsers />}
                {activeTab === 'tratamientos' && <AdminTreatments />}
                {activeTab === 'roles' && <AdminRoles />}
                {activeTab === 'audit' && <AdminAudit />}
            </main>

        </div>
    );
}
