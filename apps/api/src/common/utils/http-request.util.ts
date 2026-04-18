import type { IncomingHttpHeaders } from 'node:http';

export function getSingleHeaderValue(
  headers: IncomingHttpHeaders,
  key: string,
): string | undefined {
  const headerValue = headers[key.toLowerCase()];
  if (!headerValue || Array.isArray(headerValue)) {
    return undefined;
  }
  const normalized = headerValue.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function getCsvHeaderValues(
  headers: IncomingHttpHeaders,
  key: string,
): string[] {
  const raw = getSingleHeaderValue(headers, key);
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
