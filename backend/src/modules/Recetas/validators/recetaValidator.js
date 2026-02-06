import {body, param, validationResult} from 'express-validator';
import ApiError from '../../../utils/ApiError.js';

const validate = (req, _res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return next(new ApiError('Invalid data', 422, errs.array()));
  next();
}

export const vCrearReceta = [
  body('pacienteId').isUUID().withMessage('Paciente ID es requerido'),
    body('odontologoId').isUUID().withMessage('Odontólogo ID es requerido'),
    body('diagnostico').notEmpty().withMessage('Diagnóstico es requerido'),
    body('indicaciones').optional().isString().withMessage('Indicaciones deben ser un texto')
    .isLength({ max: 1500 }).withMessage('Indicaciones no pueden exceder los 1500 caracteres'),
    body('fecha').isISO8601().withMessage('Fecha debe ser una fecha válida'),
    body('firmaOdontologo').isString().withMessage('Firma del odontólogo debe ser un texto'),
    body('medicamentos').isArray({min:1}).withMessage('Medicamentos debe ser un arreglo'),
    body('medicamentos.*.id').isUUID().withMessage('ID de medicamento es requerido'),
    body('medicamentos.*.dosis').notEmpty().withMessage('Dosis es requerida').isString().withMessage('Dosis debe ser un texto'),
    body('medicamentos.*.presentacion').notEmpty().withMessage('Presentación es requerida').isString().withMessage('Presentación debe ser un texto')    ,
    body('medicamentos.*.formaFarmaceutica').notEmpty().withMessage('Forma farmacéutica es requerida').isString().withMessage('Forma farmacéutica debe ser un texto'),
    validate];
export const vListarRecetas = [
    param('pacienteId').optional().isUUID().withMessage('ID de paciente debe ser un UUID válido'),
    body('fecha').optional().isISO8601().withMessage('Fecha debe ser una fecha válida'),
    body('odontologoId').optional().isUUID().withMessage('ID de odontólogo debe ser un UUID válido'),
    body('diagnostico').optional().isString().withMessage('Diagnóstico debe ser un texto'),
    body('indicaciones').optional().isString().withMessage('Indicaciones deben ser un texto')
    .isLength({ max: 1500 }).withMessage('Indicaciones no pueden exceder los 1500 caracteres'),
    body('medicamentos').optional().isArray().withMessage('Medicamentos debe ser un arreglo'),
    body('medicamentos.*.id').optional().isUUID().withMessage('ID de medicamento debe ser un UUID válido'),
    body('medicamentos.*.dosis').optional().isString().withMessage('Dosis debe ser un texto'),
    body('medicamentos.*.presentacion').optional().isString().withMessage('Presentación debe ser un texto'),
    body('medicamentos.*.formaFarmaceutica').optional().isString().withMessage('Forma farmacéutica debe ser un texto'),
    body('firmaOdontologo').optional().isString().withMessage('Firma del odontólogo debe ser un texto'),
    validate ];