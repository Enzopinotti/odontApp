import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearOdontograma } from '../../../api/clinica';
import useToast from '../../../hooks/useToast';

export default function useOdontogramaMutations() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  const crear = useMutation({
    mutationFn: ({ pacienteId, observaciones }) =>
      crearOdontograma(pacienteId, { observaciones }),
    onSuccess: (apiRes, vars) => {
      showToast('Odontograma creado correctamente', 'success');
      // apiRes puede venir como { success, data } o data directo según tu wrapper
      const odo = apiRes?.data ?? apiRes;
      // ✅ seteamos el mismo shape que consumen ambos hooks
      qc.setQueryData(['paciente', vars.pacienteId, 'odontograma'], {
        data: odo,
        denied: false,
      });
      // y además invalidamos para asegurar coherencia si hay otros contadores
      qc.invalidateQueries({ queryKey: ['paciente', vars.pacienteId, 'odontograma'] });
    },
  });

  return { crear };
}
