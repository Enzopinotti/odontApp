// frontend/src/features/pacientes/hooks/useEstadosPacientes.js
import { useQuery } from '@tanstack/react-query';
import { getEstadosPacientes } from '../../../api/clinica';

export function useEstadosPacientes() {
    return useQuery({
        queryKey: ['pacientes', 'estados'],
        queryFn: getEstadosPacientes,
        staleTime: 1000 * 60 * 60, // 1 hora, no cambia seguido
    });
}
