import { useState } from 'react';
import { resolveConversationCollaboratorId } from '../engines/conversationOwnership';
import { useChatStore } from '../stores/chatStore';
import { usePersonaStore } from '../stores/personaStore';
import { useSpaceStore } from '../stores/spaceStore';
import { AppShell } from '../ui/AppShell';
import {
  resolveEmberChatEntryContext,
  resolveEmberConversationId
} from './emberContextRouting';
import { LivingRoom } from './LivingRoom';

type EmberHomeSurface = 'living-room' | 'chat';

export function EmberHomeRoot() {
  const [surface, setSurface] = useState<EmberHomeSurface>('living-room');

  const openChat = () => {
    const personaState = usePersonaStore.getState();
    const chatState = useChatStore.getState();
    const entry = resolveEmberChatEntryContext({
      personas: personaState.personas
    });
    const spaceState = useSpaceStore.getState();

    if (entry.identity.collaboratorId) {
      const emberConversationId = resolveEmberConversationId({
        conversations: chatState.conversations.map((conversation) => ({
          id: conversation.id,
          collaboratorId: resolveConversationCollaboratorId(conversation)
        })),
        activeConversationId: chatState.activeConversationId,
        emberCollaboratorId: entry.identity.collaboratorId
      });

      personaState.setActiveCollaborator(entry.identity.collaboratorId);
      spaceState.setFrontstageCollaboratorId(entry.identity.collaboratorId);
      if (emberConversationId) {
        chatState.setActiveConversation(emberConversationId);
      } else {
        chatState.createConversation(entry.identity.collaboratorId);
      }
    }
    spaceState.setWorld('chat');
    setSurface('chat');
  };

  if (surface === 'living-room') {
    return <LivingRoom onOpenChat={openChat} />;
  }

  return (
    <div className="ember-chat-host">
      <AppShell onReturnHome={() => setSurface('living-room')} />
    </div>
  );
}
