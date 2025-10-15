// modules/Notificador/service/notificacionService.js
import TurnoSujeto from "../subject/turnoSujeto.js";
import PacienteObserver from "../observers/pacienteObservador.js";
import OdontologoObserver from "../observers/odontologoObserver.js";

import AppNotificador from "../notifiers/appNotificador.js";
import EmailNotificador from "../notifiers/emailNotificador.js";
import WhatsAppNotificador from "../notifiers/whatsappNotificador.js";

export default class NotificacionService {

static async enviarNotificacionesTurno(turno, mensaje) {
  const turnoSujeto = new TurnoSujeto(turno);

  const pacienteObs = new PacienteObserver(turno.paciente);
  const odontologoObs = new OdontologoObserver(turno.odontologo);

  // Todos los observers usan el mismo mensaje
  pacienteObs.configurarNotificadores([new EmailNotificador()], mensaje);
  odontologoObs.configurarNotificadores([new AppNotificador()], mensaje);

  turnoSujeto.suscribir(pacienteObs);
  turnoSujeto.suscribir(odontologoObs);

  await turnoSujeto.notificarObservadores();
}
}
