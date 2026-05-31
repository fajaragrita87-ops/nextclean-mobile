const TOKEN_KEY = 'auth_token';
const memoryStore = new Map<string, string>();

type SecureStoreModule = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

function getSecureStore(): SecureStoreModule | null {
  try {
    const mod = require('expo-secure-store') as SecureStoreModule;
    if (
      typeof mod?.getItemAsync === 'function' &&
      typeof mod?.setItemAsync === 'function' &&
      typeof mod?.deleteItemAsync === 'function'
    ) {
      return mod;
    }
    return null;
  } catch {
    return null;
  }
}

function getWebStorage(): Storage | null {
  try {
    const storage = (globalThis as any)?.localStorage as Storage | undefined;
    if (storage && typeof storage.getItem === 'function') return storage;
    return null;
  } catch {
    return null;
  }
}

export async function getStoredString(key: string): Promise<string | null> {
  const secureStore = getSecureStore();
  if (secureStore) {
    try {
      return await secureStore.getItemAsync(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }

  const webStorage = getWebStorage();
  if (webStorage) {
    try {
      return webStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }

  return memoryStore.get(key) ?? null;
}

export async function setStoredString(key: string, value: string): Promise<void> {
  const secureStore = getSecureStore();
  if (secureStore) {
    try {
      await secureStore.setItemAsync(key, value);
      memoryStore.set(key, value);
      return;
    } catch {
      memoryStore.set(key, value);
      return;
    }
  }

  const webStorage = getWebStorage();
  if (webStorage) {
    try {
      webStorage.setItem(key, value);
      memoryStore.set(key, value);
      return;
    } catch {
      memoryStore.set(key, value);
      return;
    }
  }

  memoryStore.set(key, value);
}

export async function removeStoredString(key: string): Promise<void> {
  const secureStore = getSecureStore();
  if (secureStore) {
    try {
      await secureStore.deleteItemAsync(key);
    } catch {}
    memoryStore.delete(key);
    return;
  }

  const webStorage = getWebStorage();
  if (webStorage) {
    try {
      webStorage.removeItem(key);
    } catch {}
    memoryStore.delete(key);
    return;
  }

  memoryStore.delete(key);
}

export async function getAuthToken(): Promise<string | null> {
  return getStoredString(TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  await setStoredString(TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await removeStoredString(TOKEN_KEY);
}
