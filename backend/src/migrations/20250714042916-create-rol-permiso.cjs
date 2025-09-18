await queryInterface.createTable("rol_permisos", {
  RolId: {
    type: Sequelize.INTEGER,
    references: { model: "roles", key: "id" },
    onDelete: "CASCADE",
    primaryKey: true,
  },
  PermisoId: {
    type: Sequelize.INTEGER,
    references: { model: "permisos", key: "id" },
    onDelete: "CASCADE",
    primaryKey: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});
