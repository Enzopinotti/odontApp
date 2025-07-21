export const sanitizeUser = (u) => {
  if (!u) return null;
  const {
    password,
    intentosFallidos,
    bloqueadoHasta,
    deletedAt,
    ...safe
  } = u.toJSON ? u.toJSON() : u;
  return safe;
};
