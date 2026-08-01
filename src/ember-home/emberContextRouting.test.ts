import { describe, expect, it } from 'vitest';
import { createPersonaTemplate } from '../config/persona/personaBuilder';
import {
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
