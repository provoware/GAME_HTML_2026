#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join, normalize, relative, sep } from 'node:path';

const SOURCE_ROOT = 'src';
const IMPORT_PATTERN = /from\s+['"](?<specifier>[^'"]+)['"]|import\s+['"](?<sideEffect>[^'"]+)['"]/g;

async function collectTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectTypeScriptFiles(path);
      }

      return Promise.resolve(entry.isFile() && path.endsWith('.ts') ? [normalize(path)] : []);
    }),
  );

  return nestedFiles.flat();
}

function toSourcePath(path) {
  return normalize(path).split(sep).join('/');
}

function resolveImport(filePath, specifier, knownFiles) {
  if (!specifier.startsWith('.') && !specifier.startsWith(`${SOURCE_ROOT}/`)) {
    return undefined;
  }

  const basePath = specifier.startsWith(`${SOURCE_ROOT}/`)
    ? specifier
    : join(filePath, '..', specifier);
  const candidates = [basePath, `${basePath}.ts`, join(basePath, 'index.ts')].map(toSourcePath);

  return candidates.find((candidate) => knownFiles.has(candidate));
}

async function buildImportGraph() {
  const files = await collectTypeScriptFiles(SOURCE_ROOT);
  const knownFiles = new Set(files.map(toSourcePath));
  const graph = new Map(files.map((file) => [toSourcePath(file), []]));

  for (const file of files) {
    const sourcePath = toSourcePath(file);
    const source = await readFile(file, 'utf8');
    const imports = [];

    for (const match of source.matchAll(IMPORT_PATTERN)) {
      const specifier = match.groups?.specifier ?? match.groups?.sideEffect;
      const resolvedImport = specifier === undefined ? undefined : resolveImport(file, specifier, knownFiles);

      if (resolvedImport !== undefined) {
        imports.push(resolvedImport);
      }
    }

    graph.set(sourcePath, imports);
  }

  return graph;
}

function findCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const active = new Set();
  const stack = [];

  function visit(file) {
    if (active.has(file)) {
      cycles.push([...stack.slice(stack.indexOf(file)), file]);
      return;
    }

    if (visited.has(file)) {
      return;
    }

    visited.add(file);
    active.add(file);
    stack.push(file);

    for (const importedFile of graph.get(file) ?? []) {
      visit(importedFile);
    }

    stack.pop();
    active.delete(file);
  }

  for (const file of graph.keys()) {
    visit(file);
  }

  return cycles;
}

function formatCycle(cycle) {
  return cycle.map((file) => relative('.', file)).join(' -> ');
}

const graph = await buildImportGraph();
const cycles = findCycles(graph);

if (cycles.length > 0) {
  console.error('Zyklische Imports gefunden:');
  for (const cycle of cycles) {
    console.error(`- ${formatCycle(cycle)}`);
  }
  process.exitCode = 1;
} else {
  console.log('Keine zyklischen Imports gefunden.');
}
