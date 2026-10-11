import { describe, expect, it } from 'vitest';
import { ESLint } from 'eslint';

/**
 * GAME-0308: Ein echter ESLint-Lauf gegen die produktive Konfiguration,
 * kein Textvergleich mit einer Liste verbotener Zeichenfolgen.
 */
const lint = new ESLint({ cwd: process.cwd() });
const gamePath = 'src/game/rng/game-0308-check.ts';

describe('GAME-0308 – kein Math.random in Spielmodulen', () => {
  it.each([
    'Math.random();',
    "Math['random']();",
    'Math?.random();',
    'const generator = Math.random; generator();',
  ])('verhindert direkten und geklammerten Zugriff: %s', async (source) => {
    const [result] = await lint.lintText(source, { filePath: gamePath });
    expect(result).toBeDefined();
    expect(result?.messages.some((message) => message.ruleId === 'no-restricted-properties')).toBe(true);
    expect(result?.errorCount).toBeGreaterThan(0);
  });

  it('lässt die versionierte Zufallsquelle in Spielmodulen zu', async () => {
    const [result] = await lint.lintText(
      "import { createSeededRandom } from './seeded-random';\ncreateSeededRandom(42).nextUint32();",
      { filePath: gamePath },
    );
    expect(result?.errorCount).toBe(0);
  });

  it('verwechselt Kommentare und Zeichenfolgen nicht mit Funktionsaufrufen', async () => {
    const [result] = await lint.lintText(
      "// Math.random() ist hier ausdrücklich verboten.\nexport const message = 'Math.random()';",
      { filePath: gamePath },
    );
    expect(result?.errorCount).toBe(0);
  });

  it('schränkt keine unabhängigen Oberflächenmodule ein', async () => {
    const [result] = await lint.lintText(
      'export const value = Math.random();',
      { filePath: 'src/ui/game-0308-check.ts' },
    );
    expect(result?.messages.some((message) => message.ruleId === 'no-restricted-properties')).toBe(false);
  });
});
