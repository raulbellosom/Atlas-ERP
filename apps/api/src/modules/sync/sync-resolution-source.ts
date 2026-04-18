import { SourceType } from '@prisma/client';

type HeaderValue = string | string[] | undefined;

function normalizeHeaderValue(value: HeaderValue): string {
  if (Array.isArray(value)) {
    return value.join(',').toLowerCase();
  }
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  return '';
}

/**
 * Resuelve el origen de cliente para auditoría de resolución de conflictos.
 * Por defecto se considera WEB para mantener backward compatibility.
 */
export function resolveSyncConflictSource(
  headers?: Record<string, HeaderValue>,
): SourceType {
  if (!headers) {
    return SourceType.WEB;
  }

  const atlasClient = normalizeHeaderValue(headers['x-atlas-client']);
  const clientSource = normalizeHeaderValue(headers['x-client-source']);

  const sourceHint = `${atlasClient},${clientSource}`;
  if (sourceHint.includes('desktop')) {
    return SourceType.DESKTOP;
  }

  return SourceType.WEB;
}

