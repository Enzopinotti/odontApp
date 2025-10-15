import ISujeto from "./ISujeto.js";

export default class TurnoSujeto extends ISujeto {
  constructor(turno) {
    super();
    this.turno = turno;
    this.observadores = [];
  }

  suscribir(observer) {
    this.observadores.push(observer);
  }

  desuscribir(observer) {
    this.observadores = this.observadores.filter(o => o !== observer);
  }

  notificarObservadores() {
    console.log("🔔 Notificando a los observadores del turno...");
    for (const obs of this.observadores) {
      obs.update(this.turno);
    }
  }
}
