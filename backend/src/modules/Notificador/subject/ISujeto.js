export default class ISujeto {
  suscribir(observer) {
    throw new Error("Método 'suscribir(observer)' debe ser implementado.");
  }

  desuscribir(observer) {
    throw new Error("Método 'desuscribir(observer)' debe ser implementado.");
  }

  notificarObservadores() {
    throw new Error("Método 'notificarObservadores()' debe ser implementado.");
  }
}
