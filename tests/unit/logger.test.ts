import { describe, expect, it } from 'vitest';

import { createLogger, type LogEntry } from '../../src/core/logging/logger';

describe('createLogger', () => {
  it('filtert Einträge unterhalb des aktiven Levels', () => {
    const entries: LogEntry[] = [];
    const logger = createLogger('warn', { write: (entry) => entries.push(entry) });

    logger.debug('versteckte Diagnose');
    logger.info('normaler Hinweis');
    logger.warn('sichtbare Warnung', { recoverable: true });

    expect(entries).toEqual([
      {
        level: 'warn',
        message: 'sichtbare Warnung',
        context: { recoverable: true },
      },
    ]);
  });

  it('schreibt Fehler mit Ursache und Kontext', () => {
    const entries: LogEntry[] = [];
    const cause = new Error('kaputt');
    const logger = createLogger('debug', { write: (entry) => entries.push(entry) });

    logger.error('Aktion fehlgeschlagen', cause, { action: 'test' });

    expect(entries).toEqual([
      {
        level: 'error',
        message: 'Aktion fehlgeschlagen',
        cause,
        context: { action: 'test' },
      },
    ]);
  });

  it('unterdrückt alle Einträge im Silent-Level', () => {
    const entries: LogEntry[] = [];
    const logger = createLogger('silent', { write: (entry) => entries.push(entry) });

    logger.error('nicht sichtbar');

    expect(entries).toEqual([]);
  });
});
