export default (sequelize, DataTypes) => {
  const Receta = sequelize.define(
    "Receta",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      indicaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diagnostico: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      pacienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Pacientes",
          key: "id",
        },
      },
      odontologoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Odontologos",
          key: "userId",
        },
      },
        firmaOdontologo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    { tableName: "recetas", timestamps: true }
  );
//asociaciones
Receta.associate = (models) => {
  Receta.belongsTo(models.Paciente, {
    foreignKey: "pacienteId",
    as: "paciente",
  });
  Receta.belongsTo(models.Odontologo, {
    foreignKey: "odontologoId",
    as: "odontologo",
  });
  Receta.hasMany(models.MedicamentoRecetado, {
    foreignKey: "recetaId",
    as: "medicamentos",
  });}
 return Receta;
};
