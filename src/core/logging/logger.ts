export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export type LogContext = Readonly<Record<string, string | number | boolean | null>>;

export type LogEntry = {
  readonly level: Exclude<LogLevel, 'silent'>;
  readonly message: string;
  readonly context?: LogContext;
  readonly cause?: unknown;
};

export type LogSink = {
  readonly write: (entry: LogEntry) => void;
};

export type Logger = {
  readonly level: LogLevel;
  readonly debug: (message: string, context?: LogContext) => void;
  readonly info: (message: string, context?: LogContext) => void;
  readonly warn: (message: string, context?: LogContext) => void;
  readonly error: (message: string, cause?: unknown, context?: LogContext) => void;
};

const LOG_LEVEL_PRIORITY: Readonly<Record<LogLevel, number>> = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
});

export function createLogger(level: LogLevel, sink: LogSink = createConsoleSink()): Logger {
  return {
    level,
    debug(message, context) {
      writeIfEnabled(level, sink, { level: 'debug', message, context });
    },
    info(message, context) {
      writeIfEnabled(level, sink, { level: 'info', message, context });
    },
    warn(message, context) {
      writeIfEnabled(level, sink, { level: 'warn', message, context });
    },
    error(message, cause, context) {
      writeIfEnabled(level, sink, { level: 'error', message, cause, context });
    },
  };
}

export const logger = createLogger(import.meta.env.DEV ? 'debug' : 'warn');

function writeIfEnabled(activeLevel: LogLevel, sink: LogSink, entry: LogEntry): void {
  if (LOG_LEVEL_PRIORITY[entry.level] < LOG_LEVEL_PRIORITY[activeLevel]) {
    return;
  }

  sink.write(entry);
}

function createConsoleSink(): LogSink {
  return {
    write(entry) {
      if (entry.level === 'error') {
        console.error(entry.message, entry.context ?? {}, entry.cause ?? '');
        return;
      }

      if (entry.level === 'warn') {
        console.warn(entry.message, entry.context ?? {});
      }
    },
  };
}
