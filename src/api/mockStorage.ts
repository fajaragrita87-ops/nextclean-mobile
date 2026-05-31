import { getStoredString, setStoredString } from '../storage/authToken';

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await getStoredString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await setStoredString(key, JSON.stringify(value));
}
