import { ApiError, apiRequest } from './client';
import type { LaundryTask, LaundryStatus } from '../types';
import { isMockApiEnabled } from './mockSwitch';
import { readJson, writeJson } from './mockStorage';

const MOCK_TASKS_KEY = 'mock_tasks';

function seedTasks(): LaundryTask[] {
  const now = new Date().toISOString();
  return [
    { id: 1001, code: 'TRX-1001', customerName: 'Andi', status: 'Diterima', updatedAt: now },
    { id: 1002, code: 'TRX-1002', customerName: 'Sari', status: 'Dicuci', updatedAt: now },
    { id: 1003, code: 'TRX-1003', customerName: 'Budi', status: 'Disetrika', updatedAt: now },
    { id: 1004, code: 'TRX-1004', customerName: 'Maya', status: 'Selesai', updatedAt: now },
    { id: 1005, code: 'TRX-1005', customerName: 'Rina', status: 'Diambil', updatedAt: now },
  ];
}

export async function getTransactions(token: string): Promise<LaundryTask[]> {
  if (isMockApiEnabled()) {
    const current = await readJson<LaundryTask[] | null>(MOCK_TASKS_KEY, null);
    if (current && Array.isArray(current) && current.length > 0) return current;
    const seeded = seedTasks();
    await writeJson(MOCK_TASKS_KEY, seeded);
    return seeded;
  }

  try {
    const res = await apiRequest<any>('/transactions', { token });
    const items = res?.data ?? res;
    if (Array.isArray(items)) {
      return items as LaundryTask[];
    }
    return [];
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return [];
    }
    throw e;
  }
}

export async function updateTransactionStatus(input: {
  token: string;
  transactionId: string | number;
  status: LaundryStatus | string;
}): Promise<any> {
  if (isMockApiEnabled()) {
    const current = await getTransactions(input.token);
    const now = new Date().toISOString();
    const next = current.map((t) =>
      String(t.id) === String(input.transactionId) ? { ...t, status: input.status, updatedAt: now } : t
    );
    await writeJson(MOCK_TASKS_KEY, next);
    return { ok: true };
  }

  return apiRequest<any>('/transactions/update-status', {
    method: 'POST',
    token: input.token,
    body: { id: input.transactionId, status: input.status },
  });
}
