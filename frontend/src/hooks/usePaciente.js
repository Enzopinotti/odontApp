// src/hooks/usePaciente.js
import { useQuery } from '@tanstack/react-query';
import { getPacienteById } from '../api/clinica';

export default function usePaciente(id, enabled = true) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn : async () => {
      const res = await getPacienteById(id); 
      return res.data;                       
    },
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    retry    : false,
    refetchOnWindowFocus: false,
    refetchOnReconnect  : false,
  });
}
