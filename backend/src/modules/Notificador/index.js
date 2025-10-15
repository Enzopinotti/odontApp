import TurnoSujeto from "./subject/turnoSujeto.js";
import PacienteObserver from "./observers/pacienteObservador.js";
import OdontologoObserver from "./observers/odontologoObserver.js";

import AppNotificador from "./notifiers/appNotificador.js";
import WhatsAppNotificador from "./notifiers/whatsappNotificador.js";
import EmailNotificador from "./notifiers/emailNotificador.js";

// Mocks
const paciente = { id: 1, nombre: "Juan Pérez" };
const odontologo = { id: 99, nombre: "Dra. López" };
const turno = { id: 123, fecha: new Date(), estado: "pendiente" };

function demo() {
  const turnoSujeto = new TurnoSujeto(turno);

  const pacienteObs = new PacienteObserver(paciente);
  pacienteObs.configurarNotificadores([new EmailNotificador()]);

  const odontologoObs = new OdontologoObserver(odontologo);
  odontologoObs.configurarNotificadores([new AppNotificador()]);

  turnoSujeto.suscribir(pacienteObs);
  turnoSujeto.suscribir(odontologoObs);

  console.log("\n=== Cambio en el turno ===");
  turno.estado = "confirmado";
  turnoSujeto.notificarObservadores();
}

demo();
