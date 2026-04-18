type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function serializeResponseValue(value: unknown): JsonValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeResponseValue(item));
  }

  if (value !== null && typeof value === 'object') {
    if (typeof (value as any).toJSON === 'function') {
      return (value as any).toJSON();
    }
    const serialized: { [key: string]: JsonValue } = {};
    for (const [key, nestedValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (nestedValue === undefined) {
        continue;
      }
      serialized[key] = serializeResponseValue(nestedValue);
    }
    return serialized;
  }

  return String(value);
}
