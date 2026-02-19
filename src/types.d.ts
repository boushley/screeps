// Screeps provides a global console object
declare const console: {
  log(...args: unknown[]): void;
};

declare var global: {
  _parsedMemory?: Memory;
};

interface CreepMemory {
  role: string;
  task?: string;
  target?: Id<any>;
}

interface GameMemory {
  creepRunIndex?: number;
}

interface Memory {
  creeps: Record<string, CreepMemory>;
  rooms: Record<string, RoomMemory>;
  spawns: Record<string, SpawnMemory>;
  flags: Record<string, FlagMemory>;
  powerCreeps: Record<string, PowerCreepMemory>;
  game: GameMemory;
}
