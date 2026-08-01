import { describe, expect, it } from 'vitest';
import { createPersonaTemplate } from '../config/persona/personaBuilder';
import {
  resolveEmberChatEntryContext,
  resolveEmberIdentityRoute,
  resolveEmberMemoryRoute
} from './emberContextRouting';

const createPersona = (
  id: string,
  name: string,
  crossConversationRecallEnabled = true
) => createPersonaTemplate({
  id,
  name,
  description: '',
  memory: { crossConversationRecallEnabled }
});

describe('resolveEmberIdentityRoute', () => {
  it('preserves the collaborator already attached to an open conversation', () => {
    const personas = [createPersona('ember', 'Ember'), createPersona('test', '测试')];

    expect(resolveEmberIdentityRoute({
      personas,
      conversationCollaboratorId: 'test',
      activeCollaboratorId: 'ember'
    })).toEqual({
      collaboratorId: 'test',
      displayName: 'Ember',
      source: 'conversation'
    });
  });

  it('prefers an explicit Ember persona for room-level identity', () => {
    const personas = [createPersona('pharos', 'Pharos'), createPersona('ember', 'EMBER')];

    expect(resolveEmberIdentityRoute({ personas }).source).toBe('ember');
  });

  it('uses the legacy default without mutating persisted persona data', () => {
    const personas = [createPersona('pharos', 'Pharos')];
    const before = JSON.stringify(personas);

    expect(resolveEmberIdentityRoute({ personas })).toMatchObject({
      collaboratorId: 'pharos',
      source: 'legacy-default'
    });
    expect(JSON.stringify(personas)).toBe(before);
  });
});

describe('resolveEmberMemoryRoute', () => {
  it('uses existing chat memory only inside chat', () => {
    const persona = createPersona('ember', 'Ember');

    expect(resolveEmberMemoryRoute({ scene: 'chat', persona })).toEqual({
      includeCurrentConversation: true,
      includeCrossConversationRecall: true,
      ombreBrain: 'skip'
    });
    expect(resolveEmberMemoryRoute({ scene: 'living-room', persona })).toEqual({
      includeCurrentConversation: false,
      includeCrossConversationRecall: false,
      ombreBrain: 'skip'
    });
  });

  it('queries OmbreBrain only when it is both requested and available', () => {
    expect(resolveEmberMemoryRoute({
      scene: 'chat',
      longTermMemoryRequested: true,
      ombreBrainAvailable: false
    }).ombreBrain).toBe('skip');

    expect(resolveEmberMemoryRoute({
      scene: 'chat',
      longTermMemoryRequested: true,
      ombreBrainAvailable: true
    }).ombreBrain).toBe('query');
  });
});

describe('resolveEmberChatEntryContext', () => {
  it('keeps an existing conversation collaborator and enables its chat memory', () => {
    const personas = [createPersona('ember', 'Ember'), createPersona('existing', '测试')];

    expect(resolveEmberChatEntryContext({
      personas,
      conversationCollaboratorId: 'existing',
      activeCollaboratorId: 'ember'
    })).toEqual({
      identity: {
        collaboratorId: 'existing',
        displayName: 'Ember',
        source: 'conversation'
      },
      memory: {
        includeCurrentConversation: true,
        includeCrossConversationRecall: true,
        ombreBrain: 'skip'
      }
    });
  });

  it('selects an existing Ember persona without creating or renaming data', () => {
    const personas = [createPersona('legacy', '旧角色'), createPersona('ember', 'EMBER', false)];
    const before = JSON.stringify(personas);
    const result = resolveEmberChatEntryContext({ personas, activeCollaboratorId: 'legacy' });

    expect(result.identity).toMatchObject({ collaboratorId: 'ember', source: 'ember' });
    expect(result.memory.includeCrossConversationRecall).toBe(false);
    expect(JSON.stringify(personas)).toBe(before);
  });
});
