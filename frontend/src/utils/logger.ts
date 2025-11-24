/**
 * Production-Safe Logger
 * Automatically suppresses debug logs in production
 */

const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEV = import.meta.env.DEV;

interface LogData {
  [key: string]: any;
}

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;
    
    if (data && Object.keys(data).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    
    return `${prefix} ${message}`;
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, data?: LogData): void {
    if (IS_DEV) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  /**
   * Info logs - only in development
   */
  info(message: string, data?: LogData): void {
    if (IS_DEV) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  /**
   * Warning logs - always shown
   */
  warn(message: string, data?: LogData): void {
    console.warn(this.formatMessage('WARN', message, data));
  }

  /**
   * Error logs - always shown
   */
  error(message: string, error?: Error | unknown, data?: LogData): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: IS_DEV ? error.stack : undefined, ...data }
      : { error, ...data };
    
    console.error(this.formatMessage('ERROR', message, errorData));
  }

  /**
   * Performance timing - only in development
   */
  time(label: string): void {
    if (IS_DEV) {
      console.time(`[${this.context}] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (IS_DEV) {
      console.timeEnd(`[${this.context}] ${label}`);
    }
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Global logger for quick use
 */
export const logger = {
  debug: (message: string, data?: LogData) => {
    if (IS_DEV) console.log(`[DEBUG] ${message}`, data || '');
  },
  info: (message: string, data?: LogData) => {
    if (IS_DEV) console.info(`[INFO] ${message}`, data || '');
  },
  warn: (message: string, data?: LogData) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  error: (message: string, error?: Error | unknown, data?: LogData) => {
    console.error(`[ERROR] ${message}`, error, data || '');
  },
};
