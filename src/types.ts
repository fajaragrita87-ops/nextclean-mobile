export type User = {
  id: number | string;
  name?: string;
  email?: string;
};

export type AttendanceRecord = {
  id: number | string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
};

export type LaundryTask = {
  id: number | string;
  code?: string;
  customerName?: string;
  status: string;
  updatedAt?: string;
};

export const LAUNDRY_STATUSES = [
  'Diterima',
  'Dicuci',
  'Disetrika',
  'Selesai',
  'Diambil',
] as const;

export type LaundryStatus = (typeof LAUNDRY_STATUSES)[number];

