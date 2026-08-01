import { describe, expect, it } from 'vitest';
import type { CodeCard, Conversation, RoomProject } from '../types/domain';
import {
  buildEmberContentIndex,
  resolveEmberContentNavigation,
  validateEmberNavigationTarget
} from './contentIndex';

function conversation(id: string, title: string, collaboratorId = 'ember'): Conversation {
  return { id, title, collaboratorId, messages: [{ id: 'secret', role: 'user', content: '私人正文', timestamp: 1 }], pinnedAt: null, updatedAt: 10 };
}

function card(id: string, title: string, ownerCollaboratorId = 'ember'): CodeCard {
  return { id, title, language: 'markdown', code: '不应进入索引的卡片正文', tags: ['睡前读物'], ownerCollaboratorId, source: 'manual', createdAt: 1, updatedAt: 20 };
}

function project(id: string, title: string): RoomProject {
  return { id, title, slug: 'little-prince', fileIds: [], tags: ['小王子'], source: 'manual', createdAt: 1, updatedAt: 30 };
}

describe('Ember ContentIndex', () => {
  it('indexes stable metadata without copying private bodies', () => {
    const index = buildEmberContentIndex({
      conversations: [conversation('chat-1', '睡前聊天')],
      cards: [card('card-1', '小王子摘录')],
      projects: [project('project-1', '小王子共读')],
      builtAt: 100
    });
    expect(index.entries.map((entry) => entry.indexId)).toEqual([
      'workspace:project-1',
      'room-card:card-1',
      'conversation:chat-1'
    ]);
    expect(JSON.stringify(index)).not.toContain('私人正文');
    expect(JSON.stringify(index)).not.toContain('不应进入索引的卡片正文');
  });

  it('resolves an exact local title and validates the stable target again', () => {
    const index = buildEmberContentIndex({ cards: [card('card-1', '小王子摘录')] });
    const resolution = resolveEmberContentNavigation({ index, query: '小王子摘录', kind: 'room-card', collaboratorId: 'ember' });
    expect(resolution.status).toBe('resolved');
    if (resolution.status !== 'resolved') return;
    expect(validateEmberNavigationTarget({ currentIndex: index, resolvedEntry: resolution.entry, collaboratorId: 'ember' })).toEqual({
      ok: true,
      entry: resolution.entry
    });
  });

  it('requires clarification when more than one title matches equally', () => {
    const index = buildEmberContentIndex({ cards: [card('a', '夜航'), card('b', '夜航')] });
    const resolution = resolveEmberContentNavigation({ index, query: '夜航', collaboratorId: 'ember' });
    expect(resolution.status).toBe('ambiguous');
  });

  it('uses a unique recent reference but does not guess between two recent items', () => {
    const index = buildEmberContentIndex({ projects: [project('a', '小王子'), project('b', '海边的卡夫卡')] });
    expect(resolveEmberContentNavigation({ index, query: '上次那本书', recentIndexIds: ['workspace:a'] }).status).toBe('resolved');
    expect(resolveEmberContentNavigation({ index, query: '上次那本书', recentIndexIds: ['workspace:a', 'workspace:b'] }).status).toBe('ambiguous');
  });

  it('blocks cross-collaborator targets and removed targets', () => {
    const index = buildEmberContentIndex({ cards: [card('private', '只有他能看的房间', 'other')] });
    expect(resolveEmberContentNavigation({ index, query: '只有他能看的房间', collaboratorId: 'ember' })).toEqual({
      status: 'blocked',
      reason: 'collaborator-scope'
    });
    const visibleIndex = buildEmberContentIndex({ cards: [card('visible', '共同房间')] });
    const resolved = resolveEmberContentNavigation({ index: visibleIndex, query: '共同房间', collaboratorId: 'ember' });
    if (resolved.status !== 'resolved') throw new Error('expected resolved entry');
    expect(validateEmberNavigationTarget({
      currentIndex: buildEmberContentIndex({}),
      resolvedEntry: resolved.entry,
      collaboratorId: 'ember'
    })).toEqual({ ok: false, reason: 'missing-or-changed' });
  });
});
