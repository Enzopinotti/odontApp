// usuario.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nombre:   { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    telefono: DataTypes.STRING,
    activo:   { type: DataTypes.BOOLEAN, defaultValue: true },
    fechaAlta:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ultimoLogin: DataTypes.DATE,
    passwordChangedAt: DataTypes.DATE,
  }, {
    tableName: 'usuarios',
    defaultScope: { attributes: { exclude: ['password'] } },
    hooks: {
      beforeCreate: async u => { u.password = await bcrypt.hash(u.password, 10); },
      beforeUpdate: async u => {
        if (u.changed('password')) u.password = await bcrypt.hash(u.password, 10);
      },
    },
  });

  /* Métodos de instancia */
  Usuario.prototype.validarPassword = function (plain) { return bcrypt.compare(plain, this.password); };
  Usuario.prototype.generarToken = function () {
    return jwt.sign({ id: this.id, email: this.email }, process.env.JWT_SECRET, { expiresIn: '12h' });
  };

  return Usuario;
};
