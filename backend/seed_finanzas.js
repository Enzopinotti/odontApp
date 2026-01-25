import 'dotenv/config'; 
import { sequelize } from './src/config/db.js'; 
import { Permiso, Rol } from './src/modules/Usuarios/models/index.js'; 

const instalarPermisosFinanzas = async () => {
  try {
    console.log('🔌 Conectando a la Base de Datos...');
    await sequelize.authenticate();

    // 1. Definir permisos
    const nuevosPermisos = [
      { recurso: 'facturacion', accion: 'crear', descripcion: 'Crear facturas y órdenes' },
      { recurso: 'facturacion', accion: 'listar', descripcion: 'Ver historial de facturas' },
      { recurso: 'facturacion', accion: 'cobrar', descripcion: 'Registrar pagos' },
      { recurso: 'facturacion', accion: 'anular', descripcion: 'Anular facturas' },
      { recurso: 'presupuestos', accion: 'crear', descripcion: 'Crear presupuestos' },
      { recurso: 'presupuestos', accion: 'listar', descripcion: 'Ver presupuestos' },
    ];

    console.log('🚀 Verificando catálogo de permisos...');
    
    const permisosGuardados = [];
    for (const p of nuevosPermisos) {
      const [permiso] = await Permiso.findOrCreate({
        where: { recurso: p.recurso, accion: p.accion },
        defaults: p
      });
      permisosGuardados.push(permiso);
    }

    // 2. Definir los Roles a actualizar (IDs según tu README)
    const rolesObjetivo = [
      { id: 1, nombre: 'Admin' },      // <--- AGREGADO
      { id: 2, nombre: 'Odontólogo' }
    ];

    // 3. Asignar permisos a cada rol
    for (const datosRol of rolesObjetivo) {
      const rolEncontrado = await Rol.findByPk(datosRol.id);
      
      if (rolEncontrado) {
        console.log(`🔗 Asignando permisos a: ${rolEncontrado.nombre} (ID: ${datosRol.id})...`);
        await rolEncontrado.addPermisos(permisosGuardados);
      } else {
        console.warn(`⚠️ No se encontró el Rol ID ${datosRol.id}. Saltando...`);
      }
    }

    console.log('✨ ¡LISTO! Admin y Odontólogo actualizados.');

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
};

instalarPermisosFinanzas();