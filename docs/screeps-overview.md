# Screeps Game Concepts Summary

Token-efficient reference for AI assistants and developers writing Screeps game scripts. For full details, see the referenced source files in `docs/screeps/source/`.

## Game Basics

Screeps is an MMO RTS where you control your colony by writing JavaScript. Your script runs in a persistent game loop — one iteration per **tick**. Each tick: all player scripts execute, then all actions resolve simultaneously. Rooms are 50x50 tile grids with terrain types: plain, swamp, wall. *(see: `introduction.md`, `game-loop.md`, `scripting-basics.md`)*

## Scripting Environment

- **`Game`** — main global; holds `creeps`, `spawns`, `rooms`, `structures`, `flags`, `time`, `cpu`, `map`, `market`
- **`Memory`** — persistent JSON object, auto-serialized each tick; accessed via `Memory.xxx`
- **`RawMemory`** — raw string access to memory (100 segments of 100KB each)
- **Modules** — use `require('module')` for code organization; lodash available as `_`
- **`console.log()`** — for debugging output

*(see: `global-objects.md`, `modules.md`)*

## Creeps

**Lifespan:** 1,500 ticks (CLAIM creeps: 600 ticks). Max 50 body parts.

### Body Parts

| Part | Cost | Effect per part |
|------|------|----------------|
| `MOVE` | 50 | -2 fatigue/tick |
| `WORK` | 100 | Harvest 2 energy/tick, build 5 energy/tick, repair 100 hits/tick (1 energy), dismantle 50 hits/tick, upgrade 1 energy/tick, harvest 1 mineral/tick |
| `CARRY` | 50 | +50 resource capacity |
| `ATTACK` | 80 | 30 hits/tick melee |
| `RANGED_ATTACK` | 150 | 10 hits/tick at range 1-3; mass attack: 10/4/1 hits at range 1/2/3 |
| `HEAL` | 250 | 12 hits/tick adjacent, 4 hits/tick ranged |
| `CLAIM` | 600 | Claim/reserve controllers, attack controller timer (-300 ticks/part) |
| `TOUGH` | 10 | No effect; just 100 extra HP. Boostable for damage resistance |

**HP:** 100 hits per body part. Damage destroys parts in spawn order (first-listed first).

### Movement & Fatigue

Each non-MOVE part generates fatigue on move: **1** on roads, **2** on plains, **10** on swamps. Each MOVE part reduces fatigue by 2/tick. Creep cannot move with fatigue > 0. Empty CARRY parts generate no fatigue.

**Rule of thumb:** equal MOVE parts to other parts = max speed (1 tile/tick on plains).

*(see: `creeps.md`)*

## Progression

### Global Control Level (GCL)

- Determines max rooms you can claim (1 room per GCL level)
- CPU limit: 20 base, +10 per GCL (max 300) if CPU unlocked
- GCL never decreases, persists through respawn
- Raised by upgrading any controller (even maxed RCL 8)

### Room Controller Level (RCL) & Structure Unlocks

| RCL | Energy to upgrade | Key unlocks |
|-----|-------------------|-------------|
| 0 | — | Roads, 5 Containers |
| 1 | 200 | + 1 Spawn |
| 2 | 45,000 | + 5 Extensions (50 cap), Walls, Ramparts (300K max) |
| 3 | 135,000 | + 10 Extensions, 1 Tower, Ramparts (1M) |
| 4 | 405,000 | + 20 Extensions, Storage, Ramparts (3M) |
| 5 | 1,215,000 | + 30 Extensions, 2 Links, 2 Towers, Ramparts (10M) |
| 6 | 3,645,000 | + 40 Extensions, Terminal, Extractor, 3 Labs, Ramparts (30M) |
| 7 | 10,935,000 | + 2 Spawns, 50 Extensions (100 cap), Factory, 4 Links, 6 Labs, 3 Towers, Ramparts (100M) |
| 8 | — (max) | + 3 Spawns, 60 Extensions (200 cap), Observer, Nuker, Power Spawn, 6 Links, 10 Labs, 6 Towers, Ramparts (300M) |

**Controller downgrade:** if not upgraded, timer ticks down (L1: 20K, L2: 10K, ... L8: 200K ticks). At 0, drops a level. Enemy creeps can `attackController` to accelerate downgrade.

*(see: `control.md`)*

## Resources & Economy

### Energy
- Harvested from `Source` objects (2 energy per WORK part per tick)
- Sources regenerate every 300 ticks (1,500/tick avg for a 3,000-capacity source)
- Main fuel for spawning, building, upgrading

### Minerals (7 base types)
`H` (Hydrogen), `O` (Oxygen), `U` (Utrium), `L` (Lemergium), `K` (Keanium), `Z` (Zynthium), `X` (Catalyst)

- One mineral type per room; requires Extractor (RCL 6) to harvest
- Combined in Labs to make compounds for creep boosting

### Boost Summary (Tier 1 / T2 / T3 multipliers)

| Part | Boost effect | T1 | T2 | T3 |
|------|-------------|----|----|-----|
| ATTACK | attack damage | +100% | +200% | +300% |
| RANGED_ATTACK | ranged damage | +100% | +200% | +300% |
| HEAL | heal power | +100% | +200% | +300% |
| WORK | harvest | +200% | +400% | +600% |
| WORK | build/repair | +50% | +80% | +100% |
| WORK | dismantle | +100% | +200% | +300% |
| WORK | upgradeController | +50% | +80% | +100% |
| CARRY | capacity | +50 | +100 | +150 |
| MOVE | fatigue reduction | +100% | +200% | +300% |
| TOUGH | damage reduction | -30% | -50% | -70% |

Boost cost: 30 mineral + 20 energy per body part.

### Commodities & Factory
- 4 raw deposit types from highway rooms: Metal, Silicon, Biomass, Mist (one per map quadrant)
- Factory (RCL 7) produces commodities; level set permanently by Power Creep's OPERATE_FACTORY
- 4 production chains (Mechanical, Electronical, Biological, Mystical) up to level 5
- Factory can also compress/decompress minerals and energy for storage

### Market
- `Game.market` for trading resources between players
- Terminal required (RCL 6) to send resources; energy cost scales with distance
- `createOrder`, `deal`, `calcTransactionCost`

*(see: `resources.md`, `market.md`)*

## Power

- Harvested from `StructurePowerBank` (highway rooms, 2M hits, reflects 50% damage)
- Processed via Power Spawn (50 energy + 1 power → 1 GPL point)
- Global Power Level (GPL) enables Power Creeps — immortal, level-up units with special abilities
- Power Creeps have powers like `OPERATE_SPAWN`, `OPERATE_FACTORY`, `OPERATE_EXTENSION`, etc.
- Must enable power in a room via `PowerCreep.enableRoom`

*(see: `power.md`)*

## Combat & Defense

### Safe Mode
- Duration: 20,000 ticks; cooldown: 50,000 ticks
- Blocks hostile creep actions in the room (not nukes)
- 1 activation gained per RCL gained; can also generate with 1,000 ghodium

### Passive Defense
- **Walls:** 1 energy to build, start at 1 HP, max 300M HP
- **Ramparts:** same as walls but also protect creeps/structures on the tile; decay -300 HP/100 ticks

### Active Defense
- **Towers:** range covers whole room; damage/heal/repair weakens with distance (600/400/800 at range ≤5; 150/100/200 at range ≥20); 10 energy per action
- **Creep defenders:** most effective behind ramparts

### NPC Invaders
- Spawn after ~100K energy mined in a room (only at exits to neutral rooms)
- 10% chance of raid (2-5 creeps with roles: melee, ranged, healer)
- Light creeps at RCL < 4, heavy at RCL ≥ 4
- **Strongholds:** NPC bases in sectors; destroying them stops invaders temporarily; contain loot

*(see: `defense.md`, `invaders.md`)*

## CPU & Performance

- **CPU limit:** 20 base (no subscription), or 10 per GCL (max 300) with CPU unlock
- **Bucket:** unused CPU rolls over, accumulates up to 10,000
- **Tick limit:** can burst up to 500 CPU/tick using bucket
- `Game.cpu.getUsed()` to measure, `Game.cpu.limit` / `Game.cpu.tickLimit` / `Game.cpu.bucket` to check

*(see: `cpu-limit.md`)*

## Action Resolution

Actions resolve simultaneously at tick end. Within a single creep, **conflicting actions** in the same pipeline: rightmost wins. Independent pipelines can execute together. Key combinable actions per tick:
- `moveTo` + `rangedMassAttack` + `heal` + `transfer` + `drop` + `pickup` + `claimController` — all OK together
- `harvest` vs `build` vs `repair` — same pipeline, only one executes

*(see: `simultaneous-actions.md`)*

## Other Topics

- **Start Areas:** Novice (GCL ≤ 3, isolated sectors) and Respawn areas *(see: `start-areas.md`)*
- **Respawning:** lose all rooms/creeps but keep GCL *(see: `respawn.md`)*
- **Initial spawn:** 300 energy, regenerates 1/tick until 300 in room *(see: `respawn.md`)*
