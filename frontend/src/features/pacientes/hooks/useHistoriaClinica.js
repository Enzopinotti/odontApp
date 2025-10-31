// frontend/src/features/pacientes/hooks/useHistoriaClinica.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHistoriaClinica, crearHistoriaClinica } from '../../../api/clinica';

export default function useHistoriaClinica(pacienteId, enabled = true) {
  const queryClient = useQueryClient();

  // Obtener historia clínica
  const query = useQuery({
    queryKey: ['historia', pacienteId],
    queryFn: () => getHistoriaClinica(pacienteId),
    enabled: enabled && !!pacienteId, // Solo consultar si está habilitado Y hay pacienteId
  });

  // Crear nueva historia clínica
  const crear = useMutation({
    mutationFn: (data) => crearHistoriaClinica(pacienteId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['historia', pacienteId] }),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    crear,
  };
}