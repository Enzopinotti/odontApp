export default (sequelize, DataTypes) => {
  const Medicamento= sequelize.define(
    "Medicamento",
    {
      id: { 
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
       },
       nombreGenerico:{
        type: DataTypes.STRING,
        allowNull: false,
       },
       formaFarmaceutica: {
        type: DataTypes.STRING, 
        allowNull: false,
       },
       dosis:{
        type: DataTypes.STRING,
        allowNull: false,
       },
       presentacion: {
        type: DataTypes.STRING,
        allowNull: false,
       },
    },{tableName: "medicamentos", timestamps: true}
    );
//asociaciones
    Medicamento.associate = (models) => {
        Medicamento.hasMany(models.MedicamentoRecetado, {
        foreignKey: "medicamentoId",
        as: "recetados",
        });
    };
    
    return Medicamento;

}
