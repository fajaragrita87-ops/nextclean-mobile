import { apiRequest } from './client';
import type { AttendanceRecord } from '../types';
import { isMockApiEnabled } from './mockSwitch';
import { readJson, writeJson } from './mockStorage';

const MOCK_HISTORY_KEY = 'mock_attendance_history';

function buildPhotoFormData(params: {
  latitude?: number;
  longitude?: number;
  photoUri: string;
}): FormData {
  const form = new FormData();

  if (params.latitude !== undefined) {
    form.append('latitude', String(params.latitude));
  }
  if (params.longitude !== undefined) {
    form.append('longitude', String(params.longitude));
  }

  const uri = params.photoUri;
  const name = `selfie-${Date.now()}.jpg`;
  const type = 'image/jpeg';

  form.append('face_image', { uri, name, type } as any);
  return form;
}

export async function checkIn(input: {
  token: string;
  latitude?: number;
  longitude?: number;
  photoUri: string;
}): Promise<AttendanceRecord | any> {
  if (isMockApiEnabled()) {
    const record: AttendanceRecord = {
      id: Date.now(),
      type: 'checkin',
      timestamp: new Date().toISOString(),
      latitude: input.latitude,
      longitude: input.longitude,
      photoUrl: input.photoUri,
    };
    const current = await readJson<AttendanceRecord[]>(MOCK_HISTORY_KEY, []);
    const next = [record, ...current].slice(0, 50);
    await writeJson(MOCK_HISTORY_KEY, next);
    return record;
  }

  const formData = buildPhotoFormData(input);
  return apiRequest<any>('/attendance/clock-in', {
    method: 'POST',
    token: input.token,
    formData,
  });
}

export async function checkOut(input: {
  token: string;
  latitude?: number;
  longitude?: number;
}): Promise<AttendanceRecord | any> {
  if (isMockApiEnabled()) {
    const record: AttendanceRecord = {
      id: Date.now(),
      type: 'checkout',
      timestamp: new Date().toISOString(),
      latitude: input.latitude,
      longitude: input.longitude,
      photoUrl: undefined,
    };
    const current = await readJson<AttendanceRecord[]>(MOCK_HISTORY_KEY, []);
    const next = [record, ...current].slice(0, 50);
    await writeJson(MOCK_HISTORY_KEY, next);
    return record;
  }

  return apiRequest<any>('/attendance/clock-out', {
    method: 'POST',
    token: input.token,
  });
}

export async function getAttendanceHistory(token: string): Promise<AttendanceRecord[]> {
  if (isMockApiEnabled()) {
    return readJson<AttendanceRecord[]>(MOCK_HISTORY_KEY, []);
  }

  const res = await apiRequest<any>('/attendance/history', { token });
  const items = res?.data ?? res;
  if (Array.isArray(items)) {
    return items as AttendanceRecord[];
  }
  return [];
}
