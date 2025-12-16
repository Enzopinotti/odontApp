import IObservador from "./IObservador.js";

export default class PacienteObserver extends IObservador {
  constructor(paciente) {
    super();
    this.paciente = paciente; // ⚠️ Placeholder: vendrá del módulo Pacientes
    this.notificadores = [];  // Lista de estrategias
  }

  configurarNotificadores(notificadores) {
    // Recibe un array de estrategias (email, whatsapp, etc.)
    this.notificadores = notificadores;
  }

  update(turno) {
    console.log(
      `Notificando al paciente ${this.paciente?.nombre || "(pendiente integración)"}`
    );

    this.notificadores.forEach(n => n.enviarNotificacion(turno));
  }
}
