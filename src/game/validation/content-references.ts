import type { ContentCategory } from './content-validation';
export type ContentReferenceEntry = {
  readonly category: ContentCategory;
  readonly id: string;
  readonly file: string;
  readonly value: unknown;
};
export function findMissingContentReferences(entries: readonly ContentReferenceEntry[]): readonly string[] {
  const available = new Map<ContentCategory, Set<string>>();
  for (const entry of entries) {
    if (!available.has(entry.category)) available.set(entry.category, new Set());
    available.get(entry.category)?.add(entry.id);
  }
  const issues: string[] = [];
  for (const entry of entries) {
    if (entry.category !== 'events') continue;
    const value = entry.value as { followUpEventIds?: readonly string[] };
    for (const id of value.followUpEventIds ?? []) {
      if (!available.get('events')?.has(id)) issues.push(entry.file + ': fehlendes Ereignis ' + id);
    }
  }
  return issues;
}
