// frontend/src/features/admin/pages/AdminAudit.js
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { FaClock, FaTerminal } from 'react-icons/fa';

import '../../../styles/_adminAudit.scss';

export default function AdminAudit() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => {
            const res = await api.get('/usuarios/audit/logs'); // Ajustar si la ruta es distinta
            return res.data;
        }
    });

    return (
        <div className="admin-audit-view">
            <div className="audit-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th><FaClock /> Fecha / Hora</th>
                            <th>Usuario</th>
                            <th><FaTerminal /> Acción</th>
                            <th>Recurso</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5">Cargando registros de seguridad...</td></tr>
                        ) : logs?.data?.map(log => (
                            <tr key={log.id}>
                                <td className="time-col">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="user-col"><strong>{log.Usuario?.apellido}, {log.Usuario?.nombre}</strong></td>
                                <td><span className="action-tag">{log.accion}</span></td>
                                <td><code>{log.recurso}</code></td>
                                <td className="ip-col">{log.ip || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
