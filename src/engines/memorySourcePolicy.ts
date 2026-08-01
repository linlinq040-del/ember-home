import type {
  ConversationMemoryContext,
  EmberMemoryRecallPurpose,
  EmberMemorySourceDescriptor,
  EmberMemorySourceDomain
} from '../types/domain';

export function defaultMemoryRetrievalPolicyForDomain(
  domain: EmberMemorySourceDomain
): EmberMemorySourceDescriptor['retrievalPolicy'] {
  if (domain === 'conversation') return 'general';
  if (domain === 'journal') return 'explicit-only';
  return 'blocked';
}

export function createConversationMemorySourceDescriptor(args: {
  conversationId: string;
  collaboratorId: string | null;
  sourceMessageIds: string[];
  memoryContext?: ConversationMemoryContext;
}): EmberMemorySourceDescriptor {
  return {
    domain: 'conversation',
    roomId: args.memoryContext?.roomId ?? 'chat',
    sourceRecordId: args.conversationId,
    sourceFragmentIds: [...args.sourceMessageIds],
    collaboratorId: args.collaboratorId,
    access: 'private-home',
    retrievalPolicy: 'general',
    ...(args.memoryContext?.contentRef ? { contentRef: args.memoryContext.contentRef } : {})
  };
}

export function isMemorySourceEligibleForRecall(
  source: EmberMemorySourceDescriptor | undefined,
  purpose: EmberMemoryRecallPurpose = 'ambient'
) {
  // Old conversation index rows have no descriptor. They remain readable as
  // private chat history while the index is rebuilt with provenance metadata.
  if (!source) return true;
  if (source.access === 'public') return false;
  const policyRank = { general: 0, 'explicit-only': 1, blocked: 2 } as const;
  const domainPolicy = defaultMemoryRetrievalPolicyForDomain(source.domain);
  const effectivePolicy = policyRank[source.retrievalPolicy] >= policyRank[domainPolicy]
    ? source.retrievalPolicy
    : domainPolicy;
  if (effectivePolicy === 'blocked') return false;
  return effectivePolicy === 'general' || purpose === 'explicit';
}

export function memorySourceFingerprint(source: EmberMemorySourceDescriptor) {
  return [
    source.domain,
    source.roomId ?? 'none',
    source.sourceRecordId,
    ...Array.from(new Set(source.sourceFragmentIds)).sort()
  ].join(':');
}
