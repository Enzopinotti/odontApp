// backend/src/modules/Clinica/services/historiaClinicaService.js

import {
  HistoriaClinica,
  ImagenClinica,
  Paciente,
} from '../models/index.js';
import ApiError from '../../../utils/ApiError.js';
import cloudinary from '../../../utils/upload/cloudinary.js';

/* ---------- Listar historias de un paciente ---------- */
export const listarPorPaciente = async (pacienteId) => {
  const paciente = await Paciente.findByPk(pacienteId);
  if (!paciente) {
    throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');
  }

  return HistoriaClinica.findAll({
    where: { pacienteId },
    order: [['fecha', 'DESC']],
    include: ImagenClinica,
  });
};

/* ---------- Obtener historia por ID ---------- */
export const obtenerPorId = async (id) => {
  const historia = await HistoriaClinica.findByPk(id, {
    include: ImagenClinica,
  });

  if (!historia) {
    throw new ApiError('Historia clínica no encontrada', 404, null, 'HISTORIA_NO_EXISTE');
  }

  return historia;
};

/* ---------- Crear nueva historia ---------- */
export const crear = async (pacienteId, data, imagenes = []) => {
  const historia = await HistoriaClinica.create({
    pacienteId,
    titulo: data.titulo,
    descripcion: data.descripcion,
    fecha: data.fecha || new Date(),
  });
  // ✅ Actualizamos ultimaVisita
  await Paciente.update(
    { ultimaVisita: historia.fecha },
    { where: { id: pacienteId } }
  );

  if (imagenes.length > 0) {
    const urls = await Promise.all(
      imagenes.map((img) =>
        cloudinary.uploader.upload(img.path, {
          folder: 'odontapp/historias',
        })
      )
    );

    const registros = urls.map((file) => ({
      historiaClinicaId: historia.id,
      url: file.secure_url,
      tipo: data.tipoImagen || 'Fotografía',
    }));

    await ImagenClinica.bulkCreate(registros);
  }

  return obtenerPorId(historia.id);
};

/* ---------- Actualizar historia ---------- */
export const actualizar = async (id, data) => {
  const historia = await HistoriaClinica.findByPk(id);
  if (!historia) return null;

  await historia.update({
    titulo: data.titulo,
    descripcion: data.descripcion,
    fecha: data.fecha,
  });

  // ✅ Si esta historia es la más reciente, actualizamos ultimaVisita
  const ultimaHistoria = await HistoriaClinica.findOne({
    where: { pacienteId: historia.pacienteId },
    order: [['fecha', 'DESC']],
  });
  if (ultimaHistoria) {
    await Paciente.update(
      { ultimaVisita: ultimaHistoria.fecha },
      { where: { id: historia.pacienteId } }
    );
  }

  return obtenerPorId(id);
};

/* ---------- Eliminar historia ---------- */
export const eliminar = async (id) => {
  const historia = await HistoriaClinica.findByPk(id);
  if (!historia) return null;

  const imagenes = await ImagenClinica.findAll({ where: { historiaClinicaId: id } });

  for (const img of imagenes) {
    try {
      const parts = img.url.split('/');
      const publicId = parts.slice(-2).join('/').split('.')[0]; // odontapp/historias/xxxx
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      console.warn('⚠️ No se pudo borrar imagen:', img.url);
    }
  }

  await historia.destroy();
  return true;
};

export const obtenerImagenesPorPaciente = async (pacienteId) => {
  return ImagenClinica.findAll({
    include: {
      model: HistoriaClinica,
      where: { pacienteId },
      attributes: [],
    },
    order: [['fechaCarga', 'DESC']],
  });
};


export const eliminarImagen = async (imagenId) => {
  const imagen = await ImagenClinica.findByPk(imagenId);
  if (!imagen) {
    throw new ApiError('Imagen no encontrada', 404, null, 'IMAGEN_NO_EXISTE');
  }

  // Eliminar de Cloudinary
  try {
    const parts = imagen.url.split('/');
    const publicId = parts.slice(-2).join('/').split('.')[0]; // odontapp/historias/xxxx
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn('⚠️ Error al borrar imagen de Cloudinary:', imagen.url);
  }

  await imagen.destroy();
  return true;
};
