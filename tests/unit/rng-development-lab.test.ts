/* @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest';
import { createRngDevelopmentLab } from '../../src/ui/diagnostics/rng-development-lab';

function setup() {
  const document = globalThis.document.implementation.createHTMLDocument('Test');
  const panel = createRngDevelopmentLab(document);
  document.body.append(panel);
  const input = panel.querySelector<HTMLInputElement>('input');
  const buttons = panel.querySelectorAll<HTMLButtonElement>('button');
  const status = panel.querySelector('[role="status"]');
  if (!input || buttons.length !== 2 || !status) throw new Error('Fehlerhaftes UI-Testlabor');
  return { input, reset: buttons[0]!, draw: buttons[1]!, status };
}
describe('Entwicklungslabor – tatsächliche RNG-Integration', () => {
  it('hat zugängliche Beschriftungen und startet ohne Ziehungsmöglichkeit', () => {
    const { input, draw, status } = setup();
    expect(input.labels?.length).toBe(1);
    expect(draw.disabled).toBe(true);
    expect(status.getAttribute('aria-live')).toBe('polite');
  });
  it('reproduziert Ereignisfolgen nach Zurücksetzen desselben Seeds', () => {
    const { reset, draw, status } = setup();
    reset.click();
    const first: string[] = [];
    for (let i = 0; i < 20; i++) { draw.click(); first.push(status.textContent ?? ''); }
    reset.click();
    const second: string[] = [];
    for (let i = 0; i < 20; i++) { draw.click(); second.push(status.textContent ?? ''); }
    expect(second).toEqual(first);
    expect(first[0]).toContain('Ziehung 1:');
    expect(first[19]).toContain('Ziehung 20:');
  });
  it('verwirft ungültige Seeds verständlich und blockiert Aktionen', () => {
    const { input, reset, draw, status } = setup();
    reset.click();
    input.value = 'oops';
    reset.click();
    expect(draw.disabled).toBe(true);
    expect(status.textContent).toContain('Ungültiger Startwert');
  });
  it('verwendet Textausgabe statt HTML-Ausführung', () => {
    const { input, reset, status } = setup();
    input.value = '<img src=x onerror=alert(1)>';
    reset.click();
    expect(status.querySelector('img')).toBeNull();
  });
});
