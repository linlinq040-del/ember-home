# Ember Home development plan

This file is the repository-level execution summary. Detailed acceptance notes
belong in feature specifications and architecture decision records.

## Current phase: PWA foundation

Current handoff and the next construction checklist are tracked in
[`next-work.md`](./next-work.md). The 2026-08-02 checkpoint has a working living
room, complete inherited chat, temporary Ember binding, unified product guide
and memory path, sentence bubbles, validated room navigation, and study/theater
navigation previews. The inherited chat still runs inside its old outer shell;
shell convergence, real relationship dates, music, and the first study slice
remain unfinished.

1. Audit and run the inherited Polaris project on Windows.
2. Establish the Ember Home branch, repository rules, and living-room shell.
3. Deploy an installable HTTPS PWA and verify iPhone/iPad home-screen behavior.
4. Preserve and validate the complete chat workflow.
5. Connect Ember identity to Ember Home's built-in unified memory. Keep
   OmbreBrain available only as an optional, explicitly invoked MCP tool.
6. Preview one sanitized Polaris backup through a staged migration adapter.
7. Add sentence bubbles, scoped chat themes, `ContentIndex`, and validated
   natural-language navigation.
8. Converge the inherited chat into one `EmberHomeFrame`: preserve multiple
   conversations and chat behavior, remove the user-facing legacy room world,
   and enforce the three-level settings ownership model.
9. Replace the living-room relationship-day mock with local relationship dates
   and anniversary countdowns.
10. Add living-room music UI, mock music playback, and LRCLIB lyric matching.
11. Build the first study/reader slice.

## Later PWA phases

- Pet rules and deterministic local state.
- Calendar/reminders with local and simulated Apple adapters.
- Journals and separately encrypted cycle/body records.
- Voice messages and foreground real-time calls.
- Toy room and toy shelf, photo album, creation studio, theater, game adapters,
  and confirmation-based publishing.
- Optional sync, backup, and narrowly scoped always-on services.

## Native phase gate

Only after the complete PWA passes iPhone/iPad acceptance:

- Reconcile or recreate the Capacitor/iOS shell from the stable Web frontend.
- Add Keychain, EventKit, MusicKit, read-only HealthKit, notifications, audio,
  files, sharing, WidgetKit, App Intents, and eventually CallKit.
- Configure cloud Mac builds, signing, and TestFlight.

The inherited Polaris `ios/` and `android/` directories do not waive this gate.
They remain frozen reference code during PWA development.

## Baseline recorded on 2026-07-31

- Node.js 24 LTS portable toolchain.
- TypeScript typecheck passed.
- Vite production Web build passed.
- Development server returned HTTP 200.
- The full suite initially passed 3046/3056 tests; the ten failures shared one
  Windows path-separator defect in a source-boundary test helper.
