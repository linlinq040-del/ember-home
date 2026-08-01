import { describe, expect, it } from 'vitest';
import type { EmberMemorySourceDescriptor } from '../types/domain';
import {
  createConversationMemorySourceDescriptor,
  defaultMemoryRetrievalPolicyForDomain,
  isMemorySourceEligibleForRecall,
  memorySourceFingerprint
} from './memorySourcePolicy';

function source(
  domain: EmberMemorySourceDescriptor['domain'],
  retrievalPolicy = defaultMemoryRetrievalPolicyForDomain(domain)
): EmberMemorySourceDescriptor {
  return {
    domain,
    roomId: null,
    sourceRecordId: `${domain}-1`,
    sourceFragmentIds: ['part-1'],
    collaboratorId: 'ember',
    access: domain === 'public-creation' ? 'public' : 'private-home',
    retrievalPolicy
  };
}

describe('Ember Home memory source policy', () => {
  it('allows private conversations from future rooms into general recall', () => {
    const descriptor = createConversationMemorySourceDescriptor({
      conversationId: 'study-chat',
      collaboratorId: 'ember',
      sourceMessageIds: ['m1'],
      memoryContext: {
        roomId: 'study',
        contentRef: { kind: 'book', id: 'book-1' }
      }
    });

    expect(descriptor).toMatchObject({
      roomId: 'study',
      retrievalPolicy: 'general',
      contentRef: { kind: 'book', id: 'book-1' }
    });
    expect(isMemorySourceEligibleForRecall(descriptor, 'ambient')).toBe(true);
  });

  it('keeps journals out of ambient recall but allows an explicit private lookup', () => {
    expect(isMemorySourceEligibleForRecall(source('journal'), 'ambient')).toBe(false);
    expect(isMemorySourceEligibleForRecall(source('journal'), 'explicit')).toBe(true);
    expect(isMemorySourceEligibleForRecall(source('journal', 'general'), 'ambient')).toBe(false);
  });

  it('blocks health, cycle, and public creation sources from general memory', () => {
    for (const domain of ['health', 'cycle', 'public-creation'] as const) {
      expect(isMemorySourceEligibleForRecall(source(domain), 'ambient')).toBe(false);
      expect(isMemorySourceEligibleForRecall(source(domain), 'explicit')).toBe(false);
      expect(isMemorySourceEligibleForRecall(source(domain, 'general'), 'explicit')).toBe(false);
    }
  });

  it('deduplicates the same source regardless of fragment order', () => {
    const left = { ...source('conversation'), sourceFragmentIds: ['b', 'a', 'a'] };
    const right = { ...source('conversation'), sourceFragmentIds: ['a', 'b'] };
    expect(memorySourceFingerprint(left)).toBe(memorySourceFingerprint(right));
  });
});
