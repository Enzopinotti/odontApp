export function calcularEdad(fechaNacimientoStr) {
  const fechaNacimiento = new Date(fechaNacimientoStr);
  const hoy = new Date();

  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();

  // Si todavía no cumplió años este año, restamos 1
  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
}
