// backend/src/modules/Usuarios/controllers/auditController.js
import { AuditLog, Usuario } from '../models/index.js';

export const obtenerLogs = async (req, res) => {
    const logs = await AuditLog.findAll({
        include: [{
            model: Usuario,
            attributes: ['nombre', 'apellido', 'email']
        }],
        order: [['createdAt', 'DESC']],
        limit: 100
    });
    res.ok(logs);
};
