// src/hooks/usePacienteMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarPaciente, eliminarPaciente } from '../api/clinica';
import { handleApiError } from '../utils/handleApiError';
import useToast from './useToast';

export default function usePacienteMutations() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  /* --- Actualizar paciente (optimistic update) --- */
  const updatePaciente = useMutation({
    mutationFn: ({ id, data }) => actualizarPaciente(id, data),
    onMutate: async ({ id, data }) => {
      // 🔹 Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ['pacientes'] });

      // 🔹 Tomar snapshot previo
      const previousData = queryClient.getQueryData(['pacientes']);

      // 🔹 Optimistic update
      queryClient.setQueryData(['pacientes'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        };
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      // 🔹 Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(['pacientes'], context.previousData);
      }
      handleApiError(error, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['pacientes']);
    },
    onSuccess: () => {
      showToast('Paciente actualizado correctamente', 'success');
    },
  });

  /* --- Eliminar paciente (optimistic update) --- */
  const deletePaciente = useMutation({
    mutationFn: (id) => eliminarPaciente(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['pacientes'] });
      const previousData = queryClient.getQueryData(['pacientes']);

      queryClient.setQueryData(['pacientes'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((p) => p.id !== id),
        };
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['pacientes'], context.previousData);
      }
      handleApiError(error, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['pacientes']);
    },
    onSuccess: () => {
      showToast('Paciente eliminado', 'success');
    },
  });

  return { updatePaciente, deletePaciente };
}
