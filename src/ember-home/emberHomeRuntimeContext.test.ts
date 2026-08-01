import { afterEach, describe, expect, it } from 'vitest';
import {
  readEmberHomePromptContext,
  setEmberHomeRuntimeScene
} from './emberHomeRuntimeContext';

describe('Ember Home runtime prompt context', () => {
  afterEach(() => setEmberHomeRuntimeScene(null));

  it('only exposes the small room directory while Ember Home is active', () => {
    expect(readEmberHomePromptContext()).toBeNull();
    setEmberHomeRuntimeScene('chat');
    expect(readEmberHomePromptContext()).toEqual(expect.objectContaining({
      scene: 'chat',
      rooms: expect.arrayContaining([
        expect.objectContaining({ id: 'study', title: '书房' }),
        expect.objectContaining({ id: 'cinema', title: '观影厅' })
      ])
    }));
  });
});
