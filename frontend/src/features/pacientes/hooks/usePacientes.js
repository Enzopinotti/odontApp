// src/hooks/usePacientes.js
import { useLocation } from 'react-router-dom';
import { useQuery }    from '@tanstack/react-query';
import { getPacientes } from '../../../api/clinica';

export function usePacientes(params = {}) {
  const { pathname } = useLocation();
  const isLista      = pathname === '/pacientes';   // sólo en la ruta lista

  return useQuery({
    queryKey: ['pacientes', params],
    queryFn : async () => {
      const res = await getPacientes(params);
      return res.data;
    },
    enabled : isLista,
    keepPreviousData   : true,
    staleTime          : 1000 * 60 * 2,
    retry              : false,
    refetchOnWindowFocus: false,
    refetchOnReconnect : false,
  });
}
