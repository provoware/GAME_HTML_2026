import { createRandomStreams } from '../../game/rng/random-streams';
import { chooseWeighted } from '../../game/rng/weighted-choice';
import { parseRandomSeed } from '../../game/rng/random-seed';

/**
 * Nur ein Entwicklungswerkzeug: echte RNG-Funktionen sichtbar prüfen.
 * Kein Spielzustand, keine Savegame-Änderung, kein Ersatz für die Engine.
 */
export function createRngDevelopmentLab(document: Document): HTMLElement {
  const section = document.createElement('section');
  section.dataset.rngDevelopmentLab = 'true';
  section.setAttribute('aria-label', 'RNG-Testlabor');

  const title = document.createElement('h3');
  title.textContent = 'Zufallslabor (nur Entwicklung)';
  const intro = document.createElement('p');
  intro.textContent = 'Gleicher Startwert und gleiche Klickfolge ergeben dieselbe Ereignisfolge. Gewichte: Alltag 9, Selten 1.';

  const label = document.createElement('label');
  label.htmlFor = 'rng-test-seed';
  label.textContent = 'Startwert (8 Hex-Zeichen): ';
  const input = document.createElement('input');
  input.id = 'rng-test-seed';
  input.type = 'text';
  input.maxLength = 8;
  input.value = '0000002a';
  input.autocomplete = 'off';
  input.spellcheck = false;
  label.append(input);

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.textContent = 'Startwert übernehmen';
  const draw = document.createElement('button');
  draw.type = 'button';
  draw.textContent = 'Ereignis ziehen';
  draw.disabled = true;
  const output = document.createElement('p');
  output.setAttribute('role', 'status');
  output.setAttribute('aria-live', 'polite');
  output.textContent = 'Startwert übernehmen, um zu beginnen.';

  let eventRng: ReturnType<typeof createRandomStreams>['event'] | null = null;
  let count = 0;
  reset.addEventListener('click', () => {
    try {
      const seed = parseRandomSeed(input.value);
      eventRng = createRandomStreams(seed).event;
      count = 0;
      draw.disabled = false;
      output.textContent = 'Startwert gültig – Ereignisse können gezogen werden.';
    } catch {
      eventRng = null;
      draw.disabled = true;
      output.textContent = 'Ungültiger Startwert: genau 8 kleine Zeichen von 0–9 oder a–f eingeben.';
    }
  });
  draw.addEventListener('click', () => {
    if (!eventRng) return;
    const selected = chooseWeighted([
      { value: 'Alltag', weight: 9 },
      { value: 'Selten', weight: 1 },
    ], eventRng);
    count += 1;
    output.textContent = 'Ziehung ' + count + ': ' + selected;
  });

  section.append(title, intro, label, reset, draw, output);
  return section;
}
