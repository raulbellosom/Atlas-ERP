import { desktopLogAppend } from '../bridge/logs.bridge.js';

export const DesktopEvents = {
  APP_STARTED: 'APP_STARTED',
  APP_STOPPED: 'APP_STOPPED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  SYNC_STARTED: 'SYNC_STARTED',
  SYNC_COMPLETED: 'SYNC_COMPLETED',
  SYNC_FAILED: 'SYNC_FAILED',
  OFFLINE_MODE_ENTERED: 'OFFLINE_MODE_ENTERED',
  ONLINE_MODE_RESTORED: 'ONLINE_MODE_RESTORED',
  SQLITE_ERROR: 'SQLITE_ERROR',
  MOVEMENT_ENQUEUED: 'MOVEMENT_ENQUEUED',
  UNHANDLED_ERROR: 'UNHANDLED_ERROR',
};

function buildMessage(event, meta) {
  if (!meta || Object.keys(meta).length === 0) return event;
  return `${event} ${JSON.stringify(meta)}`;
}

async function appendLog(level, event, module, meta) {
  const message = buildMessage(event, meta);
  const contextJson = meta ? JSON.stringify(meta) : null;
  try {
    await desktopLogAppend({ level, module: module ?? 'app', message, contextJson });
  } catch {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[${level.toUpperCase()}] [${module ?? 'app'}] ${message}`,
    );
  }
}

export const log = {
  info(event, meta, module) {
    return appendLog('info', event, module, meta);
  },
  warn(event, meta, module) {
    return appendLog('warn', event, module, meta);
  },
  error(event, errorOrMeta, module) {
    const meta =
      errorOrMeta instanceof Error
        ? { error: errorOrMeta.message, stack: errorOrMeta.stack }
        : errorOrMeta;
    return appendLog('error', event, module, meta);
  },
  debug(event, meta, module) {
    if (import.meta.env?.DEV) {
      return appendLog('debug', event, module, meta);
    }
    return Promise.resolve();
  },
};
