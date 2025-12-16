import INotificador from './INotificador.js';

export default class WhatsAppNotificador extends INotificador {
  async notificar(usuario, mensaje) {
    console.log(`💬 WhatsApp → ${usuario.nombre}: ${mensaje}`);
  }
}
    // futuro: integrar con API de WhatsApp