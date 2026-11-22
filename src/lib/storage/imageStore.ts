/**
 * Robust IndexedDB client storage with graceful sessionStorage fallback.
 * Prevents QuotaExceededError when storing high-resolution base64 images.
 */

const DB_NAME = "photolizer_db";
const STORE_NAME = "images";
const KEY_NAME = "current_processed_image";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProcessedImage(imageData: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(imageData, KEY_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("IndexedDB save failed, falling back to sessionStorage", e);
    try {
      sessionStorage.setItem("processedImage", imageData);
    } catch (storageErr) {
      console.error("Storage completely failed:", storageErr);
      throw new Error("Failed to store image in browser memory. File may be too large.");
    }
  }
}

export async function getProcessedImage(): Promise<string | null> {
  try {
    const db = await openDB();
    const result = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_NAME);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => reject(req.error);
    });
    if (result) return result;
  } catch (e) {
    console.warn("IndexedDB read failed, falling back to sessionStorage", e);
  }

  // Fallback to sessionStorage if IndexedDB has nothing or failed
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("processedImage");
  }
  return null;
}

export async function clearProcessedImage(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("IndexedDB clear failed", e);
  }
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("processedImage");
  }
}
