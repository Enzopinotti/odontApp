export default class TurnoEvento {
  constructor(turno, tipo) {
    this.turno = turno;
    this.tipo = tipo;
  }

  mensajeParaPaciente() {
    switch (this.tipo) {
      case 'CREACION':
        return `Su turno fue confirmado para el ${this._fecha()}`;
      case 'MODIFICACION':
        return `Su turno fue reprogramado para el ${this._fecha()}`;
      case 'CANCELACION':
        return `Su turno fue cancelado`;
      case 'RECORDATORIO':
        return `Recordatorio: tiene un turno el ${this._fecha()}`;
      default:
        return 'Notificación de turno';
    }
  }

  mensajeParaOdontologo() {
    switch (this.tipo) {
      case 'CREACION':
        return `Nuevo turno asignado para el ${this._fecha()}`;
      case 'MODIFICACION':
        return `Turno modificado: ${this._fecha()}`;
      case 'CANCELACION':
        return `Turno cancelado`;
      case 'RECORDATORIO':
        return `Recordatorio de turno ${this._fecha()}`;
      default:
        return 'Notificación de turno';
    }
  }

  _fecha() {
    return new Date(this.turno.fechaHora).toLocaleString();
  }
}
