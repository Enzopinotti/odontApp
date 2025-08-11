// src/hooks/usePrefetchPaciente.js
import { useQueryClient } from '@tanstack/react-query';
import { getPacienteById } from '../api/clinica';

/**
 * Prefetch del paciente para entrada "instantánea".
 * Uso: const prefetchPaciente = usePrefetchPaciente(); prefetchPaciente(id)
 */
export default function usePrefetchPaciente() {
  const queryClient = useQueryClient();

  return (id) => {
    const n = Number(id);
    if (!Number.isFinite(n) || n <= 0) return;
    return queryClient.prefetchQuery({
      queryKey: ['paciente', n],
      // Misma forma que usa usePaciente: devolvemos el "paciente crudo"
      queryFn: async () => {
        const res = await getPacienteById(n);
        return res.data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutos
    });
  };
}
