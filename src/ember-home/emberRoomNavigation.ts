import {
  resolveEmberContentNavigation,
  validateEmberNavigationTarget,
  type EmberContentIndex,
  type EmberContentIndexEntry
} from './contentIndex';
import type { EmberPreviewRoomId } from './EmberRoomPreview';

const BUILT_AT = 1;

export const EMBER_ROOM_NAVIGATION_READING_PAUSE_MS = 1400;

const roomEntries: EmberContentIndexEntry[] = [
  {
    indexId: 'room:study',
    targetId: 'study',
    kind: 'room',
    title: '书房',
    aliases: ['阅读室', '共读室'],
    ownerCollaboratorId: null,
    updatedAt: BUILT_AT
  },
  {
    indexId: 'room:cinema',
    targetId: 'cinema',
    kind: 'room',
    title: '观影厅',
    aliases: ['影院', '电影院', '放映厅'],
    ownerCollaboratorId: null,
    updatedAt: BUILT_AT
  }
];

export const EMBER_HOME_ROOM_INDEX: EmberContentIndex = {
  version: 1,
  builtAt: BUILT_AT,
  entries: roomEntries
};

const NAVIGATION_CUE = /(?:带(?:我|我们)|陪(?:我|我们)|我们|咱们|我要|我想|想要|现在|直接)?\s*(?:去|进|进入|打开|前往|回到|带到)/;
const HISTORICAL_CUE = /(?:上次|刚才|刚刚|之前|以前|曾经).{0,10}(?:去|进|进入|打开|前往|回到)/;
const NEGATED_CUE = /(?:不想|不要|别|不用|先不).{0,6}(?:去|进|进入|打开|前往|回到)/;

export function resolveEmberRoomIntent(content: string): EmberContentIndexEntry | null {
  const query = content.trim();
  if (!query || !NAVIGATION_CUE.test(query) || HISTORICAL_CUE.test(query) || NEGATED_CUE.test(query)) return null;

  const matches = roomEntries.filter((entry) => (
    query.includes(entry.title) || entry.aliases.some((alias) => query.includes(alias))
  ));
  if (matches.length !== 1) return null;

  const resolution = resolveEmberContentNavigation({
    index: EMBER_HOME_ROOM_INDEX,
    query: matches[0].title,
    kind: 'room'
  });
  return resolution.status === 'resolved' ? resolution.entry : null;
}

export function validateEmberRoomTarget(entry: EmberContentIndexEntry): EmberPreviewRoomId | null {
  const validation = validateEmberNavigationTarget({
    currentIndex: EMBER_HOME_ROOM_INDEX,
    resolvedEntry: entry
  });
  if (!validation.ok) return null;
  return validation.entry.targetId === 'study' || validation.entry.targetId === 'cinema'
    ? validation.entry.targetId
    : null;
}
