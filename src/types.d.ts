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
  deliveryTarget?: Id<any>;
  parkingPos?: string;
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
  role_count?: Record<string, number>;
  sourceAnalysis?: {
    safeSourceIds: string[];
    guardedSourceIds: string[];
    haulerSlotsBySourceId: Record<string, number>;
    calculatedAt: number;
  };
  strategyId?: import("./room-strategy").RoomStrategyId;
  strategyData?: {
    spawnFillAvg?: number;
    lastStorageAttempt?: number;
  };
  costMatrix?: {
    serialized: number[];
    penalties: number[];
    calculatedAt: number;
  };
  costMatrixDirty?: boolean;
  isPrimaryRoom?: boolean;
}

interface Memory {
  creeps: Record<string, CreepMemory>;
  rooms: Record<string, RoomMemory>;
  spawns: Record<string, SpawnMemory>;
  flags: Record<string, FlagMemory>;
  powerCreeps: Record<string, PowerCreepMemory>;
  game: GameMemory;
}

// Declaration merging: add `.mem` property that uses our optimized RawMemory parsing.
// Do NOT use the built-in `.memory` — it triggers the engine's default parser.
interface Creep {
  mem: CreepMemory;
}
interface Room {
  mem: RoomMemory;
}
interface StructureSpawn {
  mem: SpawnMemory;
}
interface Flag {
  mem: FlagMemory;
}
interface PowerCreep {
  mem: PowerCreepMemory;
}
