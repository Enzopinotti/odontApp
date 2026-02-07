import { Sequelize } from 'sequelize';
import { sequelize } from '../../../config/db.js';

import defineBudget from './Budget.js';
import defineBudgetItem from './BudgetItem.js';
import defineInvoice from './Invoice.js';
import defineInvoiceItem from './InvoiceItem.js';

// 1. 👇 IMPORTAMOS LA DEFINICIÓN DE ASOCIACIONES
import defineAssociations from './Associations.js';

// Importar modelos externos
import { Tratamiento, Paciente } from '../../Clinica/models/index.js';
// 2. 👇 AGREGAMOS ODONTOLOGO AQUÍ
import { Usuario, Odontologo } from '../../Usuarios/models/index.js';

// Inicializar modelos de Finanzas
const Budget = defineBudget(sequelize, Sequelize.DataTypes);
const BudgetItem = defineBudgetItem(sequelize, Sequelize.DataTypes);
const Invoice = defineInvoice(sequelize, Sequelize.DataTypes);
const InvoiceItem = defineInvoiceItem(sequelize, Sequelize.DataTypes);

const localModels = {
  Budget,
  BudgetItem,
  Invoice,
  InvoiceItem
};

// 3. 👇 PREPARAMOS EL OBJETO CON TODOS LOS MODELOS
// Mapeamos 'Factura' a 'Invoice' para que tu archivo Associations.js funcione
const allModels = {
  ...localModels,
  Factura: Invoice,       // Alias para compatibilidad con Associations.js
  Presupuesto: Budget,    // Alias para compatibilidad
  Tratamiento,
  Paciente,
  Usuario,
  Odontologo // 👈 ¡IMPORTANTE!
};

// 4. 👇 EJECUTAMOS LAS ASOCIACIONES EXTERNAS (Tu archivo Associations.js)
if (defineAssociations) {
    defineAssociations(allModels);
}

// Ejecutar asociaciones internas (si quedaron algunas dentro de las clases)
Object.keys(localModels).forEach((modelName) => {
  if (localModels[modelName].associate) {
    localModels[modelName].associate(allModels);
  }
});

export { Budget, BudgetItem, Invoice, InvoiceItem };
export default allModels;