// frontend/src/features/odontograma/components/OdontogramaHistory.js
import { useMemo, useState } from 'react';
import { FaHistory, FaTooth, FaLayerGroup, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUserMd } from 'react-icons/fa';
import { FACE_LABELS } from '../constants';

export default function OdontogramaHistory({ odo }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const history = useMemo(() => {
        if (!odo?.Dientes) return [];

        let list = [];
        odo.Dientes.forEach(d => {
            (d.CaraTratadas || []).forEach(c => {
                list.push({
                    id: c.id,
                    type: 'face',
                    pieza: d._fdi,
                    cara: c.simbolo,
                    label: FACE_LABELS[c.simbolo] || c.simbolo,
                    estado: c.estadoCara,
                    tratamiento: c.Tratamiento?.nombre || 'Marca manual',
                    fecha: new Date(c.updatedAt || c.createdAt),
                    profesional: c.Usuario ? `${c.Usuario.apellido}, ${c.Usuario.nombre}` : 'Staff Clínico'
                });
            });
        });

        return list.sort((a, b) => b.fecha - a.fecha);
    }, [odo]);

    // Paginación
    const totalPages = Math.ceil(history.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return history.slice(start, start + itemsPerPage);
    }, [history, currentPage]);

    if (!history.length) return (
        <div className="odo-history-empty">
            <FaHistory />
            <p>No se registran intervenciones clínicas aún.</p>
        </div>
    );

    return (
        <div className="odo-history-section">
            <header className="history-head">
                <div className="title-box">
                    <h3><FaHistory /> Registro de Intervenciones</h3>
                    <span className="count-tag">{history.length} Eventos</span>
                </div>

                {totalPages > 1 && (
                    <div className="history-pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="pag-btn"
                        >
                            <FaChevronLeft />
                        </button>
                        <span className="pag-info">{currentPage} / {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="pag-btn"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </header>

            <div className="history-table-wrapper">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th><FaCalendarAlt /> Momento</th>
                            <th>Pieza Dental</th>
                            <th>Afectación</th>
                            <th>Intervención / Estado</th>
                            <th><FaUserMd /> Responsable</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((h) => (
                            <tr key={h.id}>
                                <td className="date-cell">
                                    <strong>{h.fecha.toLocaleDateString()}</strong>
                                    <small>{h.fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                </td>
                                <td className="piece-cell">
                                    <div className="p-badge"><FaTooth /> <span>FDI {h.pieza}</span></div>
                                </td>
                                <td className="face-cell">
                                    <div className={`face-tag ${h.cara}`}>
                                        {h.cara === 'TODAS' ? <FaLayerGroup /> : h.cara}
                                        <span>{h.label}</span>
                                    </div>
                                </td>
                                <td className="treat-cell">
                                    <span className={`status-pill ${h.estado.toLowerCase()}`}>{h.estado}</span>
                                    <p>{h.tratamiento}</p>
                                </td>
                                <td className="user-cell">
                                    <div className="prof-info">
                                        <div className="prof-avatar-mini">{h.profesional.charAt(0)}</div>
                                        <span>{h.profesional}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
