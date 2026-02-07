import * as odontogramaSvc from '../services/odontogramaService.js';
import ApiError from '../../../utils/ApiError.js';

export const obtenerOdontograma = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId, 10);
  if (isNaN(pacienteId)) throw new ApiError('ID inválido', 400, null, 'PACIENTE_ID_INVALIDO');

  // 1. Buscamos el odontograma
  let odontograma = await odontogramaSvc.obtenerPorPaciente(pacienteId);

  // 2. 🚨 FIX: Si no existe, lo creamos automáticamente en vez de tirar error
  if (!odontograma) {
    console.log(`ℹ️ Paciente ${pacienteId} sin odontograma. Generando uno nuevo...`);
    
    // Usamos el servicio de creación que ya tienes importado
    odontograma = await odontogramaSvc.crearParaPaciente(pacienteId, {
        observaciones: 'Odontograma inicial automático',
        fechaCreacion: new Date()
    });
  }

  res.ok(odontograma);
};

export const crearOdontograma = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId, 10);
  if (isNaN(pacienteId)) throw new ApiError('ID inválido', 400, null, 'PACIENTE_ID_INVALIDO');
  
  const yaExiste = await odontogramaSvc.existeParaPaciente(pacienteId);
  if (yaExiste) throw new ApiError('El paciente ya tiene un odontograma', 409, null, 'ODONTOGRAMA_DUPLICADO');
  
  const odontograma = await odontogramaSvc.crearParaPaciente(pacienteId, req.body);
  res.created(odontograma, 'Odontograma creado correctamente');
};

export const actualizarDiente = async (req, res) => {
  const odontogramaId = parseInt(req.params.odontogramaId, 10);
  const numero = req.params.numero;
  
  if (isNaN(odontogramaId)) throw new ApiError('ID de odontograma inválido', 400, null, 'ODONTOGRAMA_ID_INVALIDO');
  if (!numero || typeof numero !== 'string') throw new ApiError('Número de diente inválido', 400, null, 'NUMERO_DIENTE_INVALIDO');
  
  const diente = await odontogramaSvc.actualizarDiente(odontogramaId, numero, req.body);
  if (!diente) throw new ApiError('Diente no encontrado', 404, null, 'DIENTE_NO_EXISTE');
  
  res.ok(diente, 'Diente actualizado');
};

export const agregarCaraTratada = async (req, res) => {
  const dienteId = parseInt(req.params.dienteId, 10);
  if (isNaN(dienteId)) throw new ApiError('ID de diente inválido', 400, null, 'DIENTE_ID_INVALIDO');
  
  const cara = await odontogramaSvc.agregarCara(dienteId, req.body);
  res.created(cara, 'Cara tratada registrada');
};

export const actualizarCaraTratada = async (req, res) => {
  const caraId = parseInt(req.params.caraId, 10);
  if (isNaN(caraId)) throw new ApiError('ID inválido', 400, null, 'CARA_ID_INVALIDO');
  
  const actualizada = await odontogramaSvc.actualizarCara(caraId, req.body);
  if (!actualizada) throw new ApiError('Cara no encontrada', 404, null, 'CARA_NO_EXISTE');
  
  res.ok(actualizada, 'Cara tratada actualizada');
};

export const eliminarCaraTratada = async (req, res) => {
  const caraId = parseInt(req.params.caraId, 10);
  if (isNaN(caraId)) throw new ApiError('ID inválido', 400, null, 'CARA_ID_INVALIDO');
  
  const eliminada = await odontogramaSvc.eliminarCara(caraId);
  if (!eliminada) throw new ApiError('Cara no encontrada', 404, null, 'CARA_NO_EXISTE');
  
  res.ok(null, 'Cara tratada eliminada');
};

export const aplicarTratamiento = async (req, res) => {
  const dienteId = parseInt(req.params.dienteId, 10);
  if (isNaN(dienteId)) throw new ApiError('ID de diente inválido', 400, null, 'DIENTE_ID_INVALIDO');
  
  const out = await odontogramaSvc.aplicarTratamiento(dienteId, req.body);
  res.created(out, 'Tratamiento aplicado');
};