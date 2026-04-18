import { invokeDesktop } from "./desktopBridge.js";

const fallbackLogs = [];
let fallbackLogId = 1;

function nowIso() {
  return new Date().toISOString();
}

export async function desktopLogAppend({
  level,
  module,
  message,
  contextJson = null,
}) {
  const payload = { level, module, message, contextJson };
  return invokeDesktop("desktop_log_append", payload, () => {
    const id = fallbackLogId++;
    fallbackLogs.push({
      id,
      level,
      module,
      message,
      contextJson,
      createdAt: nowIso(),
    });
    return id;
  });
}

export async function desktopLogList({ level, limit = 200 } = {}) {
  return invokeDesktop("desktop_log_list", { level, limit }, () => {
    const source = level
      ? fallbackLogs.filter((entry) => entry.level === level)
      : [...fallbackLogs];
    return source.slice(-limit).reverse();
  });
}

export async function desktopLogRotate(maxRecords = 5000) {
  return invokeDesktop("desktop_log_rotate", { maxRecords }, () => {
    const removeCount = Math.max(0, fallbackLogs.length - maxRecords);
    if (removeCount > 0) {
      fallbackLogs.splice(0, removeCount);
    }
    return removeCount;
  });
}
