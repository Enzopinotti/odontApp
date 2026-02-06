import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import { useTurnosPorFecha } from '../../agenda/hooks/useTurnos';
import { usePacientes } from '../../pacientes/hooks/usePacientes';
import {
    FaCalendarAlt,
    FaUsers,
    FaUserShield,
    FaPlus,
    FaClock,
    FaStethoscope,
    FaHistory
} from 'react-icons/fa';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import '../../../styles/_dashboard.scss';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Roles
    const rolName = user?.Rol?.nombre?.toUpperCase() || '';
    const isAdmin = rolName === 'ADMIN' || rolName === 'ADMINISTRADOR';
    const isOdontologo = rolName === 'ODONTÓLOGO' || rolName === 'DENTISTA';
    const isRecepcionista = rolName === 'RECEPCIONISTA';

    // Data fetching
    const { data: turnosHoy, isLoading: loadingTurnos } = useTurnosPorFecha(today);
    const { data: pacientesResumen, isLoading: loadingPacientes } = usePacientes({ page: 1, perPage: 5 });

    const stats = useMemo(() => {
        if (!turnosHoy) return { pendientes: 0, total: 0 };
        const turnosArr = Array.isArray(turnosHoy) ? turnosHoy : (turnosHoy.data || []);
        return {
            total: turnosArr.length,
            pendientes: turnosArr.filter(t => t.estado === 'PENDIENTE').length
        };
    }, [turnosHoy]);

    const nombreUsuario = user?.nombre || 'Usuario';

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="welcome-section">
                    <h1>Hola, {nombreUsuario} 👋</h1>
                    <p>Este es el resumen de hoy, {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Lógica por ROLES */}

                {/* SECCIÓN RECEPCIONISTA / ADMIN */}
                {(isRecepcionista || isAdmin) && (
                    <div className="dashboard-section">
                        <h2>Gestión de Pacientes</h2>

                        {(loadingTurnos || loadingPacientes) ? (
                            <div className="pacientes-loader" style={{ padding: '1rem' }}>
                                <Lottie animationData={loadingAnim} loop autoplay style={{ width: 100 }} />
                            </div>
                        ) : (
                            <>
                                <div className="stats-row">
                                    <div className="stat-card clickable" onClick={() => navigate('/agenda')}>
                                        <div className="stat-icon"><FaCalendarAlt /></div>
                                        <div className="stat-info">
                                            <span className="stat-value">{stats.total}</span>
                                            <span className="stat-label">Turnos hoy</span>
                                        </div>
                                    </div>
                                    <div className="stat-card clickable" onClick={() => navigate('/pacientes')}>
                                        <div className="stat-icon"><FaUsers /></div>
                                        <div className="stat-info">
                                            <span className="stat-value">{pacientesResumen?.total || 0}</span>
                                            <span className="stat-label">Pacientes totales</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="quick-actions">
                                    <h3>Accesos rápidos</h3>
                                    <div className="action-buttons">
                                        <button onClick={() => navigate('/agenda/turnos/nuevo')} className="action-btn">
                                            <FaPlus /> Nuevo Turno
                                        </button>
                                        <button onClick={() => navigate('/pacientes/nuevo')} className="action-btn">
                                            <FaPlus /> Nuevo Paciente
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* SECCIÓN ODONTÓLOGO */}
                {(isOdontologo) && (
                    <div className="dashboard-section">
                        <h2>Mi Agenda</h2>

                        {loadingTurnos ? (
                            <div className="pacientes-loader" style={{ padding: '1rem' }}>
                                <Lottie animationData={loadingAnim} loop autoplay style={{ width: 100 }} />
                            </div>
                        ) : (
                            <>
                                <div className="stats-row">
                                    <div className="stat-card high-light">
                                        <div className="stat-icon"><FaClock /></div>
                                        <div className="stat-info">
                                            <span className="stat-value">{stats.pendientes}</span>
                                            <span className="stat-label">Pacientes por atender</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="next-appointments">
                                    <h3>Próximos turnos</h3>
                                    <div className="appointment-list">
                                        {stats.total > 0 ? (
                                            (Array.isArray(turnosHoy) ? turnosHoy : turnosHoy.data)
                                                .filter(t => t.estado === 'PENDIENTE')
                                                .slice(0, 3)
                                                .map(turno => (
                                                    <div key={turno.id} className="appointment-item">
                                                        <span className="time">{turno.horaInicioStr}</span>
                                                        <span className="patient">{turno.Paciente?.apellido}, {turno.Paciente?.nombre}</span>
                                                        <button className="btn-small" onClick={() => navigate('/agenda')}>Ver</button>
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="empty-state">No hay turnos pendientes para hoy.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* SECCIÓN ADMIN */}
                {isAdmin && (
                    <div className="dashboard-section full-width">
                        <h2>Administración</h2>
                        <div className="admin-shortcuts">
                            <div className="shortcut-card" onClick={() => navigate('/admin?tab=usuarios')}>
                                <FaUserShield />
                                <span>Gestión de Personal</span>
                            </div>
                            <div className="shortcut-card" onClick={() => navigate('/admin?tab=tratamientos')}>
                                <FaStethoscope />
                                <span>Catálogo Clínico</span>
                            </div>
                            <div className="shortcut-card" onClick={() => navigate('/admin?tab=audit')}>
                                <FaHistory />
                                <span>Auditoría</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
