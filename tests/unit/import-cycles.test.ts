import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('import cycle check', () => {
  it('findet keine zyklischen Imports in src', async () => {
    await expect(execFileAsync('node', ['scripts/check-import-cycles.mjs'])).resolves.toMatchObject({
      stdout: expect.stringContaining('Keine zyklischen Imports gefunden.'),
    });
  });
});
