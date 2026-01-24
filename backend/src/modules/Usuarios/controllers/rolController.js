// backend/src/modules/Usuarios/controllers/rolController.js
import { Rol, Permiso } from '../models/index.js';

export const obtenerRoles = async (req, res) => {
    const roles = await Rol.findAll({
        include: [{ model: Permiso }]
    });
    res.ok(roles);
};

export const obtenerRolPorId = async (req, res) => {
    const rol = await Rol.findByPk(req.params.id, {
        include: [{ model: Permiso }]
    });
    if (!rol) return res.fail({ message: 'Rol no encontrado' }, 404);
    res.ok(rol);
};

export const actualizarPermisos = async (req, res) => {
    const { id } = req.params;
    const { permisosIds } = req.body; // Array de IDs

    const rol = await Rol.findByPk(id);
    if (!rol) return res.fail({ message: 'Rol no encontrado' }, 404);

    await rol.setPermisos(permisosIds);

    const updated = await Rol.findByPk(id, { include: [Permiso] });
    res.ok(updated, 'Permisos actualizados');
};
