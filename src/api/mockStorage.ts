import * as SecureStore from 'expo-secure-store';

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

