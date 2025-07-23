'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('usuarios', 'twoFactorEnabled', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('usuarios', 'twoFactorSecret', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('usuarios', 'avatarUrl', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('usuarios', 'twoFactorEnabled');
    await queryInterface.removeColumn('usuarios', 'twoFactorSecret');
    await queryInterface.removeColumn('usuarios', 'avatarUrl');
  },
};
