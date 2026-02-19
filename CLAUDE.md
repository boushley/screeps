# Screeps Game Scripts

This repository contains JavaScript scripts for [Screeps](https://screeps.com/), an MMO RTS game controlled entirely through code.

## Screeps Reference Docs

When planning or implementing anything that depends on Screeps game mechanics or API:

1. **Read `docs/screeps-overview.md`** for game concepts (creeps, body parts, RCL progression, resources, combat, CPU limits)
2. **Read `docs/screeps-api-overview.md`** for API reference (Game object, Creep methods, Structure types, pathfinding, market)

These summaries are designed to give you enough context to write game scripts. When the summaries aren't sufficient, consult the detailed source docs:

- **Game guides:** `docs/screeps/source/*.md`
- **API reference:** `docs/screeps/api/source/*.md`

## Build System

- **Setup:** `npm install`
- **Build:** `npm run build` — compiles TypeScript and bundles to `dist/main.js`
- **Watch:** `npm run watch` — rebuilds on file changes

## Project Structure

- `src/` — TypeScript source files (entry point: `src/main.ts`)
- `dist/` — Build output (single `main.js` for Screeps, gitignored)
