let apiBaseUrlOverride: string | null = null;

export function setApiBaseUrlOverride(value: string | null) {
  apiBaseUrlOverride = value;
}

export function getDefaultApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env && typeof env === 'string') return env;

  return 'https://next-clean.demo.minimonster.id';
}

export function getApiBaseUrl(): string {
  return apiBaseUrlOverride ?? getDefaultApiBaseUrl();
}

export const USE_MOCK_API = (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'false') === 'true';
