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

  tags.forEach((tag) => {
    const parentId = tag.fields.parent?.sys.id;
    if (!parentId) return;

    const siblings = childrenOf.get(parentId) ?? [];
    siblings.push(tag);
    childrenOf.set(parentId, siblings);
  });

  return { byId, childrenOf };
}

export function getSelfAndDescendantIds(tagId: string, tree: TagTree): Set<string> {
  const ids = new Set<string>([tagId]);
  const children = tree.childrenOf.get(tagId) ?? [];

  children.forEach((child) => {
    getSelfAndDescendantIds(child.sys.id, tree).forEach((id) => ids.add(id));
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

// Computes the actual set of tag ids to match an entry against, given a
// flat list of selected tag ids from one filter slot. This is where
// parent/child refinement happens:
//
// - A selected tag with NO selected children contributes its own full
//   self+descendant expansion (checking "Skin Concerns" alone still
//   matches any entry tagged with any of its subcategories).
// - A selected tag that DOES have a selected child is "suppressed" —
//   its own broad expansion is dropped, and only the selected child/
//   children's own expansions count. This is what makes checking a
//   subcategory actually narrow the results, rather than being a no-op
//   alongside the parent's already-broader match.
// - Multiple selected children under the same parent still OR together
//   (checking two subcategories broadens within that narrowed scope).
export function computeEffectiveTagMatchIds(
  selectedTagIds: string[],
  tree: TagTree
): Set<string> {
  const selectedSet = new Set(selectedTagIds);
  const suppressedParents = new Set<string>();

  selectedTagIds.forEach((id) => {
    const parentId = tree.byId.get(id)?.fields.parent?.sys.id;
    if (parentId && selectedSet.has(parentId)) {
      suppressedParents.add(parentId);
    }
  });

  const result = new Set<string>();
  selectedTagIds.forEach((id) => {
    if (suppressedParents.has(id)) return; // this parent's own broad match is overridden
    getSelfAndDescendantIds(id, tree).forEach((d) => result.add(d));
  });

  return result;
}

// Checks whether an entry's own tags satisfy a set of selected tag ids
// from one filter slot, applying the parent/child refinement above.
export function entryMatchesTagSelection(
  entryTags: TagEntry[],
  selectedTagIds: string[],
  tree: TagTree
): boolean {
  if (selectedTagIds.length === 0) return true;

  const effectiveIds = computeEffectiveTagMatchIds(selectedTagIds, tree);
  const entryTagIds = new Set(entryTags.map((t) => t.sys.id));

  return [...effectiveIds].some((id) => entryTagIds.has(id));
}