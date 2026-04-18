import {
  secureStorageGet,
  secureStorageRemove,
  secureStorageSet,
} from "../../bridge/secureStorage.bridge.js";

const SESSION_NAMESPACE = "auth";
const SESSION_KEY = "desktop_session_v1";
const PROFILE_KEY = "cached_profile_v1";

function safeParse(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function saveDesktopSession(session) {
  const payload = {
    ...session,
    updatedAt: new Date().toISOString(),
  };
  await secureStorageSet(SESSION_NAMESPACE, SESSION_KEY, JSON.stringify(payload));
  return payload;
}

export async function loadDesktopSession() {
  const raw = await secureStorageGet(SESSION_NAMESPACE, SESSION_KEY);
  return safeParse(raw);
}

export async function clearDesktopSession() {
  await secureStorageRemove(SESSION_NAMESPACE, SESSION_KEY);
  await secureStorageRemove(SESSION_NAMESPACE, PROFILE_KEY);
  return true;
}

export async function saveCachedProfile(profile) {
  const payload = {
    ...profile,
    cachedAt: new Date().toISOString(),
  };
  await secureStorageSet(SESSION_NAMESPACE, PROFILE_KEY, JSON.stringify(payload));
  return payload;
}

export async function loadCachedProfile() {
  const raw = await secureStorageGet(SESSION_NAMESPACE, PROFILE_KEY);
  return safeParse(raw);
}

export function hasActiveSession(session) {
  if (!session || !session.accessToken) {
    return false;
  }

  if (!session.expiresAt) {
    return true;
  }

  const expiresAt = Date.parse(session.expiresAt);
  if (Number.isNaN(expiresAt)) {
    return true;
  }

  return expiresAt > Date.now();
}

export function canBootOffline(session, cachedProfile) {
  if (!session) {
    return false;
  }

  if (session.allowOffline === false) {
    return false;
  }

  return Boolean(session.refreshToken || session.accessToken || cachedProfile);
}
