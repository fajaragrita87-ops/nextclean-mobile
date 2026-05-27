import { apiRequest } from './client';
import type { AttendanceRecord } from '../types';

function buildPhotoFormData(params: {
  userId?: string | number;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  photoUri: string;
}): FormData {
  const form = new FormData();

  if (params.userId !== undefined) {
    form.append('user_id', String(params.userId));
  }
  if (params.timestamp) {
    form.append('timestamp', params.timestamp);
  }
  if (params.latitude !== undefined) {
    form.append('latitude', String(params.latitude));
  }
  if (params.longitude !== undefined) {
    form.append('longitude', String(params.longitude));
  }

  const uri = params.photoUri;
  const name = `selfie-${Date.now()}.jpg`;
  const type = 'image/jpeg';

  form.append('foto', { uri, name, type } as any);
  return form;
}

export async function checkIn(input: {
  token: string;
  userId?: string | number;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  photoUri: string;
}): Promise<AttendanceRecord | any> {
  const formData = buildPhotoFormData(input);
  return apiRequest<any>('/attendance/checkin', {
    method: 'POST',
    token: input.token,
    formData,
  });
}

export async function checkOut(input: {
  token: string;
  userId?: string | number;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  photoUri: string;
}): Promise<AttendanceRecord | any> {
  const formData = buildPhotoFormData(input);
  return apiRequest<any>('/attendance/checkout', {
    method: 'POST',
    token: input.token,
    formData,
  });
}

export async function getAttendanceHistory(token: string): Promise<AttendanceRecord[]> {
  const res = await apiRequest<any>('/attendance/history', { token });
  const items = res?.data ?? res;
  if (Array.isArray(items)) {
    return items as AttendanceRecord[];
  }
  return [];
}

