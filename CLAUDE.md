# Screeps Game Scripts

This repository contains JavaScript scripts for [Screeps](https://screeps.com/), an MMO RTS game controlled entirely through code.

## Screeps Reference Docs

When planning or implementing anything that depends on Screeps game mechanics or API:

1. **Read `docs/screeps-overview.md`** for game concepts (creeps, body parts, RCL progression, resources, combat, CPU limits)
2. **Read `docs/screeps-api-overview.md`** for API reference (Game object, Creep methods, Structure types, pathfinding, market)

These summaries are designed to give you enough context to write game scripts. When the summaries aren't sufficient, consult the detailed source docs:

- **Game guides:** `docs/screeps/source/*.md`
- **API reference:** `docs/screeps/api/source/*.md`

## Memory

Always use the efficient memory system from `src/memory.ts` instead of the default `Memory` global. Our memory module parses `RawMemory` once per tick and hijacks prototypes so that `creep.memory`, `room.memory`, etc. work automatically. Never access `Memory` directly — it bypasses our optimized parsing/serialization.

## CPU Limits

Screeps enforces strict CPU limits per tick. Any long-running work (e.g., scanning rooms, path caching, market analysis) must be designed to respect CPU budgets and be **resumable across ticks**. Break large tasks into incremental chunks that can pick up where they left off if CPU runs low.

## Build System

- **Setup:** `npm install`
- **Build:** `npm run build` — compiles TypeScript and bundles to `dist/main.js`
- **Watch:** `npm run watch` — rebuilds on file changes

## Project Structure

- `src/` — TypeScript source files (entry point: `src/main.ts`)
- `dist/` — Build output (single `main.js` for Screeps, gitignored)

## Ignore Old Repo Data
This repository contains commit data from 2015 that we want to ignore. All files were cleared out on Feb 18, 2026 at commit df3065c all git history from prior to that commit should be ignored.
