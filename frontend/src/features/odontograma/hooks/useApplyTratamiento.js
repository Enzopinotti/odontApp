// src/features/odontograma/hooks/useApplyTratamiento.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aplicarTratamientoADiente } from '../../../api/clinica';

export default function useApplyTratamiento(pacienteId) {
  const qc = useQueryClient();
  const key = ['paciente', Number(pacienteId), 'odontograma'];

  const apply = useMutation({
    mutationFn: ({ dienteId, payload }) =>
      aplicarTratamientoADiente(dienteId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { apply };
}
