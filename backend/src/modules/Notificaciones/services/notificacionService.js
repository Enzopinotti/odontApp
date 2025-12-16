import TurnoSujeto from '../subject/turnoSujeto.js';

import PacienteObservador from '../observers/pacienteObservador.js';
import OdontologoObservador from '../observers/odontologoObservador.js';

import EmailNotificador from '../notifiers/emailNotificador.js';
import AppNotificador from '../notifiers/appNotificador.js';
import WhatsAppNotificador from '../notifiers/whatsappNotificador.js';

import TurnoEvento from '../events/turnoEvento.js';

export default class NotificacionService {

  /**
   * Facade principal del módulo de notificaciones
   */
  static async notificarTurno(turno, tipoEvento, canales = []) {
    const sujeto = new TurnoSujeto();

    // Crear evento de dominio
    const evento = new TurnoEvento(turno, tipoEvento);

    // Crear estrategias de notificación
    const notificadores = this._crearNotificadores(canales);

    // Suscribir observadores
    sujeto.suscribir(
      new PacienteObservador(turno.paciente, notificadores)
    );

    sujeto.suscribir(
      new OdontologoObservador(turno.odontologo, notificadores)
    );

    // Disparar notificación
    await sujeto.notificar(evento);
  }

  /**
   * Simple Factory de notificadores (Strategy)
   */
  static _crearNotificadores(canales) {
    return canales.map(canal => {
      switch (canal) {
        case 'EMAIL':
          return new EmailNotificador();
        case 'APP':
          return new AppNotificador();
        case 'WHATSAPP':
          return new WhatsAppNotificador();
        default:
          throw new Error(`Canal de notificación no soportado: ${canal}`);
      }
    });
  }
}
