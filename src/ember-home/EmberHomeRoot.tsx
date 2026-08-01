import { useEffect, useRef, useState } from 'react';
import { createUid } from '../engines/id';
import { useChatStore } from '../stores/chatStore';
import { usePersonaStore } from '../stores/personaStore';
import { useSpaceStore } from '../stores/spaceStore';
import { AppShell } from '../ui/AppShell';
import { LivingRoom } from './LivingRoom';

type EmberHomeSurface = 'living-room' | 'chat';

function EmberChat() {
  const personasHydrated = usePersonaStore((state) => state.hydrated);
  const chatHydrated = useChatStore((state) => state.hydrated);
  const activeWorld = useSpaceStore((state) => state.activeWorld);
  const bootstrapStarted = useRef(false);

  useEffect(() => {
    if (!personasHydrated || !chatHydrated || activeWorld === 'chat') return;
    useSpaceStore.getState().setWorld('chat');
  }, [activeWorld, chatHydrated, personasHydrated]);

  useEffect(() => {
    if (!personasHydrated || !chatHydrated || bootstrapStarted.current) return;
    bootstrapStarted.current = true;

    const personaState = usePersonaStore.getState();
    const ember =
      personaState.personas.find((persona) => persona.name.trim().toLowerCase() === 'ember') ??
      personaState.personas.find((persona) => persona.id === 'pharos') ??
      personaState.personas[0] ??
      null;

    if (!ember) return;

    if (ember.name !== 'Ember' || ember.description !== '一直在家的生活搭档') {
      personaState.updateCollaborator(ember.id, {
        name: 'Ember',
        description: '一直在家的生活搭档',
        purpose: '陪琳琳聊天，也和她一起把生活慢慢安顿好。'
      });
    }
    personaState.setActiveCollaborator(ember.id);
    useSpaceStore.getState().setFrontstageCollaboratorId(ember.id);
    useSpaceStore.getState().setWorld('chat');

    const chatState = useChatStore.getState();
    const existingConversation = chatState.conversations.find(
      (conversation) => conversation.kind !== 'group' && conversation.collaboratorId === ember.id
    );
    const conversationId = existingConversation?.id ?? chatState.createConversation(ember.id);
    const refreshedChatState = useChatStore.getState();
    const conversation = refreshedChatState.conversations.find((item) => item.id === conversationId);

    if (conversation && conversation.messages.length === 0) {
      const writable = refreshedChatState.getConversationWritable(conversationId);
      if (writable) {
        refreshedChatState.addMessage(writable, {
          id: createUid('m'),
          role: 'assistant',
          content: '我在。新家刚刚亮灯，先坐下来和我说说话吧。',
          timestamp: Date.now(),
          origin: 'assistant-reply',
          assistantName: 'Ember',
          speakerCollaboratorId: ember.id
        });
        refreshedChatState.renameConversation(conversationId, '新家的第一晚');
      }
    }

    useChatStore.getState().setActiveConversation(conversationId);
    void usePersonaStore.getState().persistToDb();
    void useChatStore.getState().persistToDb();
  }, [chatHydrated, personasHydrated]);

  return <AppShell />;
}

export function EmberHomeRoot() {
  const [surface, setSurface] = useState<EmberHomeSurface>('living-room');

  const openChat = () => {
    document.documentElement.dataset.polarisLayoutSurface = 'phone';
    useSpaceStore.getState().setWorld('chat');
    setSurface('chat');
  };

  if (surface === 'living-room') {
    return <LivingRoom onOpenChat={openChat} />;
  }

  return (
    <div className="ember-chat-host">
      <button
        className="ember-chat-host__home-button"
        type="button"
        onClick={() => setSurface('living-room')}
        aria-label="返回客厅"
      >
        <span aria-hidden="true">⌂</span>
        <span>客厅</span>
      </button>
      <EmberChat />
    </div>
  );
}
