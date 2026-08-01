import type { CodeCard, Conversation, RoomProject } from '../types/domain';

export type EmberContentKind = 'conversation' | 'room-card' | 'workspace';

export interface EmberContentIndexEntry {
  indexId: string;
  targetId: string;
  kind: EmberContentKind;
  title: string;
  aliases: string[];
  ownerCollaboratorId: string | null;
  updatedAt: number;
}

export interface EmberContentIndex {
  version: 1;
  builtAt: number;
  entries: EmberContentIndexEntry[];
}

export type EmberNavigationResolution =
  | { status: 'resolved'; entry: EmberContentIndexEntry }
  | { status: 'ambiguous'; candidates: EmberContentIndexEntry[] }
  | { status: 'not-found'; query: string }
  | { status: 'blocked'; reason: 'collaborator-scope' };

function normalizedText(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/[\s\p{P}\p{S}]+/gu, '');
}

function uniqueAliases(values: readonly string[], title: string) {
  const titleKey = normalizedText(title);
  const seen = new Set<string>();
  return values.flatMap((value) => {
    const trimmed = value.trim();
    const key = normalizedText(trimmed);
    if (!key || key === titleKey || seen.has(key)) return [];
    seen.add(key);
    return [trimmed];
  });
}

export function buildEmberContentIndex(args: {
  conversations?: readonly Conversation[];
  cards?: readonly CodeCard[];
  projects?: readonly RoomProject[];
  builtAt?: number;
}): EmberContentIndex {
  const conversations = (args.conversations ?? []).map((conversation) => ({
    indexId: `conversation:${conversation.id}`,
    targetId: conversation.id,
    kind: 'conversation' as const,
    title: conversation.title.trim() || '未命名对话',
    aliases: [],
    ownerCollaboratorId: conversation.collaboratorId,
    updatedAt: conversation.updatedAt
  }));
  const cards = (args.cards ?? [])
    .filter((card) => (card.kind ?? 'card') === 'card')
    .map((card) => ({
      indexId: `room-card:${card.id}`,
      targetId: card.id,
      kind: 'room-card' as const,
      title: card.title.trim() || '未命名房间卡',
      aliases: uniqueAliases(card.tags, card.title),
      ownerCollaboratorId: card.ownerCollaboratorId ?? null,
      updatedAt: card.updatedAt
    }));
  const projects = (args.projects ?? []).map((project) => ({
    indexId: `workspace:${project.id}`,
    targetId: project.id,
    kind: 'workspace' as const,
    title: project.title.trim() || '未命名工作区',
    aliases: uniqueAliases([project.slug, ...project.tags], project.title),
    ownerCollaboratorId: project.ownerCollaboratorId ?? null,
    updatedAt: project.updatedAt
  }));

  return {
    version: 1,
    builtAt: args.builtAt ?? Date.now(),
    entries: [...conversations, ...cards, ...projects].sort((left, right) => (
      right.updatedAt - left.updatedAt || left.indexId.localeCompare(right.indexId)
    ))
  };
}

function isEntryVisible(entry: EmberContentIndexEntry, collaboratorId: string | null | undefined) {
  return !entry.ownerCollaboratorId || entry.ownerCollaboratorId === collaboratorId;
}

function matchScore(entry: EmberContentIndexEntry, query: string) {
  const normalizedQuery = normalizedText(query);
  if (!normalizedQuery) return 0;
  const title = normalizedText(entry.title);
  if (title === normalizedQuery) return 100;
  if (entry.aliases.some((alias) => normalizedText(alias) === normalizedQuery)) return 92;
  if (title.includes(normalizedQuery) || normalizedQuery.includes(title)) return 72;
  if (entry.aliases.some((alias) => normalizedText(alias).includes(normalizedQuery))) return 64;
  return 0;
}

const RECENT_REFERENCE = /(?:上次|刚才|刚刚|最近|之前|那个|那本|那部)/;

export function resolveEmberContentNavigation(args: {
  index: EmberContentIndex;
  query: string;
  kind?: EmberContentKind;
  collaboratorId?: string | null;
  recentIndexIds?: readonly string[];
}): EmberNavigationResolution {
  const inKind = args.index.entries.filter((entry) => !args.kind || entry.kind === args.kind);
  const visible = inKind.filter((entry) => isEntryVisible(entry, args.collaboratorId));

  if (RECENT_REFERENCE.test(args.query)) {
    const recent = (args.recentIndexIds ?? [])
      .map((indexId) => visible.find((entry) => entry.indexId === indexId))
      .filter((entry): entry is EmberContentIndexEntry => Boolean(entry));
    if (recent.length === 1) return { status: 'resolved', entry: recent[0] };
    if (recent.length > 1) return { status: 'ambiguous', candidates: recent.slice(0, 3) };
  }

  const ranked = visible
    .map((entry) => ({ entry, score: matchScore(entry, args.query) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || right.entry.updatedAt - left.entry.updatedAt);
  if (ranked.length === 0) {
    const hiddenMatch = inKind.some((entry) => matchScore(entry, args.query) > 0);
    return hiddenMatch
      ? { status: 'blocked', reason: 'collaborator-scope' }
      : { status: 'not-found', query: args.query };
  }

  const topScore = ranked[0].score;
  const tied = ranked.filter((candidate) => candidate.score === topScore).map((candidate) => candidate.entry);
  if (tied.length > 1) return { status: 'ambiguous', candidates: tied.slice(0, 3) };
  return { status: 'resolved', entry: ranked[0].entry };
}

export function validateEmberNavigationTarget(args: {
  currentIndex: EmberContentIndex;
  resolvedEntry: EmberContentIndexEntry;
  collaboratorId?: string | null;
}) {
  const current = args.currentIndex.entries.find((entry) => entry.indexId === args.resolvedEntry.indexId);
  if (!current || current.targetId !== args.resolvedEntry.targetId || current.kind !== args.resolvedEntry.kind) {
    return { ok: false as const, reason: 'missing-or-changed' as const };
  }
  if (!isEntryVisible(current, args.collaboratorId)) {
    return { ok: false as const, reason: 'collaborator-scope' as const };
  }
  return { ok: true as const, entry: current };
}
