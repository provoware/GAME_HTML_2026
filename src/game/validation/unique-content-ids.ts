/** Eine zuvor schemageprüfte Inhalts-ID und ihre Quelldatei. */
export type ContentIdEntry = { readonly id: string; readonly file: string };

/** Prüft globale Eindeutigkeit unabhängig von der Eingabereihenfolge. */
export function findDuplicateContentIds(entries: readonly ContentIdEntry[]): readonly string[] {
  const firstById = new Map<string, string>();
  const issues: string[] = [];
  const ordered = [...entries].sort((a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : 0);
  for (const entry of ordered) {
    const first = firstById.get(entry.id);
    if (first !== undefined) {
      issues.push(entry.file + ': doppelte Inhalts-ID "' + entry.id + '" (bereits in ' + first + ').');
    } else {
      firstById.set(entry.id, entry.file);
    }
  }
  return issues;
}
