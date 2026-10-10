import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const DIRS: string[] = [];
const SCRIPT = resolve('scripts/validate-content.mjs');
const VALID_FIXTURES = resolve('tests/fixtures/content-valid');

function tempRoot(): string {
  const folder = mkdtempSync(join(tmpdir(), 'game0215-'));
  DIRS.push(folder);
  return folder;
}
function file(root: string, category: string, name: string, data: unknown): void {
  mkdirSync(join(root, category), { recursive: true });
  writeFileSync(join(root, category, name), typeof data === 'string' ? data : JSON.stringify(data));
}
function run(root: string) {
  return spawnSync(process.execPath, [SCRIPT, '--root', root], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 45000,
  });
}

afterEach(() => {
  for (const dir of DIRS.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('GAME-0215 – echtes Kommandozeilen-Skript', () => {
  it('nimmt drei gültige, vollständig referenzierte JSON-Testdateien an', () => {
    const result = run(VALID_FIXTURES);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('3 Datei(en), 0 Fehler');
  });

  it('erfasst verschiedene Fehler samt Datei und beendet sich mit Fehlerstatus', () => {
    const dir = tempRoot();
    const valid = JSON.parse(readFileSync(join(VALID_FIXTURES, 'missions/mission-demo.json'), 'utf8'));
    file(dir, 'missions', 'mission-demo.json', {
      ...valid, steps: [{ id: 'step-demo', objectiveIds: ['not-present'] }],
    });
    file(dir, 'events', 'event-demo.json', '{broken');
    file(dir, 'events', 'event-wrong-name.json', {
      schemaVersion: 1, id: 'event-another', title: 'X', description: 'Y',
      weight: 1, cooldownTurns: 0, conditionIds: [], conflictGroupIds: [],
      repeatLimit: null, effectIds: ['effect-x'], followUpEventIds: [],
      rngStream: 'event', randomDrawId: 'draw-x',
    });
    file(dir, 'executables', 'danger.json', '{"script":"eval()"}');
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('missions/mission-demo.json:');
    expect(result.stderr).toContain('unbekanntes Ziel');
    expect(result.stderr).toContain('events/event-demo.json: ungültiges JSON');
    expect(result.stderr).toContain('Dateiname muss');
    expect(result.stderr).toContain('unbekannte Inhaltskategorie');
  });

  it('sperrt übergroße Inhalte, Nicht-JSON-Dateien und fehlende externe Wurzel', () => {
    const dir = tempRoot();
    file(dir, 'events', 'huge.json', 'x'.repeat(256 * 1024 + 1));
    file(dir, 'events', 'notes.txt', '{}');
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('größer als 256 KiB');
    expect(result.stderr).toContain('reguläre JSON-Datei');
    const missing = run(join(dir, 'missing'));
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain('Inhaltsprüfung fehlgeschlagen');
  });
});
