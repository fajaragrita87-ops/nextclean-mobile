import { apiRequest } from './client';
import type { User } from '../types';

export type LoginResponse = {
  token: string;
  user?: User;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiRequest<any>('/login', {
    method: 'POST',
    body: { email, password },
  });

  const token = res?.token ?? res?.access_token ?? res?.data?.token ?? res?.data?.access_token;
  if (!token || typeof token !== 'string') {
    throw new Error('Login berhasil tapi token tidak ditemukan di response.');
  }

  const user: User | undefined = res?.user ?? res?.data?.user;
  return { token, user };
}

