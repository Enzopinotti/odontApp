export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Paciente",
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fechaNacimiento: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      sexo: {
        type: DataTypes.ENUM("Masculino", "Femenino", "Otro"),
      },
      dni: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      obraSocial: {
        type: DataTypes.STRING,
      },
      nroAfiliado: {
        type: DataTypes.STRING,
      },
      ultimaVisita: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estadoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "pacientes",
      timestamps: true,
      paranoid: true,
    }
  );
};
