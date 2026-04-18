type GenericWhere = Record<string, unknown>;

export function buildIsActiveFilter(includeInactive?: boolean): GenericWhere {
  return includeInactive ? {} : { isActive: true };
}

export function buildSoftDeleteFilter(includeDeleted?: boolean): GenericWhere {
  return includeDeleted ? {} : { deletedAt: null };
}

export function buildCaseInsensitiveSearchFilter(
  fields: string[],
  search?: string,
): GenericWhere {
  const normalizedSearch = search?.trim();
  if (!normalizedSearch || fields.length === 0) {
    return {};
  }

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: normalizedSearch,
        mode: 'insensitive',
      },
    })),
  };
}

export function buildDateRangeFilter(
  field: string,
  dateFrom?: string,
  dateTo?: string,
): GenericWhere {
  if (!dateFrom && !dateTo) {
    return {};
  }

  return {
    [field]: {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    },
  };
}
