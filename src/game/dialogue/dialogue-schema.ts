import { validateEntityId } from '../../core/validation/ids';
import { isBoundedString, isIntegerInRange, isRecord } from '../../core/validation/runtime-validation';
import { PLAYER_PROFILE_FIELD_LIMITS, type PlayerProfileField } from '../profile/player-profile';

export const DIALOGUE_SCHEMA_VERSION = 1;
export const DIALOGUE_MAX_NODES = 64;
export const DIALOGUE_MAX_CHOICES = 8;
export const DIALOGUE_MAX_VARIANTS = 8;
export const DIALOGUE_MAX_REFS = 64;
export const DIALOGUE_MAX_RELATIONSHIPS = 8;
export const DIALOGUE_TEXT_LIMITS = { text: 600, label: 160 } as const;

export type DialogueRelationshipChange = {
  readonly characterId: string;
  readonly trustDelta: number;
  readonly loyaltyDelta: number;
};

export type DialogueChoice = {
  readonly id: string;
  readonly label: string;
  readonly conditionIds: readonly string[];
  readonly effectIds: readonly string[];
  readonly relationshipChanges: readonly DialogueRelationshipChange[];
  readonly startMissionIds: readonly string[];
  /** null beendet das Gespräch, andernfalls ein Knoten in diesem Dialog. */
  readonly nextNodeId: string | null;
  /** Nur eine ausdrücklich als Täuschung markierte Wahl darf folgenlos sein. */
  readonly deceptive: boolean;
};

export type DialogueNode = {
  readonly id: string;
  readonly text: string;
  /** Alternative Texte für eine spätere Wiederholungsvermeidung. */
  readonly variants: readonly string[];
  readonly conditionIds: readonly string[];
  /** Leere Auswahl beendet diesen Gesprächsknoten. */
  readonly choices: readonly DialogueChoice[];
};

/** Reiner Inhaltsvertrag, keine Dialogausführung und keine DOM-Verwendung. */
export type DialogueDefinition = {
  readonly schemaVersion: typeof DIALOGUE_SCHEMA_VERSION;
  readonly id: string;
  readonly characterId: string;
  readonly startNodeId: string;
  readonly nodes: readonly DialogueNode[];
  readonly personalizationFields: readonly PlayerProfileField[];
};

export type DialogueValidationResult =
  | { readonly valid: true; readonly dialogue: DialogueDefinition }
  | { readonly valid: false; readonly issues: readonly string[] };

const DIALOGUE_FIELDS = [
  'schemaVersion', 'id', 'characterId', 'startNodeId', 'nodes', 'personalizationFields',
] as const;
const NODE_FIELDS = ['id', 'text', 'variants', 'conditionIds', 'choices'] as const;
const CHOICE_FIELDS = [
  'id', 'label', 'conditionIds', 'effectIds', 'relationshipChanges',
  'startMissionIds', 'nextNodeId', 'deceptive',
] as const;
const RELATIONSHIP_FIELDS = ['characterId', 'trustDelta', 'loyaltyDelta'] as const;
const PROFILE_FIELDS: ReadonlySet<string> = new Set(Object.keys(PLAYER_PROFILE_FIELD_LIMITS));

export function validateDialogue(value: unknown): DialogueValidationResult {
  if (!isRecord(value)) return { valid: false, issues: ['Dialog muss ein Objekt sein.'] };

  const issues: string[] = [];
  checkFields(value, DIALOGUE_FIELDS, 'Dialog', issues);
  if (value.schemaVersion !== DIALOGUE_SCHEMA_VERSION) issues.push('schemaVersion muss 1 sein.');
  checkId(value.id, 'id', issues);
  checkId(value.characterId, 'characterId', issues);
  checkId(value.startNodeId, 'startNodeId', issues);
  checkProfileFields(value.personalizationFields, issues);
  checkNodes(value.nodes, value.personalizationFields, issues);

  if (issues.length === 0) checkGraph(value as unknown as DialogueDefinition, issues);
  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, dialogue: value as DialogueDefinition };
}

function checkFields(
  object: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  label: string,
  issues: string[],
): void {
  for (const field of fields) {
    if (!Object.hasOwn(object, field)) issues.push(label + ': ' + field + ' fehlt.');
  }
  for (const key of Reflect.ownKeys(object)) {
    if (typeof key !== 'string' || !fields.includes(key)) {
      issues.push(label + ': unbekanntes Feld ' + String(key) + '.');
    }
  }
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && validateEntityId(value).valid;
}

function checkId(value: unknown, label: string, issues: string[]): void {
  if (!isId(value)) issues.push(label + ' muss eine gültige ID sein.');
}

function limitedArray(value: unknown, min: number, max: number): value is readonly unknown[] {
  return Array.isArray(value) && value.length >= min && value.length <= max;
}

function checkIds(value: unknown, label: string, min: number, issues: string[]): void {
  if (
    !limitedArray(value, min, DIALOGUE_MAX_REFS) ||
    !value.every(isId) ||
    new Set(value).size !== value.length
  ) {
    issues.push(label + ' benötigt eindeutige gültige IDs (maximal ' + DIALOGUE_MAX_REFS + ').');
  }
}

function checkProfileFields(value: unknown, issues: string[]): void {
  if (
    !limitedArray(value, 0, DIALOGUE_MAX_REFS) ||
    !value.every((field) => typeof field === 'string' && PROFILE_FIELDS.has(field)) ||
    new Set(value).size !== value.length
  ) {
    issues.push('personalizationFields enthält unbekannte oder doppelte Profilfelder.');
  }
}

function checkText(
  value: unknown, label: string, maxLength: number,
  fields: unknown, issues: string[],
): void {
  if (!isBoundedString(value, { maxLength })) {
    issues.push(label + ' muss nichtleeren Text mit höchstens ' + maxLength + ' Zeichen enthalten.');
    return;
  }
  const withoutTokens = value.replace(/\{\{([^{}]*)\}\}/g, (_raw: string, name: string) => {
    if (!PROFILE_FIELDS.has(name) || !Array.isArray(fields) || !fields.includes(name)) {
      issues.push(label + ' enthält unbekanntes oder nicht freigegebenes Profilfeld ' + name + '.');
    }
    return '';
  });
  if (withoutTokens.includes('{{') || withoutTokens.includes('}}')) {
    issues.push(label + ' enthält einen unvollständigen Platzhalter.');
  }
}

function checkNodes(value: unknown, fields: unknown, issues: string[]): void {
  if (!limitedArray(value, 1, DIALOGUE_MAX_NODES)) {
    issues.push('nodes muss 1 bis ' + DIALOGUE_MAX_NODES + ' Knoten enthalten.');
    return;
  }

  const ids: string[] = [];
  value.forEach((node, index) => {
    const label = 'nodes[' + index + ']';
    if (!isRecord(node)) {
      issues.push(label + ' muss ein Objekt sein.');
      return;
    }
    checkFields(node, NODE_FIELDS, label, issues);
    if (isId(node.id)) ids.push(node.id);
    else checkId(node.id, label + '.id', issues);
    checkText(node.text, label + '.text', DIALOGUE_TEXT_LIMITS.text, fields, issues);
    checkVariants(node.variants, node.text, label + '.variants', fields, issues);
    checkIds(node.conditionIds, label + '.conditionIds', 0, issues);
    checkChoices(node.choices, label + '.choices', fields, issues);
  });
  if (new Set(ids).size !== ids.length) issues.push('nodes enthält doppelte Knoten-IDs.');
}

function checkVariants(
  value: unknown, text: unknown, label: string, fields: unknown, issues: string[],
): void {
  if (!limitedArray(value, 0, DIALOGUE_MAX_VARIANTS)) {
    issues.push(label + ' darf höchstens ' + DIALOGUE_MAX_VARIANTS + ' Varianten enthalten.');
    return;
  }
  value.forEach((variant, index) => {
    checkText(variant, label + '[' + index + ']', DIALOGUE_TEXT_LIMITS.text, fields, issues);
  });
  if (new Set([text, ...value]).size !== value.length + 1) {
    issues.push(label + ' enthält doppelte Texte.');
  }
}

function checkChoices(value: unknown, label: string, fields: unknown, issues: string[]): void {
  if (!limitedArray(value, 0, DIALOGUE_MAX_CHOICES)) {
    issues.push(label + ' darf höchstens ' + DIALOGUE_MAX_CHOICES + ' Entscheidungen enthalten.');
    return;
  }
  const ids: string[] = [];
  value.forEach((choice, index) => {
    const prefix = label + '[' + index + ']';
    if (!isRecord(choice)) {
      issues.push(prefix + ' muss ein Objekt sein.');
      return;
    }
    checkFields(choice, CHOICE_FIELDS, prefix, issues);
    if (isId(choice.id)) ids.push(choice.id);
    else checkId(choice.id, prefix + '.id', issues);
    checkText(choice.label, prefix + '.label', DIALOGUE_TEXT_LIMITS.label, fields, issues);
    checkIds(choice.conditionIds, prefix + '.conditionIds', 0, issues);
    checkIds(choice.effectIds, prefix + '.effectIds', 0, issues);
    checkIds(choice.startMissionIds, prefix + '.startMissionIds', 0, issues);
    checkRelationships(choice.relationshipChanges, prefix + '.relationshipChanges', issues);

    if (choice.nextNodeId !== null) checkId(choice.nextNodeId, prefix + '.nextNodeId', issues);
    if (typeof choice.deceptive !== 'boolean') issues.push(prefix + '.deceptive muss boolesch sein.');

    if (
      choice.deceptive === false &&
      Array.isArray(choice.effectIds) && choice.effectIds.length === 0 &&
      Array.isArray(choice.relationshipChanges) && choice.relationshipChanges.length === 0 &&
      Array.isArray(choice.startMissionIds) && choice.startMissionIds.length === 0
    ) {
      issues.push(prefix + ' benötigt eine nachvollziehbare Folge oder deceptive=true.');
    }
  });
  if (new Set(ids).size !== ids.length) issues.push(label + ' enthält doppelte Entscheidungs-IDs.');
}

function checkRelationships(value: unknown, label: string, issues: string[]): void {
  if (!limitedArray(value, 0, DIALOGUE_MAX_RELATIONSHIPS)) {
    issues.push(label + ' darf höchstens ' + DIALOGUE_MAX_RELATIONSHIPS + ' Beziehungen enthalten.');
    return;
  }
  const ids: string[] = [];
  value.forEach((item, index) => {
    const prefix = label + '[' + index + ']';
    if (!isRecord(item)) {
      issues.push(prefix + ' muss ein Objekt sein.');
      return;
    }
    checkFields(item, RELATIONSHIP_FIELDS, prefix, issues);
    if (isId(item.characterId)) ids.push(item.characterId);
    else checkId(item.characterId, prefix + '.characterId', issues);
    for (const field of ['trustDelta', 'loyaltyDelta'] as const) {
      if (!isIntegerInRange(item[field], -100, 100)) {
        issues.push(prefix + '.' + field + ' muss eine ganze Zahl von -100 bis 100 sein.');
      }
    }
    if (item.trustDelta === 0 && item.loyaltyDelta === 0) {
      issues.push(prefix + ' darf keine wirkungslose Beziehungsänderung sein.');
    }
  });
  if (new Set(ids).size !== ids.length) issues.push(label + ' enthält doppelte Figuren-IDs.');
}

/** Prüft die lokale Verzweigung: alle Knoten erreichbar, von jedem ist ein Ende erreichbar. */
function checkGraph(dialogue: DialogueDefinition, issues: string[]): void {
  const byId = new Map(dialogue.nodes.map((node) => [node.id, node]));
  if (!byId.has(dialogue.startNodeId)) {
    issues.push('startNodeId verweist auf keinen Dialogknoten.');
    return;
  }
  for (const node of dialogue.nodes) {
    for (const choice of node.choices) {
      if (choice.nextNodeId !== null && !byId.has(choice.nextNodeId)) {
        issues.push('Entscheidung ' + choice.id + ' verweist auf unbekannten Knoten ' + choice.nextNodeId + '.');
      }
    }
  }
  if (issues.length > 0) return;

  const reachable = new Set<string>();
  const queue = [dialogue.startNodeId];
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    if (id === undefined || reachable.has(id)) continue;
    reachable.add(id);
    for (const choice of byId.get(id)?.choices ?? []) {
      if (choice.nextNodeId !== null) queue.push(choice.nextNodeId);
    }
  }
  for (const id of byId.keys()) {
    if (!reachable.has(id)) issues.push('Knoten ' + id + ' ist vom Start nicht erreichbar.');
  }

  const canFinish = new Set(
    dialogue.nodes
      .filter((node) => node.choices.length === 0 || node.choices.some((choice) => choice.nextNodeId === null))
      .map((node) => node.id),
  );
  const remaining = [...canFinish];
  for (let i = 0; i < remaining.length; i++) {
    const destination = remaining[i];
    for (const node of dialogue.nodes) {
      if (!canFinish.has(node.id) && node.choices.some((choice) => choice.nextNodeId === destination)) {
        canFinish.add(node.id);
        remaining.push(node.id);
      }
    }
  }
  for (const id of byId.keys()) {
    if (!canFinish.has(id)) issues.push('Knoten ' + id + ' hat keinen Weg zu einem Gesprächsende.');
  }
}
