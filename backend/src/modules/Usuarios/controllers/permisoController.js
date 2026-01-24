// backend/src/modules/Usuarios/controllers/permisoController.js
import { Permiso } from '../models/index.js';

export const obtenerPermisos = async (req, res) => {
    const permisos = await Permiso.findAll({
        order: [['recurso', 'ASC'], ['accion', 'ASC']]
    });
    res.ok(permisos);
};
