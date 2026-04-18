import type { ErrorCodeValue } from './error-codes';

export interface StandardErrorResponse {
  statusCode: number;
  code: ErrorCodeValue | string;
  message: string;
  error: string;
  path: string;
  timestamp: string;
  details?: unknown;
}
