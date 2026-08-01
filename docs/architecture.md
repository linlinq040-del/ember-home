# Ember Home architecture

## Adaptation strategy

Preserve the inherited chat and LocalData cores while introducing Ember Home
as a product shell and a set of bounded modules. Avoid a broad rename or data
rewrite until behavior is protected by tests and migration fixtures.

```text
Ember Home PWA
├── Product shell
│   ├── EmberHomeFrame and one route owner
│   ├── Living room and shared bottom navigation
│   ├── Safe internal navigation
│   └── Room-specific context assembly
├── Existing chat orchestration
│   ├── EmberChatSurface (without the inherited outer AppShell)
│   ├── Streaming and sentence presentation
│   ├── Provider/model configuration
│   ├── Attachments, retry/edit, and tool evidence
│   └── Conversation history and themes
├── Memory router
│   ├── Current conversation
│   ├── Confirmed Ember memory
│   └── Cross-room summaries and source retrieval
├── LocalData
│   ├── Structured product facts
│   ├── Blobs/assets
│   ├── Import staging and validation
│   └── Browser KV/IndexedDB backend
├── Content and rooms
│   ├── ContentIndex
│   ├── Toy shelf → inherited cards
│   ├── Creation studio → independent workspaces
│   ├── Album → inherited image assets
│   ├── Study / theater / game adapters
│   └── Calendar / journal / pet / studio domains
└── Platform provider interfaces
    ├── PWA local or mock adapters
    └── Native adapters after the PWA completion gate

Optional external MCP tools
└── OmbreBrain (explicit invocation only; never a memory backend)
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
  external MCP calls, public-material queries, or logs.
- Ember Home never automatically reads from or writes to OmbreBrain. If the
  user enables it as an MCP tool, every use follows the tool's explicit scope;
  Ember identity, startup, migration, and continuity never depend on it.
- The word `room` is user-facing only for Ember Home scenes. Legacy field names
  such as `room`, `collectionShelf`, and `readPolarisKnowledge` may remain in
  compatibility code, but they do not define the product information model.
- Cards, workspaces, and image assets keep their existing LocalData identities.
  Shell convergence changes routes and projections, not durable records.
- A workspace is an independent multi-file project. Publishing a project result
  to the toy shelf is an explicit optional operation, never an automatic link.

## Settings ownership

```text
Chat-local settings
└── chat theme and presentation

Ember settings (living-room Ember avatar)
├── identity and prompt
├── memory
├── proactive messages
└── per-Ember request preferences

Ember Home settings (bottom of rooms page)
├── permissions and storage
├── backup and migration
├── providers and credentials
├── tools and MCP
└── diagnostics and platform-wide behavior
```

These settings surfaces may reuse inherited controllers and stores, but their
routes and labels follow Ember Home ownership. A global provider credential
must not be presented as Ember identity, and chat theme must not become a
whole-app settings page.

## Immediate implementation seam

The first living-room slice temporarily wraps the existing `AppShell`. That
seam has now served its purpose and is the source of the visible two-app split.
The next architectural step is to make `EmberHomeFrame` the single lifecycle
and route owner, then mount a shell-independent `EmberChatSurface` that reuses
the mature chat controllers and stores.

The inherited outer shell is retired only after parity checks cover multiple
conversations, history, streaming, tools, attachments, retry/edit, export,
themes, memory, and settings access. The legacy collection surface is then
decomposed by responsibility: conversations stay in chat, cards route to the
toy shelf, workspaces route to the creation studio, images route to the album,
and Ember configuration routes through the living-room avatar.
