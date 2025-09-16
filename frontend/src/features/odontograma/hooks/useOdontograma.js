import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOdontograma, crearOdontograma } from '../../../api/clinica';

export default function useOdontograma(pacienteId) {
  const pid = Number(pacienteId);
  const qc = useQueryClient();

  const odoQuery = useQuery({
    queryKey: ['paciente', pid, 'odontograma'],
    queryFn: async () => {
      const res = await getOdontograma(pid);
      return res.data; // { id, pacienteId, fechaCreacion, estadoGeneral, Dientes: [...] }
    },
    enabled: Number.isFinite(pid) && pid > 0,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => crearOdontograma(pid, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['paciente', pid, 'odontograma'] }),
  });

  return { ...odoQuery, crear: createMutation };
}
