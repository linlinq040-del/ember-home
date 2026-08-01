import { describe, expect, it } from 'vitest';
import { createPersonaTemplate } from '../config/persona/personaBuilder';
import {
  resolveEmberChatEntryContext,
  resolveEmberConversationId,
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
  it('keeps the one collaborator explicitly bound to Ember Home', () => {
    const personas = [createPersona('home-ember', '我的 Ember'), createPersona('other', '其他角色')];

    expect(resolveEmberIdentityRoute({
      personas,
      homeCollaboratorId: 'home-ember'
    })).toEqual({
      collaboratorId: 'home-ember',
      displayName: 'Ember',
      source: 'home'
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

  it('does not turn an unrelated active persona into Ember', () => {
    const personas = [createPersona('other', '其他角色')];

    expect(resolveEmberIdentityRoute({ personas })).toEqual({
      collaboratorId: null,
      displayName: 'Ember',
      source: 'none'
    });
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
  it('uses only the home Ember identity and enables its chat memory', () => {
    const personas = [createPersona('ember', 'Ember'), createPersona('other', '其他角色')];

    expect(resolveEmberChatEntryContext({
      personas
    })).toEqual({
      identity: {
        collaboratorId: 'ember',
        displayName: 'Ember',
        source: 'ember'
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
    const result = resolveEmberChatEntryContext({ personas });

    expect(result.identity).toMatchObject({ collaboratorId: 'ember', source: 'ember' });
    expect(result.memory.includeCrossConversationRecall).toBe(false);
    expect(JSON.stringify(personas)).toBe(before);
  });
});

describe('resolveEmberConversationId', () => {
  const conversations = [
    { id: 'other-chat', collaboratorId: 'other' },
    { id: 'ember-chat', collaboratorId: 'ember' }
  ];

  it('never treats another collaborator conversation as the home chat', () => {
    expect(resolveEmberConversationId({
      conversations,
      activeConversationId: 'other-chat',
      emberCollaboratorId: 'ember'
    })).toBe('ember-chat');
  });

  it('keeps the current conversation when it already belongs to Ember', () => {
    expect(resolveEmberConversationId({
      conversations,
      activeConversationId: 'ember-chat',
      emberCollaboratorId: 'ember'
    })).toBe('ember-chat');
  });

  it('requests a fresh home chat when Ember has no conversation yet', () => {
    expect(resolveEmberConversationId({
      conversations,
      activeConversationId: 'other-chat',
      emberCollaboratorId: 'new-ember'
    })).toBeNull();
  });
});
