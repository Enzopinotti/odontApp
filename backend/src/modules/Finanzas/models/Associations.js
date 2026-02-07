// backend/src/modules/Finanzas/models/Associations.js

export default (models) => {
  
  const { Invoice, Odontologo } = models;
  
  // Ejemplo: Si quieres que Odontologo sepa sus facturas (Relación Inversa):
  if (Odontologo && Invoice && !Odontologo.associations.facturas) {
      Odontologo.hasMany(Invoice, {
        foreignKey: 'odontologoId',
        as: 'facturas'
      });
  }
};