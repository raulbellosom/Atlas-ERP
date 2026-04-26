const API_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000/api';
const IS_DEV = import.meta.env?.DEV ?? false;

const IGNORED_PATTERNS = [
  /ResizeObserver loop/,
  /Non-Error promise rejection/,
  /chrome-extension/,
  /moz-extension/,
];

function shouldIgnore(message) {
  return IGNORED_PATTERNS.some((p) => p.test(String(message ?? '')));
}

async function sendReport(payload) {
  if (IS_DEV) {
    console.warn('[error-reporter]', payload);
    return;
  }
  try {
    await fetch(`${API_URL}/telemetry/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // silent
  }
}

export function initErrorReporter() {
  window.addEventListener('error', (event) => {
    if (shouldIgnore(event.message)) return;
    void sendReport({
      type: 'unhandled_error',
      error: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error ? reason.message : String(reason ?? 'unknown');
    if (shouldIgnore(message)) return;
    void sendReport({
      type: 'unhandled_rejection',
      error: message,
      stack: reason instanceof Error ? reason.stack : undefined,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  });
}
