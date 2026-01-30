import { Paciente } from '../models/index.js';
import ApiError from '../../../utils/ApiError.js';
import cloudinary from '../../../utils/upload/cloudinary.js';
import * as repo from '../repositories/historiaClinicaRepository.js';

/* ---------- Obtener historias de un paciente ---------- */
export const obtenerPorPaciente = async (pacienteId) => {
  const paciente = await Paciente.findByPk(pacienteId);
  if (!paciente) {
    throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');
  }
  return repo.findByPaciente(pacienteId);
};

/* ---------- Obtener historia por ID ---------- */
export const obtenerPorId = async (id) => {
  const historia = await repo.findById(id);
  if (!historia) {
    throw new ApiError('Historia clínica no encontrada', 404, null, 'HISTORIA_NO_EXISTE');
  }
  return historia;
};

/* ---------- Crear nueva historia ---------- */
export const crear = async (pacienteId, data, imagenes = []) => {
  const historia = await repo.create({
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

    await repo.bulkCreateImagenes(registros);
  }

  return obtenerPorId(historia.id);
};

/* ---------- Actualizar historia ---------- */
export const actualizar = async (id, data) => {
  const historia = await repo.update(id, {
    titulo: data.titulo,
    descripcion: data.descripcion,
    fecha: data.fecha,
  });
  if (!historia) return null;

  // ✅ Si esta historia es la más reciente, actualizamos ultimaVisita
  const historiasPaciente = await repo.findByPaciente(historia.pacienteId);
  if (historiasPaciente.length > 0) {
    await Paciente.update(
      { ultimaVisita: historiasPaciente[0].fecha }, // [0] porque ya viene ordenado DESC
      { where: { id: historia.pacienteId } }
    );
  }

  return obtenerPorId(id);
};

/* ---------- Eliminar historia ---------- */
export const eliminar = async (id) => {
  const historia = await repo.findById(id);
  if (!historia) return null;

  const imagenes = await repo.getImagenesByHistoria(id);

  for (const img of imagenes) {
    try {
      const parts = img.url.split('/');
      const publicId = parts.slice(-2).join('/').split('.')[0]; // odontapp/historias/xxxx
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      console.warn('⚠️ No se pudo borrar imagen:', img.url);
    }
  }

  await repo.remove(id);
  return true;
};

/* ---------- Crear imagen individual ---------- */
export const crearImagen = async (historiaClinicaId, data) => {
  const historia = await repo.findById(historiaClinicaId);
  if (!historia) {
    throw new ApiError('Historia clínica no encontrada', 404, null, 'HISTORIA_NO_EXISTE');
  }

  return repo.createImagen({
    historiaClinicaId,
    tipo: data.tipo || 'Fotografía',
    url: data.url,
    fechaCarga: data.fechaCarga || new Date(),
  });
};

/* ---------- Obtener imágenes por paciente ---------- */
export const obtenerImagenesPorPaciente = async (pacienteId) => {
  return repo.getImagenesByHistoria(pacienteId);
};

/* ---------- Eliminar imagen individual ---------- */
export const eliminarImagen = async (imagenId) => {
  const imagen = await repo.removeImagen(imagenId);
  if (!imagen) {
    throw new ApiError('Imagen no encontrada', 404, null, 'IMAGEN_NO_EXISTE');
  }

  // Eliminar de Cloudinary
  try {
    const parts = imagen.url.split('/');
    const publicId = parts.slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn('⚠️ Error al borrar imagen de Cloudinary:', imagen.url);
  }

  return true;
};
