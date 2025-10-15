import IObservador from "./IObservador.js";

export default class OdontologoObserver extends IObservador {
  constructor(odontologo) {
    super();
    this.odontologo = odontologo; // ⚠️ Placeholder: vendrá del módulo Odontólogos
    this.notificadores = [];
  }

  configurarNotificadores(notificadores) {
    this.notificadores = notificadores;
  }

  update(turno) {
    console.log(
      `Notificando al odontólogo ${this.odontologo?.nombre || "(pendiente integración)"}`
    );

    this.notificadores.forEach(n => n.enviarNotificacion(turno));
  }
}
