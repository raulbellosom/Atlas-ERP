import { invokeDesktop } from "./desktopBridge.js";

const SECURE_STORAGE_PREFIX = "atlaserp.secure.";

export async function secureStorageSet(namespace, key, value) {
  const payload = { namespace, key, value };
  return invokeDesktop("secure_storage_set", payload, () => {
    localStorage.setItem(
      `${SECURE_STORAGE_PREFIX}${namespace}.${key}`,
      JSON.stringify({ value }),
    );
    return true;
  });
}

export async function secureStorageGet(namespace, key) {
  const payload = { namespace, key };
  return invokeDesktop("secure_storage_get", payload, () => {
    const raw = localStorage.getItem(`${SECURE_STORAGE_PREFIX}${namespace}.${key}`);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      return parsed.value ?? null;
    } catch {
      return null;
    }
  });
}

export async function secureStorageRemove(namespace, key) {
  const payload = { namespace, key };
  return invokeDesktop("secure_storage_remove", payload, () => {
    localStorage.removeItem(`${SECURE_STORAGE_PREFIX}${namespace}.${key}`);
    return true;
  });
}
