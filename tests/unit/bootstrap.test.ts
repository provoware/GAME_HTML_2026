/* @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest';

import { bootstrapApp } from '../../src/app/bootstrap';
import { createAppEventBus } from '../../src/core/events/event-bus';

describe('bootstrapApp', () => {
  it('rendert den Startscreen in den App-Container', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');
    const app = document.createElement('div');
    app.id = 'app';
    document.body.append(app);

    const eventBus = createAppEventBus();
    const bootEvents: string[] = [];
    eventBus.on('app:booted', (payload) => bootEvents.push(payload.appName));

    const root = bootstrapApp({ document, eventBus });

    expect(root).toBe(app);
    expect(root.querySelector('main')?.id).toBe('main-content');
    expect(root.textContent).toContain('PPPoppi 1986');
    expect(root.textContent).toContain('Version 0.0.0');
    expect(bootEvents).toEqual(['PPPoppi 1986 — Euronen, Ehre, Untergrund']);
  });

  it('zeigt den Diagnosemodus nur bei aktivierter Option', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');
    const app = document.createElement('div');
    app.id = 'app';
    document.body.append(app);

    const root = bootstrapApp({ document, diagnosticsEnabled: true });

    expect(root.querySelector('[data-diagnostics-panel="true"]')).not.toBeNull();
    expect(root.textContent).toContain('Diagnosemodus');
  });

  it('blendet den Diagnosemodus bei deaktivierter Option aus', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');
    const app = document.createElement('div');
    app.id = 'app';
    document.body.append(app);

    const root = bootstrapApp({ document, diagnosticsEnabled: false });

    expect(root.querySelector('[data-diagnostics-panel="true"]')).toBeNull();
  });

  it('meldet einen fehlenden App-Container verständlich', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');

    expect(() => bootstrapApp({ document })).toThrow('App-Container #app wurde nicht gefunden.');
  });
  it('zeigt Ziehungen im Diagnosefenster und leert das Protokoll per Schaltfläche', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');
    const app = document.createElement('div');
    app.id = 'app';
    document.body.append(app);

    const root = bootstrapApp({ document, diagnosticsEnabled: true });
    const panel = root.querySelector<HTMLElement>('[data-diagnostics-panel="true"]');
    const output = panel?.querySelector<HTMLElement>('[data-random-trace="true"]');
    const buttons = panel?.querySelectorAll<HTMLButtonElement>('button');

    expect(output?.textContent).toBe('Noch keine Testziehungen.');
    expect(buttons).toHaveLength(2);
    expect(buttons?.[0]?.textContent).toBe('Testziehung auslösen');
    expect(buttons?.[1]?.textContent).toBe('Protokoll leeren');

    buttons?.[0]?.click();
    expect(output?.textContent).toMatch(/^#1 event: nextUint32 = \d+ \(Zustand \d+ → \d+\)$/);

    buttons?.[0]?.click();
    expect(output?.textContent?.split('\n')).toHaveLength(2);
    expect(output?.textContent).toContain('#2 event: nextUint32');

    buttons?.[1]?.click();
    expect(output?.textContent).toBe('Noch keine Testziehungen.');
    buttons?.[0]?.click();
    expect(output?.textContent).toContain('#3 event: nextUint32');
  });

  it('zeigt weder Protokoll noch Testschaltflächen bei abgeschalteter Diagnose', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');
    const app = document.createElement('div');
    app.id = 'app';
    document.body.append(app);

    const root = bootstrapApp({ document, diagnosticsEnabled: false });
    expect(root.querySelector('[data-random-trace]')).toBeNull();
    expect(root.querySelectorAll('button')).toHaveLength(0);
  });
});
