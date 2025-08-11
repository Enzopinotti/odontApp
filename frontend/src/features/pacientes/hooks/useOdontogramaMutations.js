import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearOdontograma } from '../../../api/clinica';
import useToast from '../../../hooks/useToast';

export default function useOdontogramaMutations() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  const crear = useMutation({
    mutationFn: ({ pacienteId, observaciones }) =>
      crearOdontograma(pacienteId, { observaciones }),
    onSuccess: (_data, vars) => {
      showToast('Odontograma creado correctamente', 'success');
      qc.invalidateQueries({ queryKey: ['paciente', vars.pacienteId, 'odontograma'] });
    },
  });

  return { crear };
}
