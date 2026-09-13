import { INDEXED_DB_NAME, INDEXED_DB_STORE, INDEXED_DB_VERSION } from "./constants";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
        db.createObjectStore(INDEXED_DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

export async function getCachedFragments(key: string): Promise<ArrayBuffer | null> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(INDEXED_DB_STORE, "readonly");
      const store = tx.objectStore(INDEXED_DB_STORE);
      const request = store.get(key);
      request.onsuccess = () => {
        const value: unknown = request.result;
        if (value instanceof ArrayBuffer) {
          resolve(value);
          return;
        }
        if (value instanceof Uint8Array) {
          const copy = new ArrayBuffer(value.byteLength);
          new Uint8Array(copy).set(value);
          resolve(copy);
          return;
        }
        resolve(null);
      };
      request.onerror = () =>
        reject(request.error ?? new Error("IndexedDB get failed"));
    });
  } finally {
    db.close();
  }
}

export async function setCachedFragments(
  key: string,
  buffer: ArrayBuffer,
): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(INDEXED_DB_STORE, "readwrite");
      const store = tx.objectStore(INDEXED_DB_STORE);
      const request = store.put(buffer, key);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error ?? new Error("IndexedDB put failed"));
    });
  } finally {
    db.close();
  }
}
