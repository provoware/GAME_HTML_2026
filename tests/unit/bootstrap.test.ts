/* @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest';

import { bootstrapApp } from '../../src/app/bootstrap';

describe('bootstrapApp', () => {
  it('rendert den Startscreen in den App-Container', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');
    const app = document.createElement('div');
    app.id = 'app';
    document.body.append(app);

    const root = bootstrapApp({ document });

    expect(root).toBe(app);
    expect(root.querySelector('main')?.id).toBe('main-content');
    expect(root.textContent).toContain('PPPoppi 1986');
  });

  it('meldet einen fehlenden App-Container verständlich', () => {
    const document = globalThis.document.implementation.createHTMLDocument('Test');

    expect(() => bootstrapApp({ document })).toThrow(
      'App-Container #app wurde nicht gefunden.',
    );
  });
});
