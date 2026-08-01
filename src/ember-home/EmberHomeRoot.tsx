import { useState } from 'react';
import { resolveConversationCollaboratorId } from '../engines/conversationOwnership';
import { useChatStore } from '../stores/chatStore';
import { usePersonaStore } from '../stores/personaStore';
import { useSpaceStore } from '../stores/spaceStore';
import { AppShell } from '../ui/AppShell';
import { resolveEmberChatEntryContext } from './emberContextRouting';
import { LivingRoom } from './LivingRoom';

type EmberHomeSurface = 'living-room' | 'chat';

export function EmberHomeRoot() {
  const [surface, setSurface] = useState<EmberHomeSurface>('living-room');

  const openChat = () => {
    const personaState = usePersonaStore.getState();
    const chatState = useChatStore.getState();
    const activeConversation = chatState.conversations.find(
      (conversation) => conversation.id === chatState.activeConversationId
    ) ?? null;
    const entry = resolveEmberChatEntryContext({
      personas: personaState.personas,
      conversationCollaboratorId: activeConversation
        ? resolveConversationCollaboratorId(activeConversation)
        : null,
      activeCollaboratorId: personaState.activeCollaboratorId
    });
    const spaceState = useSpaceStore.getState();

    if (entry.identity.collaboratorId) {
      personaState.setActiveCollaborator(entry.identity.collaboratorId);
      spaceState.setFrontstageCollaboratorId(entry.identity.collaboratorId);
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
