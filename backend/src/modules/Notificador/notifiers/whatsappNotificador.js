import INotificador from "./INotificador.js";

export default class WhatsAppNotificador extends INotificador {
  enviarNotificacion(turno) {
    console.log(
      `💬 [WhatsApp] Notificación: turno ${turno?.id || "(sin id)"} actualizado.`
    );
  }
}
