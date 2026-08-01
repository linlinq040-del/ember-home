import { describe, expect, it } from 'vitest';
import {
  resolveEmberRoomIntent,
  validateEmberRoomTarget
} from './emberRoomNavigation';

describe('Ember Home room navigation', () => {
  it.each([
    ['带我去书房', 'study'],
    ['我们进阅读室吧', 'study'],
    ['打开观影厅', 'cinema'],
    ['陪我去电影院', 'cinema']
  ])('resolves explicit navigation: %s', (content, target) => {
    const entry = resolveEmberRoomIntent(content);
    expect(entry).not.toBeNull();
    expect(entry && validateEmberRoomTarget(entry)).toBe(target);
  });

  it.each([
    '书房是什么样子',
    '我们刚才聊到观影厅',
    '我们上次去书房的时候聊了什么',
    '我现在不想去观影厅',
    '打开书房还是观影厅都行',
    '去游戏厅'
  ])('does not guess from non-actionable or ambiguous text: %s', (content) => {
    expect(resolveEmberRoomIntent(content)).toBeNull();
  });
});
