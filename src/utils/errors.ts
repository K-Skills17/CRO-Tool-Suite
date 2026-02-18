/**
 * Centralized Error Handling
 * All errors flow through here for consistent logging, categorization, and user-friendly messages.
 */

export enum ErrorCode {
  // Network / Fetch errors
  FETCH_FAILED = 'FETCH_FAILED',
  FETCH_TIMEOUT = 'FETCH_TIMEOUT',
  INVALID_URL = 'INVALID_URL',
  BLOCKED_BY_SITE = 'BLOCKED_BY_SITE',

  // Analysis errors
  PARSE_FAILED = 'PARSE_FAILED',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  SCORING_ERROR = 'SCORING_ERROR',

  // Data errors
  SUPABASE_ERROR = 'SUPABASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',

  // Report errors
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',

  // Config errors
  CONFIG_ERROR = 'CONFIG_ERROR',
  MISSING_ENV = 'MISSING_ENV',

  // General
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  context?: Record<string, unknown>;
  timestamp: string;
  stack?: string;
}

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.FETCH_FAILED]: 'Unable to fetch the website. Please check the URL and try again.',
  [ErrorCode.FETCH_TIMEOUT]: 'The website took too long to respond. It may be down or very slow.',
  [ErrorCode.INVALID_URL]: 'Please enter a valid website URL (e.g., https://example.com).',
  [ErrorCode.BLOCKED_BY_SITE]: 'The website blocked our analysis request. Try again later.',
  [ErrorCode.PARSE_FAILED]: 'Could not parse the website content. The page may use unsupported technology.',
  [ErrorCode.EMPTY_CONTENT]: 'The website returned empty content. It may require JavaScript to load.',
  [ErrorCode.ANALYSIS_FAILED]: 'Analysis encountered an error. Please try again.',
  [ErrorCode.SCORING_ERROR]: 'Error calculating scores. Some results may be incomplete.',
  [ErrorCode.SUPABASE_ERROR]: 'Database connection error. Please check your Supabase configuration.',
  [ErrorCode.STORAGE_ERROR]: 'Error saving data. Please try again.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided. Please check your entries.',
  [ErrorCode.DATA_NOT_FOUND]: 'Requested data was not found.',
  [ErrorCode.PDF_GENERATION_FAILED]: 'Error generating PDF report. Try the HTML export instead.',
  [ErrorCode.EXPORT_FAILED]: 'Export failed. Please try again.',
  [ErrorCode.CONFIG_ERROR]: 'Configuration error. Please check your setup.',
  [ErrorCode.MISSING_ENV]: 'Missing environment variable. Check .env.local file.',
  [ErrorCode.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

export function createAppError(
  code: ErrorCode,
  technicalMessage: string,
  context?: Record<string, unknown>
): AppError {
  return {
    code,
    message: technicalMessage,
    userMessage: ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN],
    context,
    timestamp: new Date().toISOString(),
    stack: new Error().stack,
  };
}

export function handleError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAppError(ErrorCode.FETCH_FAILED, error.message);
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      return createAppError(ErrorCode.FETCH_TIMEOUT, error.message);
    }
    return createAppError(ErrorCode.UNKNOWN, error.message);
  }

  return createAppError(ErrorCode.UNKNOWN, String(error));
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'userMessage' in value
  );
}

// Error logging - logs to console with structured data for debugging
export function logError(error: AppError): void {
  console.error(`[${error.code}] ${error.message}`, {
    userMessage: error.userMessage,
    context: error.context,
    timestamp: error.timestamp,
  });
}
