// emailVerificationToken.js
export default (sequelize, DataTypes) =>
  sequelize.define('EmailVerificationToken', {
    token:  { type: DataTypes.STRING, allowNull: false },
    expire: { type: DataTypes.DATE, allowNull: false },
    usado:  { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'email_verification_tokens' });
