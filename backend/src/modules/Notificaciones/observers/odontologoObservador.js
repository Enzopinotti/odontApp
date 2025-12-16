import IObservador from './IObservador.js';

export default class OdontologoObservador extends IObservador {
  constructor(odontologo, notificadores) {
    super();
    this.odontologo = odontologo;
    this.notificadores = notificadores;
  }

async actualizar(evento) {
  const mensaje = evento.mensajeParaOdontologo();

  for (const notificador of this.notificadores) {
    await notificador.notificar(this.odontologo, mensaje);
  }
}
}
