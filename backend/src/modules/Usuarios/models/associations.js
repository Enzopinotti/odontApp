// backend/src/modules/Usuarios/models/associations.js
/*  Recibe el objeto models generado por Sequelize y aplica TODAS las relaciones */
export default (models) => {
  const {
    Usuario,
    Rol,
    Permiso,
    RolPermiso,
    Odontologo,
    Especialidad,
    OdontologoEspecialidad,
    Recepcionista,
    EmailVerificationToken,
    PasswordResetToken,
    AuditLog,
  } = models;

  /* --- Relaciones de roles y permisos --- */
  Rol.belongsToMany(Permiso, {
    through: RolPermiso,
    uniqueKey: "rol_permiso_unique",
  });
  Permiso.belongsToMany(Rol, {
    through: RolPermiso,
    uniqueKey: "rol_permiso_unique",
  });

  /* --- Usuario y rol --- */
  Rol.hasMany(Usuario, { onDelete: "SET NULL" });
  Usuario.belongsTo(Rol, { as: "Rol" });

  /* --- Tokens y logs --- */
  Usuario.hasMany(EmailVerificationToken, { onDelete: "CASCADE" });
  EmailVerificationToken.belongsTo(Usuario);

  Usuario.hasMany(PasswordResetToken, { onDelete: "CASCADE" });
  PasswordResetToken.belongsTo(Usuario);

  Usuario.hasMany(AuditLog, { onDelete: "CASCADE" });
  AuditLog.belongsTo(Usuario);

  /* --- Odontólogo / Recepcionista --- */
  Usuario.hasOne(Odontologo, { foreignKey: "userId", onDelete: "CASCADE" });
  Odontologo.belongsTo(Usuario, { foreignKey: "userId" });

  Usuario.hasOne(Recepcionista, { foreignKey: "userId", onDelete: "CASCADE" });
  Recepcionista.belongsTo(Usuario, { foreignKey: "userId" });

  /* --- Odontólogo y especialidad --- */
  Odontologo.belongsToMany(Especialidad, {
    through: OdontologoEspecialidad,
    uniqueKey: "odontologo_especialidad_unique",
  });
  Especialidad.belongsToMany(Odontologo, {
    through: OdontologoEspecialidad,
    uniqueKey: "odontologo_especialidad_unique",
  });

 
};
