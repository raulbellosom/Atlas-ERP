type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonSerializable = {
  toJSON: () => unknown;
};

function isJsonSerializable(value: unknown): value is JsonSerializable {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  return 'toJSON' in value && typeof value.toJSON === 'function';
}

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
    if (isJsonSerializable(value)) {
      return serializeResponseValue(value.toJSON());
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
