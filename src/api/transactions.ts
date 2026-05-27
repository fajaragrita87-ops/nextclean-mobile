import { apiRequest } from './client';
import type { LaundryTask, LaundryStatus } from '../types';

export async function getTransactions(token: string): Promise<LaundryTask[]> {
  const res = await apiRequest<any>('/transactions', { token });
  const items = res?.data ?? res;
  if (Array.isArray(items)) {
    return items as LaundryTask[];
  }
  return [];
}

export async function updateTransactionStatus(input: {
  token: string;
  transactionId: string | number;
  status: LaundryStatus | string;
}): Promise<any> {
  return apiRequest<any>('/transactions/update-status', {
    method: 'POST',
    token: input.token,
    body: { id: input.transactionId, status: input.status },
  });
}

