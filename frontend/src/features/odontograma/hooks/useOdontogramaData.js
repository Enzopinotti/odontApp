// ✅ Unificado al mismo shape que usa usePacienteExtra: { data, denied }
import { useQuery } from '@tanstack/react-query';
import { getOdontograma } from '../../../api/clinica';

export default function useOdontogramaData(pacienteId, enabled = true) {
  const pid = Number(pacienteId);

  return useQuery({
    queryKey: ['paciente', pid, 'odontograma'],
    enabled: Number.isFinite(pid) && pid > 0 && enabled,
    queryFn: async () => {
      try {
        const res = await getOdontograma(pid);
        return { data: res.data, denied: false };
      } catch (err) {
        const status = err?.response?.status;
        const code = err?.response?.data?.code;
        if (status === 404) return { data: null, denied: false };
        if (status === 403 || code === 'PERMISO_DENEGADO') return { data: undefined, denied: true };
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    // 👇 evita el “tengo cache pero no muestro nada hasta F5”
    refetchOnMount: 'always',
  });
}
