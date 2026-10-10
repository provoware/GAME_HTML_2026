import type { ContentCategory } from './content-validation';

/** Nur zuvor erfolgreich schemageprüfte Datensätze übergeben. */
export type ContentReferenceEntry = {
  readonly category: ContentCategory;
  readonly id: string;
  readonly file: string;
  readonly value: unknown;
};

type ReferenceRule = readonly [field: string, target: ContentCategory];

const REFERENCE_FIELDS: Partial<Record<ContentCategory, readonly ReferenceRule[]>> = {
  characters: [
    ['dialogueIds', 'dialogues'], ['missionIds', 'missions'], ['eventIds', 'events'],
  ],
  locations: [['characterIds', 'characters'], ['eventIds', 'events']],
  missions: [['dialogueIds', 'dialogues'], ['endStateIds', 'endings']],
  events: [['followUpEventIds', 'events']],
  dialogues: [['characterId', 'characters']],
  endings: [
    ['requiredMissionIds', 'missions'],
    ['requiredAchievementIds', 'achievements'],
    ['requiredEventIds', 'events'],
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Prüft nur Verweise auf die acht vorhandenen Inhaltskategorien.
 * Condition-, Effect-, Risk-, Action- und Metric-IDs besitzen noch keine
 * eigene Inhaltsregistry und werden deshalb hier NICHT fälschlich verworfen.
 * Die lokalen Knoten-/Zielverweise prüfen weiterhin die jeweiligen Schemata.
 */
export function findMissingContentReferences(entries: readonly ContentReferenceEntry[]): readonly string[] {
  const available = new Map<ContentCategory, Set<string>>();
  for (const entry of entries) {
    const ids = available.get(entry.category) ?? new Set<string>();
    ids.add(entry.id);
    available.set(entry.category, ids);
  }

  const issues: string[] = [];
  const ordered = [...entries].sort((a, b) => a.file.localeCompare(b.file, 'en'));
  for (const entry of ordered) {
    if (!isRecord(entry.value)) continue; // Der Aufrufer prüft das Schema vorher.
    const check = (field: string, target: ContentCategory, value: unknown): void => {
      const ids = typeof value === 'string' ? [value] : Array.isArray(value) ? value : [];
      for (const id of ids) {
        if (typeof id === 'string' && !available.get(target)?.has(id)) {
          issues.push(entry.file + ': ' + field + ' verweist auf fehlende ' +
            target + '-ID "' + id + '".');
        }
      }
    };

    for (const [field, target] of REFERENCE_FIELDS[entry.category] ?? []) {
      check(field, target, entry.value[field]);
    }
    if (entry.category === 'dialogues' && Array.isArray(entry.value.nodes)) {
      for (const [nodeIndex, node] of entry.value.nodes.entries()) {
        if (!isRecord(node) || !Array.isArray(node.choices)) continue;
        for (const [choiceIndex, choice] of node.choices.entries()) {
          if (!isRecord(choice)) continue;
          const prefix = 'nodes[' + nodeIndex + '].choices[' + choiceIndex + ']';
          check(prefix + '.startMissionIds', 'missions', choice.startMissionIds);
          if (Array.isArray(choice.relationshipChanges)) {
            for (const [index, change] of choice.relationshipChanges.entries()) {
              if (isRecord(change)) {
                check(prefix + '.relationshipChanges[' + index + '].characterId',
                  'characters', change.characterId);
              }
            }
          }
        }
      }
    }
  }
  return issues;
}
