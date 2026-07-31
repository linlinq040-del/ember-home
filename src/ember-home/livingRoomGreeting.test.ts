import { describe, expect, it } from 'vitest';
import { getLivingRoomGreeting } from './livingRoomGreeting';

describe('getLivingRoomGreeting', () => {
  it.each([
    [5, '早上好'],
    [10, '早上好'],
    [11, '中午好'],
    [13, '中午好'],
    [14, '下午好'],
    [17, '下午好'],
    [18, '晚上好'],
    [0, '晚上好']
  ])('maps hour %i to %s', (hour, expected) => {
    expect(getLivingRoomGreeting(hour)).toBe(expected);
  });
});
