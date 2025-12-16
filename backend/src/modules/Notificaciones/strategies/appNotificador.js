import INotificador from './INotificador.js';

export default class AppNotificador extends INotificador {
  async notificar(usuario, mensaje) {
    console.log(`📲 APP → ${usuario.nombre}: ${mensaje}`);
    // futuro: guardar en tabla notifications
  }
}
