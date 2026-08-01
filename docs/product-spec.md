# Ember Home product specification

## Product promise

Ember Home is a private, local-first home for 琳琳 and Ember. Ember is the
continuous center of the product; the living room, chat, study, music corner,
journal, calendar, theater, game room, pet, and studio are shared contexts and
tools rather than separate assistants.

The interface is simple, readable, and useful on iPhone portrait and iPad
landscape. Room names organize functions; Ember Home is not a simulated 2D or
3D house.

## Core principles

1. **One Ember:** identity, tone, relationship, and memory persist across rooms.
2. **One product:** inherited Polaris capabilities become Ember Home behavior;
   Polaris is not presented as a user-visible sub-product.
3. **Local first:** version one needs no custom always-on cloud service.
4. **iOS-first layout, PWA-first delivery:** Web behavior is completed and
   tested on iPhone/iPad before new native work begins.
5. **Strict privacy boundaries:** journals, cycle data, complete chats, health
   data, public materials, and shared records have separate access rules.
6. **Small context and tool budgets:** provide only current-scene facts and
   capabilities; cache expensive derived data by content fingerprint.

## First usable product slice

- A living-room home with a clear route into the existing chat.
- A permanently conversational chat layout with optional sentence bubbles.
- Existing streaming, provider configuration, retry/edit, attachment, tool
  evidence, context, themes, and conversation history preserved.
- Ember identity plus Ember Home's built-in unified memory across chat and
  room contexts. OmbreBrain remains an optional MCP tool, not a memory backend
  or migration dependency.
- Local migration preview for a Polaris export before any data is promoted.
- A local `ContentIndex` and validated natural-language navigation actions.
- Music UI with a mock `MusicProvider` and LRCLIB `LyricsProvider` during PWA.

## Information architecture and terminology

- **Room** is reserved for Ember Home life scenes such as the living room,
  study, theater, toy room, album, and creation studio. An inherited Polaris
  collection surface must not remain user-visible as another kind of room.
- **Conversation** means one chat thread. Chat keeps new conversation, history,
  switching, branching, rename, export, and deletion. Multiple conversations
  belong to the same Ember and share only confirmed or retrieved memory rather
  than an ever-growing raw context.
- Inherited cards move to the toy room's toy shelf. Card IDs, contents, asset
  references, edit/run behavior, and tool-card behavior remain intact.
- Inherited workspaces remain independent project environments and move to the
  creation studio. They are not automatically attached to toys. A project may
  be explicitly published as a toy snapshot later, but creating or deleting
  either side does not mutate the other by default.
- Inherited images move to the album as views over the existing asset store.
  Personal photos, Ember-generated images, and project materials retain source
  and privacy metadata; cards and projects reference assets instead of copying
  them.

## Three levels of settings

1. **Chat settings:** the chat-local button keeps only chat theme and chat
   presentation controls.
2. **Ember settings:** tapping Ember's avatar from the living room opens
   identity, prompt, memory, proactive-message, and request-preference pages.
3. **Ember Home settings:** the entry at the bottom of the rooms page governs
   the whole app, including permissions, storage, backup, providers, tools,
   MCP, diagnostics, and other platform-wide behavior.

Global provider credentials are Ember Home settings. Per-Ember request
preferences are Ember settings. Shell convergence must not flatten these three
ownership levels into one generic settings page.

## Product manual strategy

`Ember Home 使用手册` is the authoritative model-facing product document. It is
updated as each feature becomes real. The model reads a compact chapter index
first and retrieves only relevant chapters, so the completed manual may be
large without being injected into every conversation. At PWA completion, the
manual receives a full editorial pass to remove stale inherited instructions,
verify every user-facing path, and keep Polaris names only where required for
migration, compatibility, or technical audit.

## Safety boundaries

- Navigation may execute automatically only after the displayed reply completes
  and the client validates the destination.
- Ambiguous titles or recent-content references require clarification.
- Publishing, public replies, deletion, blocking, and account changes require
  explicit confirmation.
- Shell commands are never exposed to Ember as product tools.
- HealthKit is read-only in the later native phase; raw health data stays local
  and is not copied into memory or model context.

## PWA completion gate

PWA completion means planned Web features work after restart and pass iPhone
and iPad home-screen testing. Until that gate passes, no new Capacitor project,
signing, widgets, CallKit, TestFlight, or App Store workflow is started.
