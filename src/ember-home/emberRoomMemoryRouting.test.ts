import { describe, expect, it } from 'vitest';
import type { ChatMessage, Conversation, EmberMemorySourceDescriptor } from '../types/domain';
import { buildConversationSemanticChunks, searchMemoryRetrievalChunks } from '../engines/memoryRetrievalIndex';

const messages: ChatMessage[] = [
  { id: 'u1', role: 'user', content: '我们读到这里时聊了时间并不是直线。', timestamp: 10 },
  { id: 'a1', role: 'assistant', content: '我记得你更喜欢把时间理解成回声。', timestamp: 11 }
];

function conversation(): Conversation {
  return {
    id: 'study-chat',
    title: '一起读时间简史',
    collaboratorId: 'ember',
    memoryContext: {
      roomId: 'study',
      contentRef: { kind: 'book', id: 'book-time' }
    },
    messages,
    pinnedAt: null,
    updatedAt: 11
  };
}

describe('Ember Home room memory routing', () => {
  it('keeps room and content provenance on ordinary conversation memories', () => {
    const chunks = buildConversationSemanticChunks({ conversations: [conversation()] });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.source).toMatchObject({
      domain: 'conversation',
      roomId: 'study',
      sourceRecordId: 'study-chat',
      sourceFragmentIds: ['u1', 'a1'],
      contentRef: { kind: 'book', id: 'book-time' },
      retrievalPolicy: 'general'
    });
  });

  it('can recall a study conversation through the shared semantic index', () => {
    const chunks = buildConversationSemanticChunks({ conversations: [conversation()] });
    const results = searchMemoryRetrievalChunks({ query: '时间 回声', chunks });
    expect(results[0]?.chunk.source?.roomId).toBe('study');
    expect(results[0]?.chunk.source?.contentRef?.id).toBe('book-time');
  });

  it('never includes journal content in ambient recall', () => {
    const source: EmberMemorySourceDescriptor = {
      domain: 'journal',
      roomId: null,
      sourceRecordId: 'journal-1',
      sourceFragmentIds: ['paragraph-1'],
      collaboratorId: 'ember',
      access: 'private-home',
      retrievalPolicy: 'explicit-only'
    };
    const chunk = {
      ...buildConversationSemanticChunks({ conversations: [conversation()] })[0]!,
      source
    };

    expect(searchMemoryRetrievalChunks({ query: '时间', chunks: [chunk] })).toEqual([]);
    expect(searchMemoryRetrievalChunks({ query: '时间', chunks: [chunk], purpose: 'explicit' }))
      .toHaveLength(1);
  });
});
