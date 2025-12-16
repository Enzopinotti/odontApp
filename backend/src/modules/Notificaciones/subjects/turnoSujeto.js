import ISujeto from './ISujeto.js';

export default class TurnoSujeto extends ISujeto {
  constructor() {
    super();
    this.observadores = [];
  }

  suscribir(observador) {
    this.observadores.push(observador);
  }

  desuscribir(observador) {
    this.observadores = this.observadores.filter(o => o !== observador);
  }

  async notificar(evento) {
    for (const observador of this.observadores) {
      await observador.actualizar(evento);
    }
  }
}
