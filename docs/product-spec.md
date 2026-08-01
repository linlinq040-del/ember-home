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
