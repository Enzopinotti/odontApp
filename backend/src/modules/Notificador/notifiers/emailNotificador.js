import INotificador from "./INotificador.js";

export default class EmailNotificador extends INotificador {
  enviarNotificacion(turno) {
    console.log(
      `📧 [Email] Notificación: turno ${turno?.id || "(sin id)"} actualizado.`
    );
  }
}
