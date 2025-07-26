export default(sequelize, DataTypes) => {
    return sequelize.define(
        "Paciente",
        {
            id:{
                type: DataTypes.UUID,
               defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            nombre: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            apellido: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            dni: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            fechaNacimiento: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            sexo: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        }
    );
}