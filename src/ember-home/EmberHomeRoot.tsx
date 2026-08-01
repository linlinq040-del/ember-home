import { useCallback, useEffect, useRef, useState } from 'react';
import { usePersistentStoreLifecycle } from '../app/bootstrap/usePersistentStoreLifecycle';
import { resolveConversationCollaboratorId } from '../engines/conversationOwnership';
import { reportPersistenceError } from '../infrastructure/persistenceDiagnostics';
import { useChatStore } from '../stores/chatStore';
import { usePersonaStore } from '../stores/personaStore';
import { useRuntimeStore } from '../stores/runtimeStore';
import { useSpaceStore } from '../stores/spaceStore';
import { AppShell } from '../ui/AppShell';
import {
  resolveEmberChatEntryContext,
  resolveEmberConversationId
} from './emberContextRouting';
import {
  readEmberHomeBinding,
  resolveInitialEmberHomeCollaboratorId,
  writeEmberHomeBinding,
  type EmberHomeBinding
} from './emberHomeBinding';
import { LivingRoom } from './LivingRoom';
import type { EmberPreviewRoomId } from './EmberRoomPreview';
import {
  resolveEmberRoomIntent,
  validateEmberRoomTarget
} from './emberRoomNavigation';
import type { EmberContentIndexEntry } from './contentIndex';

type EmberHomeSurface = 'living-room' | 'chat';

export function EmberHomeRoot() {
  const [surface, setSurface] = useState<EmberHomeSurface>('living-room');
  const [livingRoomPage, setLivingRoomPage] = useState<'home' | EmberPreviewRoomId>('home');
  const [homeBinding, setHomeBinding] = useState<EmberHomeBinding | null>(null);
  const [bindingReady, setBindingReady] = useState(false);
  const [pendingChatOpen, setPendingChatOpen] = useState(false);
  const persistentStoreLifecycle = usePersistentStoreLifecycle();
  const pendingRoomNavigationRef = useRef<{
    conversationId: string;
    userMessageId: string;
    entry: EmberContentIndexEntry;
  } | null>(null);

  useEffect(() => {
    if (!persistentStoreLifecycle.startupStoresReady) return;
    let cancelled = false;

    void readEmberHomeBinding()
      .then((binding) => {
        if (!cancelled) setHomeBinding(binding);
      })
      .catch((error) => {
        reportPersistenceError({
          label: '[ember-home]',
          store: 'ember-home-binding',
          operation: 'read'
        }, error);
      })
      .finally(() => {
        if (!cancelled) setBindingReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [persistentStoreLifecycle.startupStoresReady]);

  const enterChat = useCallback(async () => {
    const personaState = usePersonaStore.getState();
    const chatState = useChatStore.getState();
    const homeCollaboratorId = resolveInitialEmberHomeCollaboratorId({
      personas: personaState.personas,
      persistedCollaboratorId: homeBinding?.collaboratorId,
      activeCollaboratorId: personaState.activeCollaboratorId
    });
    const entry = resolveEmberChatEntryContext({
      personas: personaState.personas,
      homeCollaboratorId
    });
    const spaceState = useSpaceStore.getState();

    if (entry.identity.collaboratorId) {
      if (!homeBinding) {
        try {
          const nextBinding = await writeEmberHomeBinding(
            entry.identity.collaboratorId,
            'temporary'
          );
          setHomeBinding(nextBinding);
          useRuntimeStore.getState().setToolPromptGroupEnabled('memoryWrite', true);
        } catch (error) {
          reportPersistenceError({
            label: '[ember-home]',
            store: 'ember-home-binding',
            operation: 'write'
          }, error);
          window.alert('临时 Ember 的本地绑定保存失败，请稍后重试。');
          return;
        }
      }
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
    } else {
      window.alert('这个家绑定的临时 Ember 已不存在。请先恢复该协作者，再进入聊天室。');
      return;
    }
    spaceState.setWorld('chat');
    setSurface('chat');
  }, [homeBinding]);

  const openChat = () => {
    if (!persistentStoreLifecycle.startupStoresReady || !bindingReady) {
      setPendingChatOpen(true);
      return;
    }
    void enterChat();
  };

  useEffect(() => {
    if (!pendingChatOpen || !persistentStoreLifecycle.startupStoresReady || !bindingReady) return;
    setPendingChatOpen(false);
    void enterChat();
  }, [bindingReady, enterChat, pendingChatOpen, persistentStoreLifecycle.startupStoresReady]);

  useEffect(() => {
    if (surface !== 'chat') {
      pendingRoomNavigationRef.current = null;
      return;
    }

    const initialState = useChatStore.getState();
    const seenUserMessageIds = new Set(
      initialState.conversations.flatMap((conversation) => conversation.messages)
        .filter((message) => message.role === 'user' && !message.toolInvocation)
        .map((message) => message.id)
    );

    const unsubscribe = useChatStore.subscribe((state) => {
      const conversation = state.conversations.find(
        (candidate) => candidate.id === state.activeConversationId
      );
      if (!conversation) return;
      const unseen = conversation.messages.filter((message) => (
        message.role === 'user'
        && !message.toolInvocation
        && !seenUserMessageIds.has(message.id)
      ));
      for (const message of unseen) seenUserMessageIds.add(message.id);
      const latestUserMessage = unseen[unseen.length - 1];
      if (!latestUserMessage) return;

      const entry = resolveEmberRoomIntent(latestUserMessage.content);
      pendingRoomNavigationRef.current = entry ? {
        conversationId: conversation.id,
        userMessageId: latestUserMessage.id,
        entry
      } : null;
    });

    const handleAssistantPresented = (event: Event) => {
      const pending = pendingRoomNavigationRef.current;
      if (!pending) return;
      const messageId = (event as CustomEvent<{ messageId?: string }>).detail?.messageId;
      if (!messageId) return;

      const state = useChatStore.getState();
      const conversation = state.conversations.find((candidate) => candidate.id === pending.conversationId);
      if (!conversation || state.activeConversationId !== pending.conversationId) return;
      const userIndex = conversation.messages.findIndex((message) => message.id === pending.userMessageId);
      const assistantIndex = conversation.messages.findIndex((message) => message.id === messageId);
      if (userIndex < 0 || assistantIndex <= userIndex) return;
      const superseded = conversation.messages.slice(userIndex + 1, assistantIndex + 1)
        .some((message) => message.role === 'user' && !message.toolInvocation);
      if (superseded) {
        pendingRoomNavigationRef.current = null;
        return;
      }

      const target = validateEmberRoomTarget(pending.entry);
      pendingRoomNavigationRef.current = null;
      if (!target) return;
      setLivingRoomPage(target);
      setSurface('living-room');
    };

    window.addEventListener('ember-home:assistant-presented', handleAssistantPresented);
    return () => {
      unsubscribe();
      window.removeEventListener('ember-home:assistant-presented', handleAssistantPresented);
    };
  }, [surface]);

  if (surface === 'living-room') {
    return <LivingRoom initialPage={livingRoomPage} onOpenChat={openChat} />;
  }

  return (
    <div className="ember-chat-host">
      <AppShell
        onReturnHome={() => {
          pendingRoomNavigationRef.current = null;
          setLivingRoomPage('home');
          setSurface('living-room');
        }}
        persistentStoreLifecycle={persistentStoreLifecycle}
      />
    </div>
  );
}
