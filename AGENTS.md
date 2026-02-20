# AGENTS.md

## Screeps Agent Guidance

This repository contains JavaScript/TypeScript scripts for [Screeps](https://screeps.com/), an MMO RTS game controlled through code.

## Required Screeps Docs Workflow

When implementing behavior that depends on game mechanics or API details:

1. Read `docs/screeps-overview.md` for game concepts.
2. Read `docs/screeps-api-overview.md` for API usage.
3. If needed, consult detailed docs:
   - Game guides: `docs/screeps/source/*.md`
   - API reference: `docs/screeps/api/source/*.md`

## Memory Rules (Critical)

Always use the optimized memory system in `src/memory.ts`.

- Initialize memory once per tick via `init()` and keep the reference:
  - Example: `const mem = initMemory()`
- Pass that memory reference into systems that need global state.
- Never access the global `Memory` object directly.
- Never rely on `global._parsedMemory` directly.

Use these memory sections:

- `creeps`
- `rooms`
- `spawns`
- `flags`
- `powerCreeps`
- `game`

For cross-tick bookkeeping, use `game` (`GameMemory`) instead of ad-hoc top-level keys.

Prototype-backed memory accessors are safe and preferred:

- `creep.mem`
- `room.mem`
- `spawn.mem`
- `flag.mem`
- `powerCreep.mem`

Do not use `.memory` on game objects. Use `.mem` only.

## Cached Calculation Rule

Any cached computed object stored in memory must include:

- `calculatedAt: number` set to `Game.time`

Consumers should use `Game.time - data.calculatedAt` to decide staleness and refresh timing.

## CPU Budget Rules

Screeps CPU is strict. Use helpers in `src/cpu.ts`:

- `hasCpu(expectedCost?)`

Guidelines:

- Use `hasCpu(estimatedCost)` before expensive work (e.g. pathfinding).
- Long-running tasks must be resumable across ticks.
- Break expensive jobs into incremental chunks and continue next tick if CPU is low.

## State Machine Rules

Before changing or adding stateful role logic, read:

- `docs/state-machines.md`

Follow that document's state machine conventions.

## Build Commands

- Install: `npm install`
- Build: `npm run build` (outputs `dist/main.js`) and copies it to clipboard
- Watch: `npm run watch`
- Validation without clipboard hang: use `npx tsc --noEmit` for type-check only, or `npx rollup -c` to verify bundle generation without `pbcopy`.

## Project Layout

- `src/` — TypeScript source (entry point: `src/main.ts`)
- `dist/` — bundled output for Screeps (`main.js`)

## Historical Git Context

Ignore repository history before commit `df3065c`.

- Files were cleared on February 18, 2026 at commit `df3065c`.
- Treat pre-`df3065c` history as irrelevant to current code decisions.
