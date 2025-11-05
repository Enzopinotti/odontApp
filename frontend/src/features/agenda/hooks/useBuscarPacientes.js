// src/features/agenda/hooks/useBuscarPacientes.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as agendaApi from '../../../api/agenda';
import useDebouncedValue from '../../../hooks/useDebouncedValue';

export function useBuscarPacientes(termino, enabled = true) {
  const debouncedTermino = useDebouncedValue(termino, 300);
  
  return useQuery({
    queryKey: ['buscar-pacientes', debouncedTermino],
    queryFn: async () => {
      const res = await agendaApi.buscarPacientes(debouncedTermino);
      // El backend devuelve { success, message, data }
      return res.data?.data || res.data || [];
    },
    enabled: enabled && !!debouncedTermino && debouncedTermino.length >= 2,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useCrearPacienteRapido() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const res = await agendaApi.crearPacienteRapido(data);
      // El backend devuelve { success, message, data }
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['buscar-pacientes']);
      queryClient.invalidateQueries(['pacientes']);
    },
  });
}

