// src/features/odontograma/hooks/useCarasMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  registrarCaraTratada,
  actualizarCaraTratada,
  eliminarCaraTratada,
} from '../../../api/clinica';
import { hexToInt } from '../utils/color';

export default function useCarasMutations(pacienteId) {
  const qc = useQueryClient();
  const key = ['paciente', Number(pacienteId), 'odontograma'];

  const addCara = useMutation({
    mutationFn: ({ dienteId, simbolo, estadoCara, colorHex, tipoTrazo, usuarioId }) =>
      registrarCaraTratada(dienteId, {
        simbolo,
        tipoTrazo: tipoTrazo || 'Continuo',
        colorEstado: hexToInt(colorHex),
        estadoCara,
        tratamientoId: null,
        usuarioId,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateCara = useMutation({
    mutationFn: ({ caraId, simbolo, estadoCara, colorHex, tipoTrazo, usuarioId }) =>
      actualizarCaraTratada(caraId, {
        simbolo,
        tipoTrazo: tipoTrazo || 'Continuo',
        colorEstado: hexToInt(colorHex),
        estadoCara,
        tratamientoId: null,
        usuarioId,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });


  const delCara = useMutation({
    mutationFn: ({ caraId }) => eliminarCaraTratada(caraId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { addCara, updateCara, delCara };
}
