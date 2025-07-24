// src/modules/Usuarios/models/index.js
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../../../../config/db.js';
import applyAssociations from './associations.js';


import usuarioModel from './usuario.js';
import rolModel from './rol.js';
import permisoModel from './permiso.js';
import passwordResetTokenModel from './passwordResetToken.js';
import emailVerificationTokenModel from './emailVerificationToken.js';
import especialidadModel from './especialidad.js';
import odontologoModel from './odontologo.js';
import auditLogModel from './auditLog.js';
import rolPermisoModel from './RolPermiso.js';
import odontologoEspecialidadModel from './OdontologoEspecialidad.js';
import recepcionistaModel from './recepcionista.js';

// Inicializar modelos
const Usuario = usuarioModel(sequelize, DataTypes);
const Rol = rolModel(sequelize, DataTypes);
const Permiso = permisoModel(sequelize, DataTypes);
const PasswordResetToken = passwordResetTokenModel(sequelize, DataTypes);
const EmailVerificationToken = emailVerificationTokenModel(sequelize, DataTypes);
const Especialidad = especialidadModel(sequelize, DataTypes);
const Odontologo = odontologoModel(sequelize, DataTypes);
const AuditLog = auditLogModel(sequelize, DataTypes);
const RolPermiso = rolPermisoModel(sequelize, DataTypes);
const OdontologoEspecialidad = odontologoEspecialidadModel(sequelize, DataTypes);
const Recepcionista = recepcionistaModel(sequelize, DataTypes);


applyAssociations(sequelize.models);


export {
  sequelize,
  Usuario,
  Rol,
  Permiso,
  PasswordResetToken,
  EmailVerificationToken,
  Especialidad,
  Odontologo,
  AuditLog,
  RolPermiso,
  OdontologoEspecialidad,
  Recepcionista,

};
