// passwordResetToken.js
export default (sequelize, DataTypes) =>
  sequelize.define('PasswordResetToken', {
    token:  { type: DataTypes.STRING, allowNull: false },
    expire: { type: DataTypes.DATE, allowNull: false },
    usado:  { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'password_reset_tokens' });
