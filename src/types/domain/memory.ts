export type EmberMemoryRoomId =
  | 'living-room'
  | 'chat'
  | 'study'
  | 'theater'
  | 'music'
  | 'other';

export type EmberMemorySourceDomain =
  | 'conversation'
  | 'journal'
  | 'health'
  | 'cycle'
  | 'public-creation';

export type EmberMemoryAccessClass = 'private-home' | 'public';
export type EmberMemoryRetrievalPolicy = 'general' | 'explicit-only' | 'blocked';
export type EmberMemoryRecallPurpose = 'ambient' | 'explicit';

export type EmberMemoryContentRef = {
  kind: 'book' | 'film' | 'track' | 'other';
  id: string;
};

export type EmberMemorySourceDescriptor = {
  domain: EmberMemorySourceDomain;
  roomId: EmberMemoryRoomId | null;
  sourceRecordId: string;
  sourceFragmentIds: string[];
  collaboratorId: string | null;
  access: EmberMemoryAccessClass;
  retrievalPolicy: EmberMemoryRetrievalPolicy;
  contentRef?: EmberMemoryContentRef;
};

export type ConversationMemoryContext = {
  roomId: EmberMemoryRoomId;
  contentRef?: EmberMemoryContentRef;
};
