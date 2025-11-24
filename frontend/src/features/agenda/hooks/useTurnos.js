// src/features/agenda/hooks/useTurnos.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as agendaApi from '../../../api/agenda';

export function useTurnos(params = {}) {
  return useQuery({
    queryKey: ['turnos', params],
    queryFn: async () => {
      const res = await agendaApi.getTurnos(params);
      // El backend devuelve { success, message, data } o { success, message, data, pagination }
      return res.data?.data || res.data || (res.data?.pagination ? { data: res.data.data || [], pagination: res.data.pagination } : { data: [], total: 0 });
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useTurno(id) {
  return useQuery({
    queryKey: ['turno', id],
    queryFn: async () => {
      const res = await agendaApi.getTurnoById(id);
      // El backend devuelve { success, message, data }
      return res.data?.data || res.data || null;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useAgendaPorFecha(fecha, odontologoId) {
  return useQuery({
    queryKey: ['agenda', fecha, odontologoId],
    queryFn: async () => {
      const res = await agendaApi.getAgendaPorFecha(fecha, odontologoId);
      // El backend devuelve { success, message, data }
      return res.data?.data || res.data || [];
    },
    enabled: !!fecha,
    staleTime: 1000 * 30, // 30 segundos
    retry: false,
  });
}

// Alias para mayor claridad
export function useTurnosPorFecha(fecha, odontologoId = null) {
  return useAgendaPorFecha(fecha, odontologoId);
}

export function useSlotsDisponibles(fecha, odontologoId, duracion) {
  return useQuery({
    queryKey: ['slots-disponibles', fecha, odontologoId, duracion],
    queryFn: async () => {
      const res = await agendaApi.getSlotsDisponibles(fecha, odontologoId, duracion);
      // El backend devuelve { success, message, data }
      const slots = res.data?.data || res.data || [];
      console.log('[useSlotsDisponibles] Slots recibidos del backend:', { 
        fecha, 
        odontologoId, 
        duracion, 
        slots,
        cantidad: slots.length 
      });
      return slots;
    },
    enabled: !!fecha && !!odontologoId && !!duracion,
    staleTime: 1000 * 60, // 1 minuto
    retry: false,
  });
}

export function useTurnosPendientesConcluidos(fecha) {
  return useQuery({
    queryKey: ['turnos-pendientes-concluidos', fecha],
    queryFn: async () => {
      const res = await agendaApi.getTurnosPendientesConcluidos(fecha);
      // El backend devuelve { success, message, data }
      return res.data?.data || res.data || [];
    },
    enabled: !!fecha,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useCrearTurno() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const res = await agendaApi.crearTurno(data);
      // El backend devuelve { success, message, data }
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['agenda']);
      queryClient.invalidateQueries(['turnos-pendientes-concluidos']);
    },
  });
}

export function useActualizarTurno() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => agendaApi.actualizarTurno(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['turno', variables.id]);
      queryClient.invalidateQueries(['agenda']);
    },
  });
}

export function useEliminarTurno() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: agendaApi.eliminarTurno,
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['agenda']);
    },
  });
}

export function useCancelarTurno() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, motivo }) => agendaApi.cancelarTurno(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['agenda']);
    },
  });
}

// CU-AG01.4 Flujo Alternativo 4a: Cancelación múltiple
export function useCancelarTurnosMultiple() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ turnoIds, motivo }) => agendaApi.cancelarTurnosMultiple(turnoIds, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['agenda']);
    },
  });
}

export function useMarcarAsistencia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, nota }) => agendaApi.marcarAsistencia(id, nota),
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['agenda']);
    },
  });
}

export function useMarcarAusencia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, motivo }) => agendaApi.marcarAusencia(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['agenda']);
    },
  });
}

export function useReprogramarTurno() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, nuevaFechaHora, odontologoId }) => {
      const data = { nuevaFechaHora };
      if (odontologoId) {
        data.odontologoId = odontologoId;
      }
      return agendaApi.reprogramarTurno(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['agenda']);
    },
  });
}

