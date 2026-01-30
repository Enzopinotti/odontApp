import { Permiso, Rol } from './backend/src/modules/Usuarios/models/index.js';
import { connectDB } from './backend/src/config/db.js';

async function check() {
    await connectDB();
    const perms = await Permiso.findAll({
        include: [{ model: Rol, through: { attributes: [] } }]
    });

    console.log('--- PERMISOS EN DB ---');
    perms.forEach(p => {
        const roles = p.Rols.map(r => r.nombre).join(', ');
        console.log(`[${p.recurso}:${p.accion}] -> Roles: ${roles}`);
    });

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
