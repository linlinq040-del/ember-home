import type { Persona } from '../types/domain/persona';

export type EmberHomeScene = 'living-room' | 'chat' | 'music' | 'study';

export type EmberIdentitySource =
  | 'home'
  | 'ember'
  | 'legacy-default'
  | 'none';

export interface EmberIdentityRoute {
  collaboratorId: string | null;
  displayName: 'Ember';
  source: EmberIdentitySource;
}

export interface ResolveEmberIdentityRouteInput {
  personas: readonly Persona[];
  homeCollaboratorId?: string | null;
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

export interface ResolveEmberChatEntryContextInput extends ResolveEmberIdentityRouteInput {
  longTermMemoryRequested?: boolean;
  ombreBrainAvailable?: boolean;
}

export interface EmberChatEntryContext {
  identity: EmberIdentityRoute;
  memory: EmberMemoryRoute;
}

export interface EmberConversationCandidate {
  id: string;
  collaboratorId: string | null;
}

function findPersonaById(personas: readonly Persona[], id?: string | null) {
  if (!id) return null;
  return personas.find((persona) => persona.id === id) ?? null;
}

/**
 * Resolves the one collaborator who lives in Ember Home. Conversation state
 * never chooses or replaces this identity; rooms and chats are only contexts
 * for the same Ember.
 */
export function resolveEmberIdentityRoute({
  personas,
  homeCollaboratorId
}: ResolveEmberIdentityRouteInput): EmberIdentityRoute {
  const homePersona = findPersonaById(personas, homeCollaboratorId);
  if (homePersona) {
    return {
      collaboratorId: homePersona.id,
      displayName: 'Ember',
      source: 'home'
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

  return {
    collaboratorId: null,
    displayName: 'Ember',
    source: 'none'
  };
}

export function resolveEmberConversationId({
  conversations,
  activeConversationId,
  emberCollaboratorId
}: {
  conversations: readonly EmberConversationCandidate[];
  activeConversationId?: string | null;
  emberCollaboratorId?: string | null;
}) {
  if (!emberCollaboratorId) return null;

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );
  if (activeConversation?.collaboratorId === emberCollaboratorId) {
    return activeConversation.id;
  }

  return conversations.find(
    (conversation) => conversation.collaboratorId === emberCollaboratorId
  )?.id ?? null;
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

/**
 * Resolves the identity and memory policy used when the living room opens the
 * existing chat. This only selects existing local records; it never creates,
 * renames, or imports a collaborator or conversation.
 */
export function resolveEmberChatEntryContext({
  personas,
  homeCollaboratorId,
  longTermMemoryRequested = false,
  ombreBrainAvailable = false
}: ResolveEmberChatEntryContextInput): EmberChatEntryContext {
  const identity = resolveEmberIdentityRoute({
    personas,
    homeCollaboratorId
  });
  const persona = personas.find((candidate) => candidate.id === identity.collaboratorId) ?? null;

  return {
    identity,
    memory: resolveEmberMemoryRoute({
      scene: 'chat',
      persona,
      longTermMemoryRequested,
      ombreBrainAvailable
    })
  };
}
