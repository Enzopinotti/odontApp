import IObservador from './IObservador.js';

export default class PacienteObservador extends IObservador {
  constructor(paciente, notificadores) {
    super();
    this.paciente = paciente;
    this.notificadores = notificadores;
  }

async actualizar(evento) {
  const mensaje = evento.mensajeParaPaciente();

  for (const notificador of this.notificadores) {
    await notificador.notificar(this.paciente, mensaje);
  }
}

}
