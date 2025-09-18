import api from "../api/axios";

// Listar todos los odontólogos (con filtros opcionales)
export const getOdontologos = (params = {}) =>
  api.get("/odontologos", { params }).then((res) => res.data);

// Traer un odontólogo por ID
export const getOdontologoById = (id) =>
  api.get(`/odontologos/${id}`).then((res) => res.data);



export const getOdontologosPorEspecialidad = (especialidadId) =>
  api
    .get("/odontologos", { params: { especialidadId } })
    .then((res) => res.data);
