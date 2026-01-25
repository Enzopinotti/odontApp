import { useQuery } from '@tanstack/react-query';
import { getFacturas } from '../../../api/finanzas';

export function useFacturas(params) {
  return useQuery({
    queryKey: ['facturas', params],
    queryFn: () => getFacturas(params),
    keepPreviousData: true,
  });
}