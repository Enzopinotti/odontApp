export default (sequelize, DataTypes) => {
    const Receta = sequelize.define('Receta', {
        recetaId: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // Datos del profesional (se duplican por posibles cambios futuros)
        nombreProfesional: {
            type: DataTypes.STRING,
            allowNull: false
        },
        matricula: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firmaDigital: {
            type: DataTypes.STRING,
            allowNull: false    
        },
        // Clave externa odontólogo
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // Datos del paciente
        nombrePaciente: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dniPaciente: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fechaNacimientoPaciente: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        sexoPaciente: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Clave externa paciente
        pacienteId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // Otros campos
        observaciones: {
            type: DataTypes.STRING, 
            allowNull: true},
        diagnostico: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fechaEmision: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_DATE') // Mejor para DATEONLY
        },
        codigoBarra: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'recetas',
        paranoid: true,
        timestamps: true
    });

    Receta.associate = (models) => {
        Receta.belongsTo(models.Paciente, {
            foreignKey: 'pacienteId',
            as: 'paciente'
        });
        Receta.belongsTo(models.Odontologo, {
            foreignKey: 'userId',
            as: 'odontologo'
        });
        Receta.hasMany(models.MedicamentoRecetado, {
            foreignKey: 'recetaId',
            as: 'medicamentos'
        });
    };

    return Receta;
};