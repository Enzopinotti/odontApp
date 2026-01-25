import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFacturas, 
  crearOrdenCobro, 
  crearPresupuesto, 
  registrarPago 
} from '../../../api/finanzas';

// --- QUERY: Obtener Historial ---
export function useFacturas(params) {
  return useQuery({
    queryKey: ['facturas', params],
    queryFn: () => getFacturas(params),
    keepPreviousData: true,
    enabled: !!params // Solo ejecuta si hay filtros (ej: paciente seleccionado)
  });
}

// --- MUTATIONS: Acciones ---
export function useFinanceMutations() {
  const queryClient = useQueryClient();

  const crearOrden = useMutation({
    mutationFn: crearOrdenCobro,
    onSuccess: () => {
      queryClient.invalidateQueries(['facturas']); // Actualiza historial
    },
  });

  const nuevoPresupuesto = useMutation({
    mutationFn: crearPresupuesto,
    onSuccess: () => {
      queryClient.invalidateQueries(['facturas']);
    },
  });

  const cobrar = useMutation({
    mutationFn: ({ id, payload }) => registrarPago(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['facturas']); // Actualiza caja
    },
  });

  return { crearOrden, nuevoPresupuesto, cobrar };
}