import { kvGet, kvSet } from '../infrastructure/persistence';
import type { Persona } from '../types/domain/persona';

const EMBER_HOME_BINDING_KEY = 'ember-home-binding-v1';

export type EmberHomeBinding = {
  version: 1;
  collaboratorId: string;
  mode: 'temporary' | 'migrated';
  updatedAt: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseEmberHomeBinding(value: unknown): EmberHomeBinding | null {
  if (!isRecord(value)) return null;
  if (value.version !== 1) return null;
  if (typeof value.collaboratorId !== 'string' || !value.collaboratorId.trim()) return null;
  if (value.mode !== 'temporary' && value.mode !== 'migrated') return null;
  if (typeof value.updatedAt !== 'number' || !Number.isFinite(value.updatedAt)) return null;

  return {
    version: 1,
    collaboratorId: value.collaboratorId,
    mode: value.mode,
    updatedAt: value.updatedAt
  };
}

export async function readEmberHomeBinding() {
  return parseEmberHomeBinding(await kvGet<unknown>(EMBER_HOME_BINDING_KEY));
}

export async function writeEmberHomeBinding(
  collaboratorId: string,
  mode: EmberHomeBinding['mode'] = 'temporary'
) {
  const binding: EmberHomeBinding = {
    version: 1,
    collaboratorId,
    mode,
    updatedAt: Date.now()
  };
  await kvSet(EMBER_HOME_BINDING_KEY, binding);
  return binding;
}

/**
 * Resolves the one local collaborator that Ember Home owns. A persisted
 * binding is authoritative. On first use only, an explicitly named Ember is
 * preferred, then the collaborator the user most recently activated.
 */
export function resolveInitialEmberHomeCollaboratorId({
  personas,
  persistedCollaboratorId,
  activeCollaboratorId
}: {
  personas: readonly Persona[];
  persistedCollaboratorId?: string | null;
  activeCollaboratorId?: string | null;
}) {
  if (persistedCollaboratorId) {
    return personas.some((persona) => persona.id === persistedCollaboratorId)
      ? persistedCollaboratorId
      : null;
  }

  const namedEmber = personas.find((persona) => persona.name.trim().toLowerCase() === 'ember');
  if (namedEmber) return namedEmber.id;

  if (activeCollaboratorId && personas.some((persona) => persona.id === activeCollaboratorId)) {
    return activeCollaboratorId;
  }

  return personas.find((persona) => persona.id === 'pharos')?.id ?? null;
}
