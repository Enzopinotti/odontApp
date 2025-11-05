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
export const update = async (id, data) => {
  const historia = await HistoriaClinica.findByPk(id);
  if (!historia) return null;
  return await historia.update(data);
};

/* ---------- Eliminar entrada ---------- */
export const remove = async (id) => {
  const historia = await HistoriaClinica.findByPk(id);
  if (!historia) return null;
  await historia.destroy();
  return historia;
};

/* ---------- Eliminar imagen individual ---------- */
export const removeImagen = async (id) => {
  const imagen = await ImagenClinica.findByPk(id);
  if (!imagen) return null;
  await imagen.destroy();
  return imagen;
};

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
