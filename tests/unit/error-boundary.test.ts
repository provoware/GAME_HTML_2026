/* @vitest-environment happy-dom */
import { describe, expect, it, vi } from 'vitest';

import { reportError } from '../../src/app/error-boundary';
import { createAppEventBus } from '../../src/core/events/event-bus';

describe('reportError', () => {
  it('zeigt eine verständliche Fehlermeldung und meldet ein App-Ereignis', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');
    const eventBus = createAppEventBus();
    const errorEvents: string[] = [];
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    eventBus.on('app:error', (payload) => errorEvents.push(payload.cause));

    const status = reportError(document, eventBus, 'Testursache');

    expect(status.getAttribute('role')).toBe('status');
    expect(status.textContent).toContain('technischer Fehler');
    expect(errorEvents).toEqual(['Testursache']);

    consoleError.mockRestore();
  });
});
