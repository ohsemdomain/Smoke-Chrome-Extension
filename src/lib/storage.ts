type StorageArea = {
  get: (keys: string | string[] | Record<string, unknown> | null, callback: (items: any) => void) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
};

function getChromeStorageLocal(): StorageArea | null {
  const chromeStorage = (globalThis as any)?.chrome?.storage?.local;
  if (!chromeStorage) return null;
  return chromeStorage as StorageArea;
}

export async function getString(key: string): Promise<string | null> {
  try {
    const fromLocalStorage = globalThis.localStorage?.getItem(key) ?? null;
    if (fromLocalStorage !== null) {
      const chromeStorage = getChromeStorageLocal();
      chromeStorage?.set({[key]: fromLocalStorage});
      return fromLocalStorage;
    }
  } catch {
    // Ignore read failures (disabled storage / privacy mode).
  }

  const chromeStorage = getChromeStorageLocal();
  if (chromeStorage) {
    return await new Promise((resolve) => {
      chromeStorage.get(key, (items) => {
        const value = items?.[key];
        resolve(typeof value === 'string' ? value : null);
      });
    });
  }

  return null;
}

export async function setString(key: string, value: string): Promise<void> {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Ignore write failures (quota / disabled storage).
  }

  const chromeStorage = getChromeStorageLocal();
  if (chromeStorage) {
    await new Promise<void>((resolve) => {
      chromeStorage.set({[key]: value}, () => resolve());
    });
  }
}

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  await setString(key, JSON.stringify(value));
}
