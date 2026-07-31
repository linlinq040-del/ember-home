# Ember Home architecture

## Adaptation strategy

Preserve the inherited chat and LocalData cores while introducing Ember Home
as a product shell and a set of bounded modules. Avoid a broad rename or data
rewrite until behavior is protected by tests and migration fixtures.

```text
Ember Home PWA
├── Product shell
│   ├── Living room
│   ├── Safe internal navigation
│   └── Room-specific context assembly
├── Existing chat orchestration
│   ├── Streaming and sentence presentation
│   ├── Provider/model configuration
│   ├── Attachments, retry/edit, and tool evidence
│   └── Conversation history and themes
├── Memory router
│   ├── Current conversation
│   ├── Chat retrieval
│   └── OmbreBrain long-term memory (on demand)
├── LocalData
│   ├── Structured product facts
│   ├── Blobs/assets
│   ├── Import staging and validation
│   └── Browser KV/IndexedDB backend
├── Content and rooms
│   ├── ContentIndex
│   ├── Study / theater / game adapters
│   └── Calendar / journal / pet / studio domains
└── Platform provider interfaces
    ├── PWA local or mock adapters
    └── Native adapters after the PWA completion gate
```

## Boundary rules

- LocalData remains the source of truth for durable product facts. UI/runtime
  stores are projections, not competing persistence systems.
- Imports are scanned and staged before promotion. Existing user data is not
  overwritten by default.
- `NavigationContext` contains only current room/content and recent unfinished
  content references; it does not duplicate chat or media bodies.
- Model actions carry intent, never authoritative file paths or object IDs.
  The client resolves `ContentIndex`, validates existence and permission, then
  executes after the response completes.
- Provider interfaces isolate PWA mocks from later EventKit, MusicKit, and
  HealthKit implementations.
- Raw health, journal, and cycle data never enter broad chat retrieval,
  OmbreBrain, public-material queries, or logs.

## Immediate implementation seam

The first living-room slice wraps the existing `AppShell` instead of adding a
fourth inherited `World`. This keeps the mature chat/world transition system
unchanged while product navigation is defined. Once the route contract and
room persistence are stable, rooms can move behind a dedicated Ember Home
router without rewriting chat internals.
