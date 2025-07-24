export default (sequelize, DataTypes) => {
    const Paciente = sequelize.define('Paciente', {
        pacienteId: {
            type: DataTypes.INTEGER,    
            primaryKey: true,
            autoIncrement: true},
        nombre: {
            type: DataTypes.STRING, 
            allowNull: false},
        apellido: {
            type: DataTypes.STRING, 
            allowNull: false},
        dni: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        fechaNacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        sexo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: true
        },
    },{
        tableName: 'pacientes',
        timestamps: true,
        paranoid: true, 
    });
    //asociaciones
    Paciente.associate = (models) => {
        Paciente.hasMany(models.Receta, {
            foreignKey: 'pacienteId',
            as: 'recetas'
        });
        //historia clinica
        //turnos
    };
    return Paciente;
};