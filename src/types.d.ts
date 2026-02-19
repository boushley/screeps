// Screeps provides a global console object
declare const console: {
  log(...args: unknown[]): void;
};

declare var global: {
  _parsedMemory?: Memory;
};

interface CreepReservation {
  room: string;
  type: string;
  targetId: string;
}

interface CreepMemory {
  role: string;
  task?: string;
  target?: Id<any>;
  reservations?: CreepReservation[];
}

interface GameMemory {
  creepRunIndex?: number;
  lastReservationScan?: number;
}

interface RoomMemory {
  reservations?: {
    [type: string]: {
      [targetId: string]: string[];
    };
  };
}

interface Memory {
  creeps: Record<string, CreepMemory>;
  rooms: Record<string, RoomMemory>;
  spawns: Record<string, SpawnMemory>;
  flags: Record<string, FlagMemory>;
  powerCreeps: Record<string, PowerCreepMemory>;
  game: GameMemory;
}
