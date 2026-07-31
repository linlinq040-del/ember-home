import { useState } from 'react';
import { AppShell } from '../ui/AppShell';
import { LivingRoom } from './LivingRoom';

type EmberHomeSurface = 'living-room' | 'chat';

export function EmberHomeRoot() {
  const [surface, setSurface] = useState<EmberHomeSurface>('living-room');

  if (surface === 'living-room') {
    return <LivingRoom onOpenChat={() => setSurface('chat')} />;
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
      <AppShell />
    </div>
  );
}
