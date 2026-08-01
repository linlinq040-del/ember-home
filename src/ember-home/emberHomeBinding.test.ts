import { describe, expect, it } from 'vitest';
import { createPersonaTemplate } from '../config/persona/personaBuilder';
import {
  parseEmberHomeBinding,
  resolveInitialEmberHomeCollaboratorId
} from './emberHomeBinding';

const persona = (id: string, name: string) => createPersonaTemplate({
  id,
  name,
  description: ''
});

describe('Ember Home collaborator binding', () => {
  it('keeps a valid persisted binding instead of following another active collaborator', () => {
    expect(resolveInitialEmberHomeCollaboratorId({
      personas: [persona('test', '测试'), persona('other', '其他')],
      persistedCollaboratorId: 'test',
      activeCollaboratorId: 'other'
    })).toBe('test');
  });

  it('binds the active collaborator on first use when no named Ember exists', () => {
    expect(resolveInitialEmberHomeCollaboratorId({
      personas: [persona('test', '测试'), persona('pharos', '默认协作者')],
      activeCollaboratorId: 'test'
    })).toBe('test');
  });

  it('does not silently replace a deleted persisted Ember', () => {
    expect(resolveInitialEmberHomeCollaboratorId({
      personas: [persona('other', '其他')],
      persistedCollaboratorId: 'deleted',
      activeCollaboratorId: 'other'
    })).toBeNull();
  });

  it('rejects malformed persisted data', () => {
    expect(parseEmberHomeBinding({ version: 1, collaboratorId: '', mode: 'temporary', updatedAt: 1 }))
      .toBeNull();
    expect(parseEmberHomeBinding({ version: 1, collaboratorId: 'test', mode: 'temporary', updatedAt: 1 }))
      .toEqual({ version: 1, collaboratorId: 'test', mode: 'temporary', updatedAt: 1 });
  });
});
