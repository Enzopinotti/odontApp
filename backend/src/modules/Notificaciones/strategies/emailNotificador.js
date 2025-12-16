import INotificador from './INotificador.js';
import { enviarCorreo } from '../../../services/emailService.js';

export default class EmailNotificador extends INotificador {
  async notificar(usuario, mensaje) {
    if (!usuario.email) return;

    await enviarCorreo({
      to: usuario.email,
      subject: 'Notificación de turno',
      html: `<p>${mensaje}</p>`
    });
  }
}
