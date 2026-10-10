#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, join, relative, resolve, sep } from 'node:path';
import { createServer } from 'vite';

const DEFAULT_ROOT = resolve('src/game/content/data');
const MAX_FILE_BYTES = 256 * 1024;
const args = process.argv.slice(2);

if (args.length !== 0 && (args.length !== 2 || args[0] !== '--root' || !args[1])) {
  console.error('Aufruf: npm run validate:content [-- --root <Inhaltsordner>]');
  process.exitCode = 1;
} else {
  try {
    const root = args.length ? resolve(args[1]) : DEFAULT_ROOT;
    const server = await createServer({
      configFile: false, appType: 'custom', logLevel: 'error',
      server: { middlewareMode: true },
    });
    try {
      const { CONTENT_CATEGORIES, validateContent } =
        await server.ssrLoadModule('/src/game/content/content-validation.ts');
      const result = await scanContent(root, CONTENT_CATEGORIES, validateContent);
      for (const issue of result.issues) console.error('FEHLER: ' + issue);
      if (result.files === 0) console.warn('Hinweis: 0 Inhaltsdateien vorhanden; kein produktiver Inhalt geprüft.');
      console.log('Inhaltsprüfung: ' + result.files + ' Datei(en), ' + result.issues.length + ' Fehler.');
      if (result.issues.length > 0) process.exitCode = 1;
    } finally {
      await server.close();
    }
  } catch (error) {
    console.error('Inhaltsprüfung fehlgeschlagen: ' + String(error));
    process.exitCode = 1;
  }
}

async function scanContent(root, categories, validateContent) {
  const issues = [];
  let files = 0;
  let rootEntries;
  try {
    rootEntries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT' && root === DEFAULT_ROOT) {
      return { files: 0, issues };
    }
    throw error;
  }

  for (const entry of rootEntries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === '.gitkeep' && entry.isFile()) continue;
    if (!entry.isDirectory() || !categories.includes(entry.name)) {
      issues.push(entry.name + ': unbekannte Inhaltskategorie oder unsicherer Eintrag.');
      continue;
    }
    const category = entry.name;
    const path = join(root, category);
    const entries = await readdir(path, { withFileTypes: true });
    for (const file of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (file.name === '.gitkeep' && file.isFile()) continue;
      const display = join(category, file.name).split(sep).join('/');
      if (!file.isFile() || !file.name.endsWith('.json')) {
        issues.push(display + ': erwartet eine reguläre JSON-Datei (keine Links/Unterordner).');
        continue;
      }
      files++;
      const filename = join(path, file.name);
      const metadata = await stat(filename);
      if (metadata.size > MAX_FILE_BYTES) {
        issues.push(display + ': Datei ist größer als 256 KiB.');
        continue;
      }
      let content;
      try {
        content = JSON.parse(await readFile(filename, 'utf8'));
      } catch (error) {
        issues.push(display + ': ungültiges JSON (' + (error instanceof SyntaxError ? 'Syntaxfehler' : 'Lesefehler') + ').');
        continue;
      }

      const result = validateContent(category, content);
      if (!result.valid) {
        for (const problem of result.issues) issues.push(display + ': ' + problem);
      } else if (basename(file.name, '.json') !== result.id) {
        issues.push(display + ': Dateiname muss mit der Inhalts-ID ' + result.id + ' übereinstimmen.');
      }
    }
  }
  return { files, issues };
}
