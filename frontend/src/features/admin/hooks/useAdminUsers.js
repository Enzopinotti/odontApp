// frontend/src/features/admin/hooks/useAdminUsers.js
import { useQuery } from '@tanstack/react-query';
import { getUsuarios } from '../../../api/admin';

export function useAdminUsers(params) {
    return useQuery({
        queryKey: ['admin-users', params],
        queryFn: async () => {
            const res = await getUsuarios(params);
            return res.data;
        },
        keepPreviousData: true,
    });
}
