
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase';

export function useWallet() {
    return useQuery({
        queryKey: ['wallet'],
        queryFn: api.getWalletBalance,
    });
}

export function useWalletLimits() {
    return useQuery({
        queryKey: ['wallet-limits'],
        queryFn: async () => {
            const getLimits = httpsCallable(functions, 'getCurrentLimits');
            const result = await getLimits();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result.data as any;
        }
    });
}

export function useWithdraw() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (amount: number) => api.requestWithdrawal(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-limits'] });
        },
    });
}

export function useSimulateCashback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.simulateCashback,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        },
    });
}
