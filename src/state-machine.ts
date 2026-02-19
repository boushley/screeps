export type StateHandler = (creep: Creep) => void;
export type StateMap = Record<string, StateHandler>;

export function runStateMachine(
  creep: Creep,
  states: StateMap,
  defaultState: string,
): void {
  const state = creep.memory.task ?? defaultState;
  const handler = states[state];
  if (handler) {
    handler(creep);
  } else {
    // Unknown state — reset to default
    creep.memory.task = defaultState;
    states[defaultState]?.(creep);
  }
}
