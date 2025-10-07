export function setCache<T>(key: string, value: T, ttlMs: number) {
    const item = { value, expiry: Date.now() + ttlMs };
    localStorage.setItem(key, JSON.stringify(item));
  }
  
  export function getCache<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const item = JSON.parse(raw);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value as T;
    } catch {
      return null;
    }
  }
  