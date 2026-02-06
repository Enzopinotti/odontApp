"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn("pacientes", "fechaNacimiento", {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("pacientes", "sexo", {
      type: DataTypes.ENUM("Masculino", "Femenino", "Otro"),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("pacientes", "fechaNacimiento");
    await queryInterface.removeColumn("pacientes", "sexo");
  },
};
