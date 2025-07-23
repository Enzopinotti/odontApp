import { AuditLog } from '../models/index.js';

export const registrarLog = (UsuarioId, recurso, accion, ip = null) =>
  AuditLog.create({ UsuarioId, recurso, accion, ip });
