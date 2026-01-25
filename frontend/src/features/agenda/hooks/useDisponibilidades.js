// src/features/agenda/hooks/useDisponibilidades.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as agendaApi from '../../../api/agenda';

// Obtener disponibilidades con filtros
export function useDisponibilidades(filtros = {}) {
  return useQuery({
    queryKey: ['disponibilidades', filtros],
    queryFn: async () => {
      const res = await agendaApi.getDisponibilidades(filtros);
      return res.data?.data || res.data || [];
    },
    enabled: !!filtros.fechaInicio || !!filtros.fecha,
    staleTime: 1000 * 60,
    retry: false,
  });
}

// Obtener disponibilidades por rango de fechas, opcionalmente filtradas por odontólogo
export function useDisponibilidadesSemanal(fechaInicio, fechaFin, odontologoId = null) {
  return useQuery({
    queryKey: ['disponibilidades-semanal', fechaInicio, fechaFin, odontologoId],
    queryFn: async () => {
      const params = { fechaInicio, fechaFin, perPage: 1000 }; // Aumentar perPage para calendario mensual
      if (odontologoId) params.odontologoId = odontologoId;

      const res = await agendaApi.getDisponibilidades(params);

      // Manejar respuesta paginada o directa
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data;
      } else if (res.data && Array.isArray(res.data)) {
        return res.data;
      } else if (Array.isArray(res)) {
        return res;
      }

      return [];
    },
    enabled: !!fechaInicio && !!fechaFin,
    staleTime: 1000 * 30,
    retry: false,
  });
}

// Obtener disponibilidades de un odontólogo específico
export function useDisponibilidadesPorOdontologo(odontologoId, filtros = {}) {
  return useQuery({
    queryKey: ['disponibilidades-odontologo', odontologoId, filtros],
    queryFn: async () => {
      const res = await agendaApi.getDisponibilidadesPorOdontologo(odontologoId, filtros);
      return res.data?.data || res.data || [];
    },
    enabled: !!odontologoId,
    staleTime: 1000 * 60,
    retry: false,
  });
}

// Crear disponibilidad
export function useCrearDisponibilidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await agendaApi.crearDisponibilidad(data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['disponibilidades']);
      queryClient.invalidateQueries(['disponibilidades-semanal']);
      queryClient.invalidateQueries(['disponibilidades-odontologo']);
    },
  });
}

// Actualizar disponibilidad
export function useActualizarDisponibilidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await agendaApi.actualizarDisponibilidad(id, data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['disponibilidades']);
      queryClient.invalidateQueries(['disponibilidades-semanal']);
      queryClient.invalidateQueries(['disponibilidades-odontologo']);
    },
  });
}

// Eliminar disponibilidad
export function useEliminarDisponibilidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await agendaApi.eliminarDisponibilidad(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['disponibilidades']);
      queryClient.invalidateQueries(['disponibilidades-semanal']);
      queryClient.invalidateQueries(['disponibilidades-odontologo']);
    },
  });
}

// Generar disponibilidades automáticas
export function useGenerarDisponibilidadesAutomaticas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await agendaApi.generarDisponibilidadesAutomaticas(data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['disponibilidades']);
      queryClient.invalidateQueries(['disponibilidades-semanal']);
      queryClient.invalidateQueries(['disponibilidades-odontologo']);
    },
  });
}

// Validar disponibilidad (verificar solapamientos)
export function useValidarDisponibilidad() {
  return useMutation({
    mutationFn: async (data) => {
      const res = await agendaApi.validarDisponibilidad(data);
      // El responseHandler envuelve la respuesta en { success, message, data }
      // donde data contiene { esValida: boolean }
      if (res.data?.data) {
        return res.data.data;
      }
      // Fallback si la estructura es diferente
      return res.data;
    },
  });
}

// Generar disponibilidades recurrentes (semanal o mensual)
export function useGenerarDisponibilidadesRecurrentes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await agendaApi.generarDisponibilidadesRecurrentes(data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['disponibilidades']);
      queryClient.invalidateQueries(['disponibilidades-semanal']);
      queryClient.invalidateQueries(['disponibilidades-odontologo']);
    },
  });
}

