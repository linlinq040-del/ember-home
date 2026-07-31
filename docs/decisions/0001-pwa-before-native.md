# ADR 0001: finish the PWA before new native development

- Status: accepted
- Date: 2026-07-31

## Context

The inherited Polaris repository already contains Capacitor iOS and Android
shells. Ember Home needs iPhone/iPad-native capabilities eventually, but its
product plan requires all Web-capable features and layouts to be completed and
accepted as an installable PWA first.

## Decision

Treat inherited native directories as frozen reference material during PWA
development. Do not sync, build, extend, sign, or distribute them as part of
the current phase. Build new system integrations behind provider interfaces
with local or mock Web adapters, then replace those adapters in the native
phase.

## Consequences

- Product work remains testable from Windows.
- Native code cannot become a second implementation of unfinished behavior.
- Existing native code may be audited and selectively reused later.
- A deliberate reconciliation step is required when the PWA completion gate
  is met.
