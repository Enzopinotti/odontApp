import {
  HistoriaClinica,
  ImagenClinica,
} from '../models/index.js';
import { Op } from 'sequelize';

/* ---------- Obtener todas las entradas por paciente ---------- */
export const findByPaciente = (pacienteId) =>
  HistoriaClinica.findAll({
    where: { pacienteId },
    include: [ImagenClinica],
    order: [['fecha', 'DESC']],
  });

/* ---------- Obtener una entrada específica ---------- */
export const findById = (id) =>
  HistoriaClinica.findByPk(id, {
    include: [ImagenClinica],
  });

/* ---------- Crear nueva entrada ---------- */
export const create = (data) =>
  HistoriaClinica.create(data);

/* ---------- Subir imágenes clínicas asociadas ---------- */
export const bulkCreateImagenes = (imagenes) =>
  ImagenClinica.bulkCreate(imagenes);

/* ---------- Crear imagen individual (formulario o carga directa) ---------- */
export const createImagen = (data) =>
  ImagenClinica.create(data);

/* ---------- Actualizar entrada ---------- */
export const update = (historia, data) =>
  historia.update(data);

/* ---------- Eliminar entrada ---------- */
export const remove = (historia) =>
  historia.destroy();

/* ---------- Eliminar imagen individual ---------- */
export const removeImagen = (imagen) =>
  imagen.destroy();

/* ---------- Buscar imágenes por historia clínica ---------- */
export const getImagenesByHistoria = (historiaClinicaId) =>
  ImagenClinica.findAll({
    where: { historiaClinicaId },
  });

export default {
  findByPaciente,
  findById,
  create,
  update,
  remove,
  createImagen,
  bulkCreateImagenes,
  getImagenesByHistoria,
  removeImagen,
};
