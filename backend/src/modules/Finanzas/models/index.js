import { Sequelize } from 'sequelize';
import { sequelize } from '../../../config/db.js';

import defineBudget from './Budget.js';
import defineBudgetItem from './BudgetItem.js';
import defineInvoice from './Invoice.js';
import defineInvoiceItem from './InvoiceItem.js';

// Importar modelos externos (Solo para referencia de FKs)
import { Tratamiento, Paciente } from '../../Clinica/models/index.js';
import { Usuario } from '../../Usuarios/models/index.js';

// 1. Inicializar SOLO los modelos de Finanzas
const Budget = defineBudget(sequelize, Sequelize.DataTypes);
const BudgetItem = defineBudgetItem(sequelize, Sequelize.DataTypes);
const Invoice = defineInvoice(sequelize, Sequelize.DataTypes);
const InvoiceItem = defineInvoiceItem(sequelize, Sequelize.DataTypes);

// 2. Agrupar modelos locales (Los que vamos a configurar ahora)
const localModels = {
  Budget,
  BudgetItem,
  Invoice,
  InvoiceItem
};

// 3. Crear un objeto con TODOS los modelos para pasar como referencia
// (Así Invoice puede encontrar a Usuario, pero no ejecutamos Usuario.associate)
const allModels = {
  ...localModels,
  Tratamiento,
  Paciente,
  Usuario
};

// 4. Ejecutar asociaciones SOLO en los modelos locales
Object.keys(localModels).forEach((modelName) => {
  if (localModels[modelName].associate) {
    // Le pasamos 'allModels' para que Invoice pueda hacer belongsTo(allModels.Usuario)
    localModels[modelName].associate(allModels);
  }
});

export { Budget, BudgetItem, Invoice, InvoiceItem };
export default allModels;