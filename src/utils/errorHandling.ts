/**
 * Error Handling Utilities
 * Comprehensive error handling, logging, and user-friendly error messages
 * Following Single Responsibility Principle - only error handling logic
 */

// Error Types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
  STORAGE = 'STORAGE',
  SYNC = 'SYNC'
}

// Structured Error Interface
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
  retryable: boolean;
  userMessage: string;
}

/**
 * Create structured error from any error type
 */
export const createAppError = (
  error: unknown,
  context?: string
): AppError => {
  let type: ErrorType = ErrorType.UNKNOWN;
  let message = 'An unexpected error occurred';
  let details: string | undefined;
  let code: string | undefined;
  let retryable = false;

  if (error instanceof Error) {
    message = error.message;
    details = error.stack;

    // Determine error type from message
    if (message.includes('network') || message.includes('fetch')) {
      type = ErrorType.NETWORK;
      retryable = true;
    } else if (message.includes('auth') || message.includes('unauthorized')) {
      type = ErrorType.AUTH;
    } else if (message.includes('permission') || message.includes('forbidden')) {
      type = ErrorType.PERMISSION;
    } else if (message.includes('not found')) {
      type = ErrorType.NOT_FOUND;
    } else if (message.includes('validation')) {
      type = ErrorType.VALIDATION;
    } else if (message.includes('storage') || message.includes('localStorage')) {
      type = ErrorType.STORAGE;
      retryable = true;
    } else if (message.includes('sync')) {
      type = ErrorType.SYNC;
      retryable = true;
    }
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    const err = error as any;
    message = err.message || err.error || 'Unknown error';
    code = err.code;
    type = err.type || ErrorType.UNKNOWN;
  }

  // Generate user-friendly message
  const userMessage = getUserFriendlyMessage(type, message, context);

  return {
    type,
    message,
    details,
    code,
    timestamp: new Date(),
    retryable,
    userMessage
  };
};

/**
 * Get user-friendly error message
 */
const getUserFriendlyMessage = (
  type: ErrorType,
  message: string,
  context?: string
): string => {
  const contextPrefix = context ? `${context}: ` : '';

  switch (type) {
    case ErrorType.NETWORK:
      return `${contextPrefix}Network error - please check your internet connection and try again`;
    
    case ErrorType.AUTH:
      return `${contextPrefix}Authentication error - please log in again`;
    
    case ErrorType.PERMISSION:
      return `${contextPrefix}You don't have permission to perform this action`;
    
    case ErrorType.NOT_FOUND:
      return `${contextPrefix}The requested item could not be found`;
    
    case ErrorType.VALIDATION:
      return `${contextPrefix}${message}`;
    
    case ErrorType.STORAGE:
      return `${contextPrefix}Storage error - please check if your browser allows local storage`;
    
    case ErrorType.SYNC:
      return `${contextPrefix}Synchronization failed - some data may be outdated`;
    
    case ErrorType.SERVER:
      return `${contextPrefix}Server error - please try again later`;
    
    default:
      return `${contextPrefix}${message || 'An unexpected error occurred'}`;
  }
};

/**
 * Log error for debugging
 */
export const logError = (error: AppError, additionalInfo?: any): void => {
  console.error('=== APP ERROR ===');
  console.error('Type:', error.type);
  console.error('Message:', error.message);
  console.error('User Message:', error.userMessage);
  console.error('Timestamp:', error.timestamp.toISOString());
  console.error('Retryable:', error.retryable);
  
  if (error.code) {
    console.error('Code:', error.code);
  }
  
  if (error.details) {
    console.error('Details:', error.details);
  }
  
  if (additionalInfo) {
    console.error('Additional Info:', additionalInfo);
  }
  
  console.error('=================');
};

/**
 * Handle error with retry logic
 */
export const handleErrorWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  context?: string
): Promise<{ success: boolean; data?: T; error?: AppError }> => {
  let lastError: AppError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      lastError = createAppError(error, context);
      logError(lastError, { attempt: attempt + 1, maxRetries: maxRetries + 1 });

      // Don't retry if not retryable or last attempt
      if (!lastError.retryable || attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  return { success: false, error: lastError };
};

/**
 * Safe local storage operations with error handling
 */
export const safeLocalStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available');
        return defaultValue;
      }

      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      return JSON.parse(item) as T;
    } catch (error) {
      const appError = createAppError(error, 'Reading from localStorage');
      logError(appError, { key });
      return defaultValue;
    }
  },

  set: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available');
        return false;
      }

      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      const appError = createAppError(error, 'Writing to localStorage');
      logError(appError, { key, valueType: typeof value });
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available');
        return false;
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      const appError = createAppError(error, 'Removing from localStorage');
      logError(appError, { key });
      return false;
    }
  },

  clear: (): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available');
        return false;
      }

      localStorage.clear();
      return true;
    } catch (error) {
      const appError = createAppError(error, 'Clearing localStorage');
      logError(appError);
      return false;
    }
  }
};

/**
 * Async operation wrapper with error handling
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  context: string,
  fallbackValue?: T
): Promise<{ success: boolean; data?: T; error?: AppError }> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const appError = createAppError(error, context);
    logError(appError);
    
    return { 
      success: false, 
      error: appError,
      data: fallbackValue
    };
  }
};

/**
 * Validate and execute with error handling
 */
export const validateAndExecute = async <T>(
  validationFn: () => { isValid: boolean; errors: string[] },
  executionFn: () => Promise<T>,
  context: string
): Promise<{ success: boolean; data?: T; error?: AppError }> => {
  // Validate first
  const validation = validationFn();
  
  if (!validation.isValid) {
    const error = createAppError(
      new Error(validation.errors.join(', ')),
      context
    );
    error.type = ErrorType.VALIDATION;
    logError(error);
    
    return { success: false, error };
  }

  // Execute if validation passes
  return safeAsync(executionFn, context);
};

/**
 * Format error for display
 */
export const formatErrorForDisplay = (error: AppError): {
  title: string;
  message: string;
  actions: string[];
} => {
  const actions: string[] = [];

  if (error.retryable) {
    actions.push('Try again');
  }

  if (error.type === ErrorType.AUTH) {
    actions.push('Log in again');
  }

  if (error.type === ErrorType.NETWORK) {
    actions.push('Check connection');
  }

  return {
    title: getErrorTitle(error.type),
    message: error.userMessage,
    actions
  };
};

/**
 * Get error title based on type
 */
const getErrorTitle = (type: ErrorType): string => {
  switch (type) {
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.NETWORK:
      return 'Network Error';
    case ErrorType.AUTH:
      return 'Authentication Error';
    case ErrorType.PERMISSION:
      return 'Permission Denied';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.STORAGE:
      return 'Storage Error';
    case ErrorType.SYNC:
      return 'Synchronization Error';
    case ErrorType.SERVER:
      return 'Server Error';
    default:
      return 'Error';
  }
};

