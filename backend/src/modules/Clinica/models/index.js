/**
 * Inicializa los modelos del módulo Clínica y aplica sus asociaciones.
 * Se exporta cada modelo individualmente para ser reutilizado en controladores/servicios.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';
import applyAssociations from './associations.js';

/* ------- Definiciones de modelos ------- */
import pacienteModel from './paciente.js';
import contactoModel from './contacto.js';
import direccionModel from './direccion.js';
import firmaDigitalModel from './firmaDigital.js';
import historiaClinicaModel from './historiaClinica.js';
import odontogramaModel from './odontograma.js';
import dienteModel from './diente.js';
import caraTratadaModel from './caraTratada.js';
import tratamientoModel from './tratamiento.js';
import imagenClinicaModel from './imagenClinica.js';
import antecedenteMedicoModel from './antecedenteMedico.js';

/* ------- Inicialización ------- */
const Paciente          = pacienteModel(sequelize, DataTypes);
const Contacto          = contactoModel(sequelize, DataTypes);
const Direccion         = direccionModel(sequelize, DataTypes);
const FirmaDigital      = firmaDigitalModel(sequelize, DataTypes);
const HistoriaClinica   = historiaClinicaModel(sequelize, DataTypes);
const Odontograma       = odontogramaModel(sequelize, DataTypes);
const Diente            = dienteModel(sequelize, DataTypes);
const CaraTratada       = caraTratadaModel(sequelize, DataTypes);
const Tratamiento       = tratamientoModel(sequelize, DataTypes);
const ImagenClinica     = imagenClinicaModel(sequelize, DataTypes);
const AntecedenteMedico = antecedenteMedicoModel(sequelize, DataTypes);

/* ------- Asociaciones ------- */
applyAssociations(sequelize.models);

/* ------- Exports ------- */
export {
  sequelize,
  Paciente,
  Contacto,
  Direccion,
  FirmaDigital,
  HistoriaClinica,
  Odontograma,
  Diente,
  CaraTratada,
  Tratamiento,
  ImagenClinica,
  AntecedenteMedico,
};
