import type { TagEntry } from '../types/contentful';

export interface TagTree {
  byId: Map<string, TagEntry>;
  childrenOf: Map<string, TagEntry[]>;
}

export function buildTagTree(tags: TagEntry[]): TagTree {
  const byId = new Map<string, TagEntry>();
  const childrenOf = new Map<string, TagEntry[]>();

  tags.forEach((tag) => {
    byId.set(tag.sys.id, tag);
  });

  // A tag can belong to multiple parents (e.g. "Redeemable" under both
  // "Facials & Treatments" and "Makeup") — register it as a child under
  // EACH of its parents.
  tags.forEach((tag) => {
    const parentIds = (tag.fields.parents ?? []).map((p) => p.sys.id);
    parentIds.forEach((parentId) => {
      const siblings = childrenOf.get(parentId) ?? [];
      siblings.push(tag);
      childrenOf.set(parentId, siblings);
    });
  });

  return { byId, childrenOf };
}

function isMultiParentTag(tag: TagEntry): boolean {
  return (tag.fields.parents?.length ?? 0) > 1;
}

// Used purely for UI purposes (e.g. revealing every child when a parent
// is expanded) — includes shared tags regardless of how many parents
// they have.
export function getSelfAndDescendantIds(tagId: string, tree: TagTree): Set<string> {
  const ids = new Set<string>([tagId]);
  const children = tree.childrenOf.get(tagId) ?? [];

  children.forEach((child) => {
    getSelfAndDescendantIds(child.sys.id, tree).forEach((id) => ids.add(id));
  });

  return ids;
}

// Used for actual entry MATCHING. Deliberately excludes any child shared
// across multiple parents — checking one parent alone should never
// silently pull in a subcategory it shares with a different parent. A
// shared tag only ever counts once it's explicitly selected in a
// specific parent's own context (see the scoped-key handling below).
function getExclusiveSelfAndDescendantIds(tagId: string, tree: TagTree): Set<string> {
  const ids = new Set<string>([tagId]);
  const children = tree.childrenOf.get(tagId) ?? [];

  children.forEach((child) => {
    if (isMultiParentTag(child)) return;
    getExclusiveSelfAndDescendantIds(child.sys.id, tree).forEach((id) => ids.add(id));
  });

  return ids;
}

export function getRevealedChildTags(
  selectedTagIds: string[],
  tree: TagTree
): TagEntry[] {
  const revealed: TagEntry[] = [];

  selectedTagIds.forEach((id) => {
    const children = tree.childrenOf.get(id) ?? [];
    revealed.push(...children);
  });

  return revealed;
}

// A shared (multi-parent) tag's selection is "scoped" to whichever
// parent it was checked under — formatted as "<parentId>::<childId>" —
// so the SAME shared tag can be independently selected under each of
// its parents, rather than one checkbox state applying everywhere it's
// nested. A single-parent tag keeps using its own plain id, unaffected.
const SCOPE_SEPARATOR = '::';

export function isScopedSelectionKey(key: string): boolean {
  return key.includes(SCOPE_SEPARATOR);
}

function parseScopedSelectionKey(key: string): { parentId: string; childId: string } | null {
  const idx = key.indexOf(SCOPE_SEPARATOR);
  if (idx === -1) return null;
  return { parentId: key.slice(0, idx), childId: key.slice(idx + SCOPE_SEPARATOR.length) };
}

// The correct selection key for a given child under a given parent —
// scoped if the child has multiple parents, its own plain id otherwise.
export function getChildSelectionKey(parentId: string, child: TagEntry): string {
  return isMultiParentTag(child) ? `${parentId}${SCOPE_SEPARATOR}${child.sys.id}` : child.sys.id;
}

export function entryMatchesTagSelection(
  entryTags: TagEntry[],
  selectedTagIds: string[],
  tree: TagTree
): boolean {
  if (selectedTagIds.length === 0) return true;

  const entryTagIds = new Set(entryTags.map((t) => t.sys.id));

  const plainIds: string[] = [];
  const scoped: { parentId: string; childId: string }[] = [];
  selectedTagIds.forEach((id) => {
    const parsed = parseScopedSelectionKey(id);
    if (parsed) scoped.push(parsed);
    else plainIds.push(id);
  });

  const selectedPlainSet = new Set(plainIds);
  const suppressedParents = new Set<string>();

  // A plain child whose one parent is also plain-selected suppresses
  // that parent's own broad match (unchanged single-parent behavior).
  plainIds.forEach((id) => {
    const parents = tree.byId.get(id)?.fields.parents ?? [];
    if (parents.length === 1 && selectedPlainSet.has(parents[0].sys.id)) {
      suppressedParents.add(parents[0].sys.id);
    }
  });
  // Any scoped selection always suppresses that parent's own broad
  // match too — selecting "Redeemable under Facials & Treatments"
  // narrows F&T down to just that, exactly like the single-parent case.
  scoped.forEach(({ parentId }) => suppressedParents.add(parentId));

  const plainMatch = plainIds.some((id) => {
    if (suppressedParents.has(id)) return false;
    const expanded = getExclusiveSelfAndDescendantIds(id, tree);
    return [...expanded].some((eid) => entryTagIds.has(eid));
  });
  if (plainMatch) return true;

  // A scoped selection matches only if the entry carries the child tag
  // AND falls within the parent's own exclusive scope (its own direct
  // tag, or an exclusive single-parent descendant of it) — this is the
  // "top level is boss" rule: an entry only counts as belonging to a
  // parent's shared subcategory if it's genuinely associated with that
  // specific parent too, not just the subcategory alone.
  return scoped.some(({ parentId, childId }) => {
    const childExpanded = getExclusiveSelfAndDescendantIds(childId, tree);
    const hasChild = [...childExpanded].some((eid) => entryTagIds.has(eid));
    if (!hasChild) return false;

    const parentExpanded = getExclusiveSelfAndDescendantIds(parentId, tree);
    return [...parentExpanded].some((eid) => entryTagIds.has(eid));
  });
}