const { body } = require('express-validator');

exports.validarCreacion = [
  body('nombreGenerico')
    .notEmpty().withMessage('El nombre genérico es obligatorio.')
    .isString().withMessage('El nombre debe ser texto.'),

  body('formaFarmaceutica')
    .notEmpty().withMessage('La forma farmacéutica es obligatoria.'),

  body('concentracion')
    .notEmpty().withMessage('La concentración es obligatoria.'),

  body('presentacion')
    .notEmpty().withMessage('La presentación es obligatoria.'),
];

exports.validarBusquedaCompleta = [
  body('nombreGenerico').notEmpty().withMessage('Debe indicar el nombre genérico.'),
  body('formaFarmaceutica').notEmpty().withMessage('Debe indicar la forma farmacéutica.'),
  body('concentracion').notEmpty().withMessage('Debe indicar la concentración.'),
  body('presentacion').notEmpty().withMessage('Debe indicar la presentación.'),
];
