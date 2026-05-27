import { apiRequest } from './client';
import type { User } from '../types';
import { isMockApiEnabled } from './mockSwitch';

export type LoginResponse = {
  token: string;
  user?: User;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  if (isMockApiEnabled()) {
    if (!email.trim() || !password) throw new Error('Email dan password wajib diisi.');
    return {
      token: 'mock-token',
      user: { id: 1, email: email.trim(), name: 'Mock User' },
    };
  }

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
