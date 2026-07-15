import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

const SOURCE_ROOT = 'src';

type BoundaryRule = {
  readonly layer: string;
  readonly forbiddenImports: readonly string[];
};

const BOUNDARY_RULES: readonly BoundaryRule[] = [
  {
    layer: 'core',
    forbiddenImports: ['app', 'game', 'ui'],
  },
  {
    layer: 'game',
    forbiddenImports: ['app', 'ui'],
  },
  {
    layer: 'game/content',
    forbiddenImports: ['app', 'core', 'ui'],
  },
];

const IMPORT_PATTERN = /from\s+['"](?<specifier>[^'"]+)['"]|import\s+['"](?<sideEffect>[^'"]+)['"]/g;

async function collectTypeScriptFiles(directory: string): Promise<readonly string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectTypeScriptFiles(path);
      }

      return Promise.resolve(entry.isFile() && path.endsWith('.ts') ? [path] : []);
    }),
  );

  return files.flat();
}

function resolveLayerImport(filePath: string, specifier: string): string | undefined {
  if (specifier.startsWith(`${SOURCE_ROOT}/`)) {
    return specifier.slice(SOURCE_ROOT.length + 1).split('/')[0];
  }

  if (!specifier.startsWith('.')) {
    return undefined;
  }

  const resolvedPath = relative(SOURCE_ROOT, join(filePath, '..', specifier));

  if (resolvedPath.startsWith('..')) {
    return undefined;
  }

  return resolvedPath.split(sep)[0];
}

async function findForbiddenImports(rule: BoundaryRule): Promise<readonly string[]> {
  const files = await collectTypeScriptFiles(join(SOURCE_ROOT, rule.layer));
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const matches = source.matchAll(IMPORT_PATTERN);

    for (const match of matches) {
      const specifier = match.groups?.specifier ?? match.groups?.sideEffect;

      if (specifier === undefined) {
        continue;
      }

      const importedLayer = resolveLayerImport(file, specifier);

      if (importedLayer !== undefined && rule.forbiddenImports.includes(importedLayer)) {
        violations.push(`${file} -> ${specifier}`);
      }
    }
  }

  return violations;
}

describe('architecture boundaries', () => {
  it.each(BOUNDARY_RULES)('$layer importiert keine verbotenen Schichten', async (rule) => {
    await expect(findForbiddenImports(rule)).resolves.toEqual([]);
  });
});
