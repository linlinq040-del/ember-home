import { describe, expect, it } from 'vitest';
import { formatMessageTimestamp } from './messageTimestamp';

describe('formatMessageTimestamp', () => {
  it('formats a compact 24-hour chat time', () => {
    const timestamp = new Date(2026, 7, 2, 9, 7).getTime();
    expect(formatMessageTimestamp(timestamp)).toBe('09:07');
  });

  it('hides invalid legacy timestamps', () => {
    expect(formatMessageTimestamp(0)).toBe('');
    expect(formatMessageTimestamp(Number.NaN)).toBe('');
  });
});
