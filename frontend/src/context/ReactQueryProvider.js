// src/context/ReactQueryProvider.jsx
import { useContext, useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastCtx } from './ToastProvider';
import { handleApiError } from '../utils/handleApiError';

export default function ReactQueryProvider({ children }) {
  const { showToast } = useContext(ToastCtx);

  const queryClient = useMemo(() => {
    return new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => setTimeout(() => handleApiError(error, showToast), 0),
      }),
      mutationCache: new MutationCache({
        onError: (error) => setTimeout(() => handleApiError(error, showToast), 0),
      }),
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          staleTime: 1000 * 60 * 2,
        },
      },
    });
  }, [showToast]);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
