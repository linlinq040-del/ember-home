export type EmberMigrationConfidence = 'high' | 'medium' | 'low';

export interface EmberMigrationPersonaInput {
  id: string;
  name: string;
}

export interface EmberMigrationConversationInput {
  collaboratorId: string | null;
  messageCount: number;
}

export interface EmberMigrationCandidate {
  collaboratorId: string;
  name: string;
  conversationCount: number;
  messageCount: number;
  confidence: EmberMigrationConfidence;
  reasons: string[];
}

export interface EmberMigrationPreview {
  packageType: 'polaris-export';
  personaCount: number;
  conversationCount: number;
  recommendedCollaboratorId: string | null;
  requiresConfirmation: true;
  candidates: EmberMigrationCandidate[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase();
}

export function buildEmberMigrationPreview(args: {
  personas: readonly EmberMigrationPersonaInput[];
  activeCollaboratorId?: string | null;
  conversations: readonly EmberMigrationConversationInput[];
}): EmberMigrationPreview {
  const candidates = args.personas.map((persona) => {
    const ownedConversations = args.conversations.filter(
      (conversation) => conversation.collaboratorId === persona.id
    );
    const exactName = normalizeName(persona.name) === 'ember';
    const active = persona.id === args.activeCollaboratorId;
    const reasons: string[] = [];

    if (exactName) reasons.push('角色名称与 Ember 完全匹配');
    if (active) reasons.push('备份中标记为当前角色');
    if (ownedConversations.length > 0) reasons.push(`拥有 ${ownedConversations.length} 个对话`);

    return {
      collaboratorId: persona.id,
      name: persona.name,
      conversationCount: ownedConversations.length,
      messageCount: ownedConversations.reduce((total, conversation) => total + conversation.messageCount, 0),
      confidence: exactName ? 'high' : active ? 'medium' : 'low',
      reasons
    } satisfies EmberMigrationCandidate;
  });

  const confidenceRank: Record<EmberMigrationConfidence, number> = { high: 3, medium: 2, low: 1 };
  candidates.sort((left, right) => {
    const confidenceDelta = confidenceRank[right.confidence] - confidenceRank[left.confidence];
    if (confidenceDelta !== 0) return confidenceDelta;
    const conversationDelta = right.conversationCount - left.conversationCount;
    if (conversationDelta !== 0) return conversationDelta;
    return right.messageCount - left.messageCount;
  });

  const first = candidates[0] ?? null;
  const second = candidates[1] ?? null;
  const uniqueBest = first && (
    !second
    || confidenceRank[first.confidence] > confidenceRank[second.confidence]
    || first.conversationCount > second.conversationCount
    || first.messageCount > second.messageCount
  );

  return {
    packageType: 'polaris-export',
    personaCount: args.personas.length,
    conversationCount: args.conversations.length,
    recommendedCollaboratorId: uniqueBest ? first.collaboratorId : null,
    requiresConfirmation: true,
    candidates
  };
}

export async function previewEmberMigrationPackage(file: Blob): Promise<EmberMigrationPreview> {
  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (header[0] !== 0x50 || header[1] !== 0x4b) {
    throw new Error('无法识别的备份格式：请选择 Polaris 导出的 zip 备份');
  }

  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) throw new Error('备份缺少 manifest.json');
  const manifest = JSON.parse(await manifestFile.async('string')) as unknown;
  if (!isRecord(manifest) || manifest.format !== 'polaris-export' || manifest.version !== 1) {
    throw new Error('这不是受支持的 Polaris 正式导出包');
  }

  const stores = isRecord(manifest.stores) ? manifest.stores : null;
  const personaPath = typeof stores?.persona === 'string' ? stores.persona : null;
  const chatPath = typeof stores?.chat === 'string' ? stores.chat : null;
  if (!personaPath || !chatPath) throw new Error('备份缺少角色或对话索引');

  const personaFile = zip.file(personaPath);
  const chatFile = zip.file(chatPath);
  if (!personaFile || !chatFile) throw new Error('备份缺少角色或对话数据');
  const personaState = JSON.parse(await personaFile.async('string')) as unknown;
  const chatState = JSON.parse(await chatFile.async('string')) as unknown;
  if (!isRecord(personaState) || !Array.isArray(personaState.personas)) {
    throw new Error('角色数据格式不正确');
  }
  if (!isRecord(chatState) || !Array.isArray(chatState.conversations)) {
    throw new Error('对话数据格式不正确');
  }

  const personas = personaState.personas.flatMap((value) => {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return [];
    return [{ id: value.id, name: value.name }];
  });
  const conversations = chatState.conversations.flatMap((value) => {
    if (!isRecord(value)) return [];
    const collaboratorId = typeof value.collaboratorId === 'string' ? value.collaboratorId : null;
    const messageCount = Array.isArray(value.messages) ? value.messages.length : 0;
    return [{ collaboratorId, messageCount }];
  });

  return buildEmberMigrationPreview({
    personas,
    activeCollaboratorId: typeof personaState.activeCollaboratorId === 'string'
      ? personaState.activeCollaboratorId
      : null,
    conversations
  });
}
