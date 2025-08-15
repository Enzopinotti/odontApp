// backend/src/modules/Clinica/models/firmaDigital.js

export default (sequelize, DataTypes) => {
  return sequelize.define('FirmaDigital', {
    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    imagen: {
      type: DataTypes.TEXT, // Base64 o URL
      allowNull: false,
    },
    tipoDocumento: {
      type: DataTypes.INTEGER, // Podés usar un ENUM si hay tipos definidos
      allowNull: false,
    },
    valida: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'firmas_digitales',
    timestamps: true,
    paranoid: true,
  });
};
