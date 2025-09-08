export default (sequelize, DataTypes) => {
  const Nota = sequelize.define('Nota', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [1, 1000],
          msg: 'La descripción debe tener entre 1 y 1000 caracteres'
        }
      }
    },
    // Relación con turno
    turnoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'turnos',
        key: 'id'
      }
    },
    // Usuario que creó la nota
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'notas',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['turnoId']
      },
      {
        fields: ['usuarioId']
      }
    ]
  });

  // Métodos de instancia
  Nota.prototype.esReciente = function() {
    const ahora = new Date();
    const creada = new Date(this.createdAt);
    const diferenciaHoras = (ahora - creada) / (1000 * 60 * 60);
    return diferenciaHoras < 24; // Nota reciente si fue creada en las últimas 24 horas
  };

  // Métodos estáticos
  Nota.obtenerNotasPorTurno = function(turnoId) {
    return this.findAll({
      where: { turnoId },
      include: ['Usuario'],
      order: [['createdAt', 'DESC']]
    });
  };

  Nota.obtenerNotasRecientes = function(limite = 10) {
    return this.findAll({
      include: ['Usuario', 'Turno'],
      order: [['createdAt', 'DESC']],
      limit: limite
    });
  };

  return Nota;
};
