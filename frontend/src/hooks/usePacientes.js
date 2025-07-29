import { useQuery } from '@tanstack/react-query';
import { getPacientes } from '../api/clinica';

export function usePacientes(params = {}) {
  return useQuery({
    queryKey: ['pacientes', params],
    queryFn: () => getPacientes(params),
  });
}
