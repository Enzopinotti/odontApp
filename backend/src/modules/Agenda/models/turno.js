import { EstadoTurno } from './enums.js';

export default (sequelize, DataTypes) => {
  const Turno = sequelize.define('Turno', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: {
          args: new Date(),
          msg: 'La fecha del turno debe ser futura'
        }
      }
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: {
          args: [15],
          msg: 'La duración mínima es de 15 minutos'
        },
        max: {
          args: [120],
          msg: 'La duración máxima es de 120 minutos'
        }
      }
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'El motivo debe tener entre 1 y 255 caracteres'
        }
      }
    },
    estado: {
      type: DataTypes.ENUM(...Object.values(EstadoTurno)),
      allowNull: false,
      defaultValue: EstadoTurno.PENDIENTE
    },
    // Relaciones
    pacienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pacientes',
        key: 'id'
      }
    },
    odontologoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'odontologos',
        key: 'userId'
      }
    },
    recepcionistaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'turnos',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['fechaHora', 'odontologoId'],
        unique: false
      },
      {
        fields: ['estado']
      },
      {
        fields: ['pacienteId']
      }
    ]
  });

  // CU-AG01.2: Campo virtual para formato de ID personalizado T-YYYYMMDD-XXX
  Turno.prototype.getCodigoTurno = function() {
    const fecha = new Date(this.fechaHora || this.createdAt);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const secuencia = String(this.id).padStart(3, '0');
    return `T-${año}${mes}${dia}-${secuencia}`;
  };

  // Métodos de instancia
  Turno.prototype.cancelar = function(motivo = 'Sin motivo especificado') {
    this.estado = EstadoTurno.CANCELADO;
    return this.save();
  };

  Turno.prototype.marcarAsistencia = function() {
    this.estado = EstadoTurno.ASISTIO;
    return this.save();
  };

  Turno.prototype.marcarAusencia = function() {
    this.estado = EstadoTurno.AUSENTE;
    return this.save();
  };

  Turno.prototype.reprogramar = function(nuevaFechaHora) {
    this.fechaHora = nuevaFechaHora;
    return this.save();
  };

  // Métodos estáticos
  Turno.obtenerTurnosPorFecha = function(fecha, odontologoId = null) {
    const where = {
      fechaHora: {
        [sequelize.Op.between]: [
          new Date(fecha.setHours(0, 0, 0, 0)),
          new Date(fecha.setHours(23, 59, 59, 999))
        ]
      }
    };
    
    if (odontologoId) {
      where.odontologoId = odontologoId;
    }
    
    return this.findAll({
      where,
      include: ['Paciente', 'Odontologo', 'Recepcionista', 'Notas']
    });
  };

  Turno.verificarSolapamiento = function(fechaHora, duracion, odontologoId, turnoIdExcluir = null) {
    const inicio = new Date(fechaHora);
    const fin = new Date(fechaHora.getTime() + duracion * 60000);
    
    const where = {
      odontologoId,
      estado: {
        [sequelize.Op.ne]: EstadoTurno.CANCELADO
      },
      [sequelize.Op.or]: [
        {
          fechaHora: {
            [sequelize.Op.between]: [inicio, fin]
          }
        },
        {
          [sequelize.Op.and]: [
            {
              fechaHora: {
                [sequelize.Op.lte]: inicio
              }
            },
            {
              [sequelize.literal]: `DATE_ADD(fechaHora, INTERVAL duracion MINUTE) > '${inicio.toISOString()}'`
            }
          ]
        }
      ]
    };

    if (turnoIdExcluir) {
      where.id = {
        [sequelize.Op.ne]: turnoIdExcluir
      };
    }

    return this.findOne({ where });
  };

  return Turno;
};
