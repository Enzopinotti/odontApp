const express = require('express');
const router = express.Router();

const MedicamentoController = require('../controllers/medicamentoController');
const MedicamentoValidator = require('../validators/MedicamentoValidator');
const handleValidationErrors = require('../validators/handleValidationErrors');

// ───────────────────────────────
// 🔍 Búsqueda jerárquica

router.get('/nombres-genericos', MedicamentoController.getNombresGenericos);

router.get('/:nombreGenerico/formas-farmaceuticas', MedicamentoController.getFormasFarmaceuticas);

router.get('/:nombreGenerico/:formaFarmaceutica/concentraciones', MedicamentoController.getConcentraciones);

router.get('/:nombreGenerico/:formaFarmaceutica/:concentracion/presentaciones', MedicamentoController.getPresentaciones);

// 🔎 Búsqueda final por combinación completa
router.post(
  '/buscar',
  MedicamentoValidator.validarBusquedaCompleta,
  handleValidationErrors,
  MedicamentoController.getMedicamentoCompleto
);

// ───────────────────────────────
// ➕ Crear nuevo medicamento

router.post(
  '/crear',
  MedicamentoValidator.validarCreacion,
  handleValidationErrors,
  MedicamentoController.crearMedicamento
);

// ✏️ Actualizar un medicamento por ID
router.put(
  '/:id',
  MedicamentoValidator.validarCreacion,
  handleValidationErrors,
  MedicamentoController.actualizarMedicamento
);

// 🗑️ Eliminar un medicamento por ID
router.delete('/:id', MedicamentoController.eliminarMedicamento);

module.exports = router;
