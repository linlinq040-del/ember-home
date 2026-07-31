# Ember Home development plan

This file is the repository-level execution summary. Detailed acceptance notes
belong in feature specifications and architecture decision records.

## Current phase: PWA foundation

1. Audit and run the inherited Polaris project on Windows.
2. Establish the Ember Home branch, repository rules, and living-room shell.
3. Deploy an installable HTTPS PWA and verify iPhone/iPad home-screen behavior.
4. Preserve and validate the complete chat workflow.
5. Connect Ember identity, chat memory, and OmbreBrain routing.
6. Preview one sanitized Polaris backup through a staged migration adapter.
7. Add sentence bubbles, scoped chat themes, `ContentIndex`, and validated
   natural-language navigation.
8. Add living-room music UI, mock music playback, and LRCLIB lyric matching.
9. Build the first study/reader slice.

## Later PWA phases

- Pet rules and deterministic local state.
- Calendar/reminders with local and simulated Apple adapters.
- Journals and separately encrypted cycle/body records.
- Voice messages and foreground real-time calls.
- Theater, game adapters, creation studio, and confirmation-based publishing.
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
