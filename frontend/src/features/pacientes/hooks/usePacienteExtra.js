import { useQuery } from '@tanstack/react-query';
import {
  getOdontograma,
  getHistoriaClinica,
  getImagenesPaciente,
  getHistorialTratamientos,
} from '../../../api/clinica';

/** Calcula métricas del odontograma si no vinieron desde el backend */
function enrichOdo(box) {
  if (!box || !box.data) return box;
  const odo = box.data;

  const dientes = Array.isArray(odo.Dientes) ? odo.Dientes
                 : Array.isArray(odo.dientes) ? odo.dientes
                 : [];

  const caras = dientes.flatMap(d =>
    Array.isArray(d.CaraTratadas) ? d.CaraTratadas : []
  );

  const totalDientes = dientes.length;
  const tratadas = typeof odo.carasTratadasCount === 'number'
    ? odo.carasTratadasCount
    : caras.length;

  const pendientes = typeof odo.pendientesCount === 'number'
    ? odo.pendientesCount
    : caras.filter(c => String(c?.estadoCara).toLowerCase() === 'planificado').length;

  return {
    ...box,
    data: {
      ...odo,
      totalDientes,
      carasTratadasCount: tratadas,
      pendientesCount: pendientes,
    },
  };
}

/**
 * Trae en paralelo: Odontograma, Historia, Imágenes, Tratamientos.
 * Maneja 404 del odontograma (→ null) y 403 (→ {denied:true}) sin lanzar error.
 */
export default function usePacienteExtra(pacienteId, perms = {}) {
  const pid = Number(pacienteId);
  const baseEnabled = Number.isFinite(pid) && pid > 0;

  const {
    canVerOdontograma = true,
    canVerHistoria = true,
    canVerImagenes = true,
    canVerTratamientos = true,
  } = perms;

  // ───────────────────────── Odontograma
  const { data: odoData, isLoading: odLoading } = useQuery({
    queryKey: ['paciente', pid, 'odontograma'],
    enabled: baseEnabled && canVerOdontograma,
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
    // 🔁 si venimos de la pantalla de odontograma y hubo mutaciones, volvemos con data fresca
    refetchOnMount: 'always',
    staleTime: 1000 * 60 * 5,
    retry: false,
    select: enrichOdo,
  });

  // ───────────────────────── Historia clínica
  const { data: hcData, isLoading: hcLoading } = useQuery({
    queryKey: ['paciente', pid, 'historia'],
    enabled: baseEnabled && canVerHistoria,
    queryFn: async () => {
      try {
        const res = await getHistoriaClinica(pid);
        return { data: res.data || [], denied: false };
      } catch (err) {
        const status = err?.response?.status;
        const code = err?.response?.data?.code;
        if (status === 403 || code === 'PERMISO_DENEGADO') return { data: undefined, denied: true };
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  // ───────────────────────── Imágenes
  const { data: imgData, isLoading: imgLoading } = useQuery({
    queryKey: ['paciente', pid, 'imagenes'],
    enabled: baseEnabled && canVerImagenes,
    queryFn: async () => {
      try {
        const res = await getImagenesPaciente(pid);
        return { data: res.data || [], denied: false };
      } catch (err) {
        const status = err?.response?.status;
        const code = err?.response?.data?.code;
        if (status === 403 || code === 'PERMISO_DENEGADO') return { data: undefined, denied: true };
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // ───────────────────────── Tratamientos (historial)
  const { data: trData, isLoading: trLoading } = useQuery({
    queryKey: ['paciente', pid, 'tratamientos-historial'],
    enabled: baseEnabled && canVerTratamientos,
    queryFn: async () => {
      try {
        const res = await getHistorialTratamientos(pid);
        return { data: res.data || [], denied: false };
      } catch (err) {
        const status = err?.response?.status;
        const code = err?.response?.data?.code;
        if (status === 403 || code === 'PERMISO_DENEGADO') return { data: undefined, denied: true };
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  return {
    odontograma: odoData?.data,
    odLoading,
    odoDenied: !!odoData?.denied,

    historia: hcData?.data,
    hcLoading,
    historiaDenied: !!hcData?.denied,

    imagenes: imgData?.data,
    imgLoading,
    imagenesDenied: !!imgData?.denied,

    tratamientos: trData?.data,
    trLoading,
    tratamientosDenied: !!trData?.denied,
  };
}
