// src/hooks/usePacienteExtra.js
import { useQuery } from '@tanstack/react-query';
import {
  getOdontograma,
  getHistoriaClinica,
  getImagenesPaciente,
  getHistorialTratamientos,
} from '../../../api/clinica';

/**
 * Trae en paralelo: Odontograma, Historia, Imágenes, Tratamientos
 * Devuelve flags de loading individuales para pintar skeletons por card.
 */
export default function usePacienteExtra(pacienteId) {
  const pid = Number(pacienteId);

  const {
    data: odontograma,
    isLoading: odLoading,
  } = useQuery({
    queryKey: ['paciente', pid, 'odontograma'],
    queryFn: async () => {
      const res = await getOdontograma(pid);
      return res.data;
    },
    enabled: Number.isFinite(pid) && pid > 0,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: historia,
    isLoading: hcLoading,
  } = useQuery({
    queryKey: ['paciente', pid, 'historia'],
    queryFn: async () => {
      const res = await getHistoriaClinica(pid);
      return res.data || [];
    },
    enabled: Number.isFinite(pid) && pid > 0,
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: imagenes,
    isLoading: imgLoading,
  } = useQuery({
    queryKey: ['paciente', pid, 'imagenes'],
    queryFn: async () => {
      const res = await getImagenesPaciente(pid);
      return res.data || [];
    },
    enabled: Number.isFinite(pid) && pid > 0,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: tratamientos,
    isLoading: trLoading,
  } = useQuery({
    queryKey: ['paciente', pid, 'tratamientos-historial'],
    queryFn: async () => {
      const res = await getHistorialTratamientos(pid);
      return res.data || [];
    },
    enabled: Number.isFinite(pid) && pid > 0,
    staleTime: 1000 * 60 * 2,
  });

  return {
    odontograma, odLoading,
    historia, hcLoading,
    imagenes, imgLoading,
    tratamientos, trLoading,
  };
}
