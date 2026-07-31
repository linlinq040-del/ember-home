# Ember Home repository rules

This branch adapts Polaris into Ember Home. Read `docs/product-spec.md`,
`docs/development-plan.md`, and `docs/architecture.md` before product work.

## Non-negotiable product rules

- Ember is one continuous collaborator across every room. Rooms provide scene
  context and safe actions; they do not create replacement assistants.
- The product name and user-facing language are Ember Home. Polaris may appear
  only in source history, license notices, migration tooling, and technical
  audit documentation.
- Local-first is the default. Chat, journal, cycle, reading, and other private
  data stay on-device unless an explicitly documented feature requires sync.
- Private data and public-creation data are separate domains. Publishing,
  deletion, public replies, and account changes require explicit confirmation.
- App-internal navigation and ordinary room actions are not MCP tools.
- Load only the smallest scene-specific model context and tool set.
- Never place API keys, tokens, real private exports, health records, or other
  personal data in source, fixtures, logs, screenshots, or commits.

## Delivery order

- Complete and verify the PWA before adding new native implementation work.
- Existing `ios/` and `android/` directories are inherited Polaris code. Treat
  them as frozen reference material during the PWA phase; do not sync, build,
  or extend them unless the product plan explicitly enters the native phase.
- The first usable slice is: living room shell, complete chat, Ember identity
  and memory routing, migration preview, sentence bubbles, content index and
  safe natural-language navigation, then music adapters and the study.
- Do not start calendar, theater, game, publishing, widgets, CallKit, TestFlight,
  or App Store work early.

## Engineering expectations

- Preserve current LocalData ownership boundaries and import-before-promote
  migration semantics.
- New platform integrations use interfaces with local/mock PWA adapters first.
- Model-proposed actions are untrusted input. Resolve and validate stable local
  IDs in the client before execution, and cancel superseded actions.
- Add focused tests for behavior changes. Run typecheck, relevant tests, the
  full suite when practical, and a production Web build before handoff.
- Keep user-facing copy in Chinese unless a screen is explicitly multilingual.
- Keep changes small and reversible; do not rewrite working chat, memory,
  streaming, attachment, theme, or import systems without a measured reason.

## Licensing

The inherited code is AGPL-3.0-only. Preserve `LICENSE` and required notices.
Do not describe this branch as proprietary or closed-source without a verified
relicensing basis covering all relevant copyright holders.
