# State Machine Pattern for Creep Roles

Stateful creep roles use a shared dispatch helper (`src/state-machine.ts`) to eliminate boilerplate and prevent bugs from raw string literals.

## Pattern Overview

Each stateful role has four parts:

1. **State constants** — `as const` string values (zero runtime cost)
2. **Transition function** — guards that update `creep.memory.task` based on conditions
3. **State handlers** — one function per state containing the behavior logic
4. **Dispatch** — `runStateMachine(creep, stateHandlers, defaultState)` looks up and calls the current state's handler

### Example Structure

```ts
import { runStateMachine, StateMap } from "../state-machine";

const STATE_COLLECTING = 'collecting' as const;
const STATE_WORKING = 'working' as const;

function transitions(creep: Creep): void {
  // Guard clauses that switch states based on conditions
  if (creep.memory.task === STATE_WORKING && creep.store.getUsedCapacity() === 0) {
    creep.memory.task = STATE_COLLECTING;
  }
  if (creep.memory.task !== STATE_WORKING && creep.store.getFreeCapacity() === 0) {
    creep.memory.task = STATE_WORKING;
  }
}

function runCollecting(creep: Creep): void { /* ... */ }
function runWorking(creep: Creep): void { /* ... */ }

const stateHandlers: StateMap = {
  [STATE_COLLECTING]: runCollecting,
  [STATE_WORKING]: runWorking,
};

// In the role's run method:
run(creep: Creep): void {
  transitions(creep);
  runStateMachine(creep, stateHandlers, STATE_COLLECTING);
}
```

## Rules

- **Always use `as const` string constants** for state names. Never use raw string literals like `'collecting'` in role code.
- **All state constants are defined in the role file** that uses them, even if the string value is the same across roles (e.g., each role defines its own `STATE_COLLECTING`).
- **Transitions run before dispatch** so a creep that just changed state executes the new state in the same tick.

## Adding a New State to an Existing Role

1. Add a new `const STATE_X = 'x' as const;`
2. Write a `runX(creep: Creep)` handler function
3. Add the entry to `stateHandlers`: `[STATE_X]: runX`
4. Add transition guards in `transitions()` for entering/leaving the state

## Creating a New Stateful Role

1. Import `runStateMachine` and `StateMap` from `../state-machine`
2. Define all state constants in the role file (e.g., `STATE_COLLECTING`, `STATE_WORKING`)
3. Write `transitions()`, state handler functions, and a `stateHandlers` map
4. Call `transitions(creep); runStateMachine(creep, stateHandlers, defaultState);` in the role's `run` method

## When NOT to Use a State Machine

Simple reactive roles (like `harvester` or `warrior`) that don't track multi-tick state via `creep.memory.task` don't need this pattern. If a role just reacts to the current game state each tick without remembering what it was doing, keep it as straightforward if/else logic.
