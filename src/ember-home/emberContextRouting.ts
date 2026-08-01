import type { Persona } from '../types/domain/persona';

export type EmberHomeScene = 'living-room' | 'chat' | 'music' | 'study';

export type EmberIdentitySource =
  | 'conversation'
  | 'ember'
  | 'legacy-default'
  | 'active'
  | 'first'
  | 'none';

export interface EmberIdentityRoute {
  collaboratorId: string | null;
  displayName: 'Ember';
  source: EmberIdentitySource;
}

export interface ResolveEmberIdentityRouteInput {
  personas: readonly Persona[];
  conversationCollaboratorId?: string | null;
  activeCollaboratorId?: string | null;
}

export interface ResolveEmberMemoryRouteInput {
  scene: EmberHomeScene;
  persona?: Persona | null;
  longTermMemoryRequested?: boolean;
  ombreBrainAvailable?: boolean;
}

export interface EmberMemoryRoute {
  includeCurrentConversation: boolean;
  includeCrossConversationRecall: boolean;
  ombreBrain: 'skip' | 'query';
}

function findPersonaById(personas: readonly Persona[], id?: string | null) {
  if (!id) return null;
  return personas.find((persona) => persona.id === id) ?? null;
}

/**
 * Resolves Ember onto the existing collaborator model without rewriting or
 * renaming persisted personas. An open conversation always keeps its current
 * collaborator so existing chats remain intact.
 */
export function resolveEmberIdentityRoute({
  personas,
  conversationCollaboratorId,
  activeCollaboratorId
}: ResolveEmberIdentityRouteInput): EmberIdentityRoute {
  const conversationPersona = findPersonaById(personas, conversationCollaboratorId);
  if (conversationPersona) {
    return {
      collaboratorId: conversationPersona.id,
      displayName: 'Ember',
      source: 'conversation'
    };
  }

  const emberPersona = personas.find((persona) => persona.name.trim().toLowerCase() === 'ember');
  if (emberPersona) {
    return {
      collaboratorId: emberPersona.id,
      displayName: 'Ember',
      source: 'ember'
    };
  }

  const legacyDefault = findPersonaById(personas, 'pharos');
  if (legacyDefault) {
    return {
      collaboratorId: legacyDefault.id,
      displayName: 'Ember',
      source: 'legacy-default'
    };
  }

  const activePersona = findPersonaById(personas, activeCollaboratorId);
  if (activePersona) {
    return {
      collaboratorId: activePersona.id,
      displayName: 'Ember',
      source: 'active'
    };
  }

  return {
    collaboratorId: personas[0]?.id ?? null,
    displayName: 'Ember',
    source: personas.length > 0 ? 'first' : 'none'
  };
}

/**
 * Keeps room context deliberately small. Only chat receives chat memory, and
 * OmbreBrain remains an explicit, optional long-term lookup.
 */
export function resolveEmberMemoryRoute({
  scene,
  persona,
  longTermMemoryRequested = false,
  ombreBrainAvailable = false
}: ResolveEmberMemoryRouteInput): EmberMemoryRoute {
  const isChat = scene === 'chat';

  return {
    includeCurrentConversation: isChat,
    includeCrossConversationRecall:
      isChat && Boolean(persona?.memory.crossConversationRecallEnabled),
    ombreBrain: longTermMemoryRequested && ombreBrainAvailable ? 'query' : 'skip'
  };
}
