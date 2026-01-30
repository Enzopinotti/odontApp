// frontend/src/api/admin.js
import api from './axios';

export const getUsuarios = (params) => api.get('/usuarios', { params });
export const getUsuario = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);

export const getRoles = () => api.get('/usuarios/roles');
export const getRol = (id) => api.get(`/usuarios/roles/${id}`);
export const updateRolPermisos = (id, permisosIds) => api.put(`/usuarios/roles/${id}/permisos`, { permisosIds });
export const getTodosPermisos = () => api.get('/usuarios/permisos');

