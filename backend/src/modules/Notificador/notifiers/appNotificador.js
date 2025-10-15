import INotificador from "./INotificador.js";

export default class AppNotificador extends INotificador {
  enviarNotificacion(turno) {
    console.log(
      `📱 [APP] Notificación: turno ${turno?.id || "(sin id)"} actualizado.`
    );
  }
}
