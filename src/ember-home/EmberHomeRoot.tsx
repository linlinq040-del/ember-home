import { useCallback, useEffect, useState } from 'react';
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

type EmberHomeSurface = 'living-room' | 'chat';

export function EmberHomeRoot() {
  const [surface, setSurface] = useState<EmberHomeSurface>('living-room');
  const [homeBinding, setHomeBinding] = useState<EmberHomeBinding | null>(null);
  const [bindingReady, setBindingReady] = useState(false);
  const [pendingChatOpen, setPendingChatOpen] = useState(false);
  const persistentStoreLifecycle = usePersistentStoreLifecycle();

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

  if (surface === 'living-room') {
    return <LivingRoom onOpenChat={openChat} />;
  }

  return (
    <div className="ember-chat-host">
      <AppShell
        onReturnHome={() => setSurface('living-room')}
        persistentStoreLifecycle={persistentStoreLifecycle}
      />
    </div>
  );
}
