import { Router } from "express";
import {
  vCrearPaciente,
  vActualizarPaciente,
} from "../validators/PacienteValidator.js";
import PacienteController from "../controllers/PacienteController.js";

const router = Router();

//listar pacientes
router.get("/", PacienteController.listarPacientes);
//crear paciente
router.post("/", vCrearPaciente, PacienteController.crearPaciente);
//obtener paciente por ID
router.get("/:id", PacienteController.getPaciente);
//actualizar paciente
router.put("/:id", vActualizarPaciente, PacienteController.actualizarPaciente);
//eliminar paciente
router.delete("/:id", PacienteController.eliminarPaciente);
export default router;
