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
});
