import { useState } from 'react';
import { useSpaceStore } from '../stores/spaceStore';
import { AppShell } from '../ui/AppShell';
import { LivingRoom } from './LivingRoom';

type EmberHomeSurface = 'living-room' | 'chat';

export function EmberHomeRoot() {
  const [surface, setSurface] = useState<EmberHomeSurface>('living-room');

  const openChat = () => {
    useSpaceStore.getState().setWorld('chat');
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
