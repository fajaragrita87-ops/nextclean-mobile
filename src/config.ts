import { Platform } from 'react-native';

let apiBaseUrlOverride: string | null = null;

export function setApiBaseUrlOverride(value: string | null) {
  apiBaseUrlOverride = value;
}

export function getDefaultApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env && typeof env === 'string') return env;

  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://localhost:8000';
}

export function getApiBaseUrl(): string {
  return apiBaseUrlOverride ?? getDefaultApiBaseUrl();
}

export const USE_MOCK_API = (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'false') === 'true';
