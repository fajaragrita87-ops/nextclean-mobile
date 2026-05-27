export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:8000';

export const USE_MOCK_API = (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') === 'true';
