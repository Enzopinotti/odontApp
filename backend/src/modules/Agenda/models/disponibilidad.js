import { TipoDisponibilidad } from './enums.js';

export default (sequelize, DataTypes) => {
  const Disponibilidad = sequelize.define('Disponibilidad', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        isAfterStart(value) {
          if (this.horaInicio && value <= this.horaInicio) {
            throw new Error('La hora de fin debe ser posterior a la hora de inicio');
          }
        }
      }
    },
    tipo: {
      type: DataTypes.ENUM(...Object.values(TipoDisponibilidad)),
      allowNull: false,
      defaultValue: TipoDisponibilidad.LABORAL
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'El motivo no puede exceder 255 caracteres'
        }
      }
    },
    // Relación con odontólogo
    odontologoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'odontologos',
        key: 'userId'
      }
    }
  }, {
    tableName: 'disponibilidades',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['fecha', 'odontologoId'],
        unique: false
      },
      {
        fields: ['tipo']
      }
    ],
    validate: {
      // Validación personalizada para asegurar que los bloques no se solapen
      noSolapamiento() {
        // Esta validación se implementará en el servicio
      },
      // Validación para bloques mínimos de 1 hora
      bloqueMinimo() {
        if (this.horaInicio && this.horaFin) {
          const inicio = new Date(`2000-01-01T${this.horaInicio}`);
          const fin = new Date(`2000-01-01T${this.horaFin}`);
          const duracionMinutos = (fin - inicio) / (1000 * 60);
          
          if (duracionMinutos < 60) {
            throw new Error('Los bloques de disponibilidad deben ser de al menos 1 hora');
          }
        }
      }
    }
  });

  // Métodos de instancia
  Disponibilidad.prototype.obtenerDuracionMinutos = function() {
    const inicio = new Date(`2000-01-01T${this.horaInicio}`);
    const fin = new Date(`2000-01-01T${this.horaFin}`);
    return (fin - inicio) / (1000 * 60);
  };

  Disponibilidad.prototype.esLaboral = function() {
    return this.tipo === TipoDisponibilidad.LABORAL;
  };

  Disponibilidad.prototype.esNoLaboral = function() {
    return this.tipo === TipoDisponibilidad.NOLABORAL;
  };

  // Métodos estáticos
  Disponibilidad.obtenerDisponibilidadPorFecha = function(fecha, odontologoId) {
    return this.findAll({
      where: {
        fecha,
        odontologoId
      },
      order: [['horaInicio', 'ASC']]
    });
  };

  Disponibilidad.verificarSolapamiento = function(fecha, horaInicio, horaFin, odontologoId, disponibilidadIdExcluir = null) {
    const where = {
      fecha,
      odontologoId,
      [sequelize.Op.or]: [
        {
          [sequelize.Op.and]: [
            { horaInicio: { [sequelize.Op.lte]: horaInicio } },
            { horaFin: { [sequelize.Op.gt]: horaInicio } }
          ]
        },
        {
          [sequelize.Op.and]: [
            { horaInicio: { [sequelize.Op.lt]: horaFin } },
            { horaFin: { [sequelize.Op.gte]: horaFin } }
          ]
        },
        {
          [sequelize.Op.and]: [
            { horaInicio: { [sequelize.Op.gte]: horaInicio } },
            { horaFin: { [sequelize.Op.lte]: horaFin } }
          ]
        }
      ]
    };

    if (disponibilidadIdExcluir) {
      where.id = {
        [sequelize.Op.ne]: disponibilidadIdExcluir
      };
    }

    return this.findOne({ where });
  };

  Disponibilidad.generarSlotsDisponibles = function(fecha, odontologoId, duracionSlot = 30) {
    return this.findAll({
      where: {
        fecha,
        odontologoId,
        tipo: TipoDisponibilidad.LABORAL
      },
      order: [['horaInicio', 'ASC']]
    }).then(disponibilidades => {
      const slots = [];
      
      disponibilidades.forEach(disp => {
        const inicio = new Date(`2000-01-01T${disp.horaInicio}`);
        const fin = new Date(`2000-01-01T${disp.horaFin}`);
        
        let slotActual = new Date(inicio);
        
        while (slotActual.getTime() + (duracionSlot * 60000) <= fin.getTime()) {
          const slotFin = new Date(slotActual.getTime() + (duracionSlot * 60000));
          
          slots.push({
            inicio: slotActual.toTimeString().slice(0, 5),
            fin: slotFin.toTimeString().slice(0, 5),
            duracion: duracionSlot
          });
          
          slotActual = new Date(slotActual.getTime() + (duracionSlot * 60000));
        }
      });
      
      return slots;
    });
  };

  return Disponibilidad;
};
