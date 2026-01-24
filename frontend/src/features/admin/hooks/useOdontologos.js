// frontend/src/features/admin/hooks/useOdontologos.js
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';

export function useOdontologos() {
    return useQuery({
        queryKey: ['odontologos-list'],
        queryFn: async () => {
            // rolId 2 es Odontólogo según el seeder
            const res = await api.get('/usuarios', { params: { rolId: 2, perPage: 100 } });
            return res.data;
        }

    });
}
