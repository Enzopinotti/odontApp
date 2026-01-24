// backend/src/modules/Clinica/models/estadoPaciente.js
export default (sequelize, DataTypes) => {
    return sequelize.define('EstadoPaciente', {
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        color: {
            type: DataTypes.STRING,
            defaultValue: '#3b82f6', // Azul por defecto
        },
        orden: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        descripcion: {
            type: DataTypes.TEXT,
        },
    }, {
        tableName: 'estados_pacientes',
        timestamps: true,
    });
};
