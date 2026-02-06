import { body } from 'express-validator';


export const validarCreacion = [
  body('nombreGenerico')
    .notEmpty().withMessage('El nombre genérico es obligatorio.')
    .isString().withMessage('El nombre debe ser texto.'),

  body('formaFarmaceutica')
    .notEmpty().withMessage('La forma farmacéutica es obligatoria.'),

  body('dosis')
    .notEmpty().withMessage('La concentración es obligatoria.'),

  body('presentacion')
    .notEmpty().withMessage('La presentación es obligatoria.'),
];


export const validarBusquedaCompleta = [
  body('nombreGenerico').notEmpty().withMessage('Debe indicar el nombre genérico.'),
  body('formaFarmaceutica').notEmpty().withMessage('Debe indicar la forma farmacéutica.'),
  body('dosis').notEmpty().withMessage('Debe indicar la concentración.'),
  body('presentacion').notEmpty().withMessage('Debe indicar la presentación.'),
];
