import { HttpException, type HttpStatus } from '@nestjs/common';
import { ErrorCode, type ErrorCodeValue } from './error-codes';

interface AppExceptionParams {
  statusCode: HttpStatus;
  code: ErrorCodeValue | string;
  message: string;
  error?: string;
  details?: unknown;
}

interface AppExceptionResponse {
  statusCode: number;
  code: ErrorCodeValue | string;
  message: string;
  error: string;
  details?: unknown;
}

export class AppException extends HttpException {
  constructor(params: AppExceptionParams) {
    const response: AppExceptionResponse = {
      statusCode: params.statusCode,
      code: params.code,
      message: params.message,
      error: params.error ?? getDefaultErrorLabel(params.statusCode),
      ...(params.details !== undefined ? { details: params.details } : {}),
    };

    super(response, params.statusCode);
  }
}

function getDefaultErrorLabel(statusCode: number): string {
  if (statusCode >= 500) {
    return 'Internal Server Error';
  }
  if (statusCode === 401) {
    return 'Unauthorized';
  }
  if (statusCode === 403) {
    return 'Forbidden';
  }
  if (statusCode === 404) {
    return 'Not Found';
  }
  if (statusCode === 409) {
    return 'Conflict';
  }
  if (statusCode === 422) {
    return 'Unprocessable Entity';
  }
  if (statusCode === 400) {
    return 'Bad Request';
  }
  return ErrorCode.HTTP_ERROR;
}
