import { normalizePositiveInt } from '../utils/number.util';
import type { PaginatedResult, PaginationMeta, PaginationQueryResolved } from './pagination.types';

export function resolvePaginationQuery(
  query: { page?: number; limit?: number },
  defaults: { page?: number; limit?: number; maxLimit?: number } = {},
): PaginationQueryResolved {
  const page = normalizePositiveInt(query.page, defaults.page ?? 1, 1);
  const limit = normalizePositiveInt(
    query.limit,
    defaults.limit ?? 20,
    1,
    defaults.maxLimit ?? 100,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function buildPaginationMeta(
  total: number,
  query: PaginationQueryResolved,
): PaginationMeta {
  return {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export function toPaginatedResult<T>(
  items: T[],
  total: number,
  query: PaginationQueryResolved,
): PaginatedResult<T> {
  return {
    items,
    pagination: buildPaginationMeta(total, query),
  };
}
