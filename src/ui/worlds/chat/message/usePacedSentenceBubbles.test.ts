import { describe, expect, it } from 'vitest';
import { MIN_SENTENCE_BUBBLE_INTERVAL_MS, sentenceBubbleRevealDelay } from './usePacedSentenceBubbles';

describe('sentenceBubbleRevealDelay', () => {
  it('reveals the first complete sentence immediately', () => {
    expect(sentenceBubbleRevealDelay(0, 0)).toBe(0);
  });

  it('paces an API burst', () => {
    expect(sentenceBubbleRevealDelay(1, 60)).toBe(MIN_SENTENCE_BUBBLE_INTERVAL_MS - 60);
  });

  it('does not add delay when the API was already slower', () => {
    expect(sentenceBubbleRevealDelay(1, MIN_SENTENCE_BUBBLE_INTERVAL_MS + 400)).toBe(0);
  });
});
